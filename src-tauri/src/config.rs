use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug)]
pub enum ConfigError {
    IoError(std::io::Error),
    JsonError(serde_json::Error),
    ValidationError(String),
    NotFound(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::IoError(e) => write!(f, "IO error: {}", e),
            ConfigError::JsonError(e) => write!(f, "JSON error: {}", e),
            ConfigError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            ConfigError::NotFound(key) => write!(f, "Key not found: {}", key),
        }
    }
}

impl std::error::Error for ConfigError {}

impl From<std::io::Error> for ConfigError {
    fn from(err: std::io::Error) -> Self {
        ConfigError::IoError(err)
    }
}

impl From<serde_json::Error> for ConfigError {
    fn from(err: serde_json::Error) -> Self {
        ConfigError::JsonError(err)
    }
}

pub struct Config {
    app: AppHandle,
    data: HashMap<String, Value>,
    config_path: PathBuf,
    defaults: Value,
}

impl Config {
    pub fn new(app: AppHandle) -> Result<Self, ConfigError> {
        let config_dir = app
            .path_resolver()
            .app_config_dir()
            .ok_or_else(|| ConfigError::NotFound("Config directory not found".to_string()))?;
        
        fs::create_dir_all(&config_dir)?;
        
        let config_path = config_dir.join("config.json");
        
        // Load defaults
        let defaults = json!({
            "NIGHTSCOUT": {
                "URL": "https://your-nightscout-site.com",
                "TOKEN": "your-access-token-here",
                "INTERVAL": 60
            },
            "BG": {
                "HIGH": 10.0,
                "LOW": 3.5,
                "TARGET": {
                    "TOP": 8.5,
                    "BOTTOM": 4.5
                }
            },
            "WIDGET": {
                "SHOW_AGE": true,
                "AGE_LIMIT": 20,
                "POSITION": {
                    "x": 1000,
                    "y": 100
                },
                "UNITS_IN_MMOL": true,
                "CALC_TREND": false
            },
            "LAST_UPDATE_REQUEST": "1/1/2000",
            "IS_FIRST_RUN": true,
            "LANGUAGE": "en"
        });
        
        // Load existing config or use defaults
        let data = if config_path.exists() {
            let content = fs::read_to_string(&config_path)?;
            let mut loaded: HashMap<String, Value> = serde_json::from_str(&content)?;
            
            // Merge with defaults
            if let Some(defaults_obj) = defaults.as_object() {
                for (key, value) in defaults_obj {
                    loaded.entry(key.clone()).or_insert_with(|| value.clone());
                }
            }
            
            loaded
        } else {
            let mut data = HashMap::new();
            if let Some(defaults_obj) = defaults.as_object() {
                for (key, value) in defaults_obj {
                    data.insert(key.clone(), value.clone());
                }
            }
            data
        };
        
        // Remove JWT_EXPIRATION if it exists (legacy cleanup)
        let mut config = Config {
            app: app.clone(),
            data,
            config_path,
            defaults,
        };
        
        if config.has("JWT_EXPIRATION") {
            config.delete("JWT_EXPIRATION")?;
        }
        
        Ok(config)
    }
    
    pub fn get<T>(&self, key: &str) -> Result<T, ConfigError>
    where
        T: serde::de::DeserializeOwned,
    {
        let keys: Vec<&str> = key.split('.').collect();
        let mut current: &Value = &json!(self.data);
        
        for k in keys {
            if let Some(obj) = current.as_object() {
                current = obj.get(k).ok_or_else(|| ConfigError::NotFound(key.to_string()))?;
            } else {
                return Err(ConfigError::NotFound(key.to_string()));
            }
        }
        
        serde_json::from_value(current.clone()).map_err(ConfigError::JsonError)
    }
    
    pub fn set<T>(&mut self, key: &str, value: T) -> Result<(), ConfigError>
    where
        T: serde::Serialize,
    {
        let keys: Vec<&str> = key.split('.').collect();
        let value_json = serde_json::to_value(value)?;
        
        if keys.len() == 1 {
            self.data.insert(keys[0].to_string(), value_json);
        } else {
            // Get or create the root object
            let root_key = keys[0].to_string();
            let root_value = self.data.entry(root_key.clone())
                .or_insert_with(|| json!({}));
            
            // Ensure it's an object
            if !root_value.is_object() {
                *root_value = json!({});
            }
            
            let mut current = root_value.as_object_mut()
                .ok_or_else(|| ConfigError::ValidationError("Invalid config structure".to_string()))?;
            
            // Navigate/create nested structure
            for k in &keys[1..keys.len() - 1] {
                let entry = current.entry(k.to_string())
                    .or_insert_with(|| json!({}));
                
                if !entry.is_object() {
                    *entry = json!({});
                }
                
                current = entry.as_object_mut()
                    .ok_or_else(|| ConfigError::ValidationError("Invalid config structure".to_string()))?;
            }
            
            // Set the final value
            current.insert(keys[keys.len() - 1].to_string(), value_json);
        }
        
        self.save()
    }
    
    pub fn has(&self, key: &str) -> bool {
        let keys: Vec<&str> = key.split('.').collect();
        let mut current: &Value = &json!(self.data);
        
        for k in keys {
            if let Some(obj) = current.as_object() {
                if let Some(val) = obj.get(k) {
                    current = val;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        
        true
    }
    
    pub fn delete(&mut self, key: &str) -> Result<(), ConfigError> {
        let keys: Vec<&str> = key.split('.').collect();
        
        if keys.len() == 1 {
            self.data.remove(keys[0]);
        } else {
            let mut current = self.data.get_mut(keys[0])
                .and_then(|v| v.as_object_mut())
                .ok_or_else(|| ConfigError::NotFound(key.to_string()))?;
            
            for k in &keys[1..keys.len() - 1] {
                current = current
                    .get_mut(*k)
                    .and_then(|v| v.as_object_mut())
                    .ok_or_else(|| ConfigError::NotFound(key.to_string()))?;
            }
            
            current.remove(keys[keys.len() - 1]);
        }
        
        self.save()
    }
    
    pub fn get_all(&self) -> Result<Value, ConfigError> {
        Ok(json!(self.data))
    }
    
    pub fn size(&self) -> usize {
        self.data.len()
    }
    
    pub fn clear(&mut self) -> Result<(), ConfigError> {
        self.data.clear();
        if let Some(defaults_obj) = self.defaults.as_object() {
            for (key, value) in defaults_obj {
                self.data.insert(key.clone(), value.clone());
            }
        }
        self.save()
    }
    
    pub fn validate(&self) -> Result<(), ConfigError> {
        // Basic validation - check required fields
        let required_fields = vec![
            "NIGHTSCOUT.URL",
            "NIGHTSCOUT.TOKEN",
            "NIGHTSCOUT.INTERVAL",
            "BG.HIGH",
            "BG.LOW",
            "BG.TARGET.TOP",
            "BG.TARGET.BOTTOM",
            "WIDGET.AGE_LIMIT",
            "WIDGET.POSITION.x",
            "WIDGET.POSITION.y",
        ];
        
        for field in required_fields {
            if !self.has(field) {
                return Err(ConfigError::ValidationError(format!("Missing required field: {}", field)));
            }
        }
        
        // Validate URL format
        if let Ok(url) = self.get::<String>("NIGHTSCOUT.URL") {
            if !url.starts_with("http://") && !url.starts_with("https://") {
                return Err(ConfigError::ValidationError("Invalid URL format".to_string()));
            }
        }
        
        Ok(())
    }
    
    fn save(&self) -> Result<(), ConfigError> {
        let json = serde_json::to_string_pretty(&self.data)?;
        fs::write(&self.config_path, json)?;
        Ok(())
    }
}

