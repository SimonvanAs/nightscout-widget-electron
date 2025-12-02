// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod logger;
mod updater;

use config::{Config, ConfigError};
use logger::setup_logger;
use std::sync::Mutex;
use tauri::{
    AppHandle, Manager, PhysicalPosition, PhysicalSize, State, Window, WindowEvent,
};
use tauri_plugin_dialog::MessageDialogKind;

type ConfigState = Mutex<Config>;

#[derive(Clone, serde::Serialize)]
struct WindowPosition {
    x: i32,
    y: i32,
}

// Command: Get settings
#[tauri::command]
async fn get_settings(config: State<'_, ConfigState>) -> Result<serde_json::Value, String> {
    let config = config.lock().unwrap();
    config.get_all().map_err(|e| e.to_string())
}

// Command: Set settings
#[tauri::command]
async fn set_settings(
    data: serde_json::Value,
    config: State<'_, ConfigState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut config = config.lock().unwrap();
    
    // Update config values
    if let Some(obj) = data.as_object() {
        if let Some(url) = obj.get("nightscout-url").and_then(|v| v.as_str()) {
            config.set("NIGHTSCOUT.URL", url.to_string())?;
        }
        if let Some(token) = obj.get("nightscout-token").and_then(|v| v.as_str()) {
            config.set("NIGHTSCOUT.TOKEN", token.to_string())?;
        }
        if let Some(interval) = obj.get("nightscout-interval").and_then(|v| v.as_i64()) {
            config.set("NIGHTSCOUT.INTERVAL", interval as i32)?;
        }
        if let Some(age_limit) = obj.get("age-limit").and_then(|v| v.as_i64()) {
            config.set("WIDGET.AGE_LIMIT", age_limit as i32)?;
        }
        if let Some(show_age) = obj.get("show-age").and_then(|v| v.as_bool()) {
            config.set("WIDGET.SHOW_AGE", show_age)?;
        }
        if let Some(units_in_mmol) = obj.get("units-in-mmol").and_then(|v| v.as_bool()) {
            config.set("WIDGET.UNITS_IN_MMOL", units_in_mmol)?;
        }
        if let Some(calc_trend) = obj.get("calc-trend").and_then(|v| v.as_bool()) {
            config.set("WIDGET.CALC_TREND", calc_trend)?;
        }
        if let Some(bg_high) = obj.get("bg-high").and_then(|v| v.as_f64()) {
            config.set("BG.HIGH", bg_high)?;
        }
        if let Some(bg_low) = obj.get("bg-low").and_then(|v| v.as_f64()) {
            config.set("BG.LOW", bg_low)?;
        }
        if let Some(bg_target_top) = obj.get("bg-target-top").and_then(|v| v.as_f64()) {
            config.set("BG.TARGET.TOP", bg_target_top)?;
        }
        if let Some(bg_target_bottom) = obj.get("bg-target-bottom").and_then(|v| v.as_f64()) {
            config.set("BG.TARGET.BOTTOM", bg_target_bottom)?;
        }
    }
    
    // Update widget position from main window
    if let Some(main_window) = app.get_window("main") {
        if let Ok(position) = main_window.outer_position() {
            config.set("WIDGET.POSITION.x", position.x)?;
            config.set("WIDGET.POSITION.y", position.y)?;
        }
    }
    
    Ok(())
}

// Command: Get version
#[tauri::command]
async fn get_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

// Command: Get language
#[tauri::command]
async fn get_language(config: State<'_, ConfigState>) -> Result<String, String> {
    let config = config.lock().unwrap();
    
    if let Ok(lang) = config.get::<String>("LANGUAGE") {
        if !lang.is_empty() {
            return Ok(lang);
        }
    }
    
    // Get system language
    let system_lang = std::env::var("LANG")
        .unwrap_or_else(|_| "en".to_string())
        .split('.')
        .next()
        .unwrap_or("en")
        .split('_')
        .next()
        .unwrap_or("en")
        .to_lowercase();
    
    Ok(system_lang)
}

// Command: Set language
#[tauri::command]
async fn set_language(
    language: String,
    config: State<'_, ConfigState>,
) -> Result<(), String> {
    let mut config = config.lock().unwrap();
    config.set("LANGUAGE", language).map_err(|e| e.to_string())
}

// Command: Get translate
#[tauri::command]
async fn get_translate(language: String, app: AppHandle) -> Result<serde_json::Value, String> {
    let resource_path = app
        .path_resolver()
        .resource_dir()
        .ok_or("Resource directory not found")?;
    
    let locale_path = resource_path
        .join("localization")
        .join("locales")
        .join(format!("{}.json", language));
    
    // Try to read the translation file
    match std::fs::read_to_string(&locale_path) {
        Ok(content) => {
            serde_json::from_str(&content).map_err(|e| format!("Failed to parse translation: {}", e))
        }
        Err(_) => {
            // Fallback to English
            let fallback_path = resource_path
                .join("localization")
                .join("locales")
                .join("en.json");
            
            match std::fs::read_to_string(&fallback_path) {
                Ok(content) => {
                    serde_json::from_str(&content).map_err(|e| format!("Failed to parse fallback translation: {}", e))
                }
                Err(_) => Ok(serde_json::json!({})),
            }
        }
    }
}

// Command: Show message box
#[tauri::command]
async fn show_message_box(
    app: AppHandle,
    kind: String,
    title: String,
    message: String,
) -> Result<usize, String> {
    let window = app.get_window("main").or_else(|| app.get_window("settings"));
    
    let dialog_kind = match kind.as_str() {
        "error" => MessageDialogKind::Error,
        "warning" => MessageDialogKind::Warning,
        "info" => MessageDialogKind::Info,
        _ => MessageDialogKind::Info,
    };
    
    // Tauri dialog is async, but we'll use a simple message for now
    // In a real implementation, you'd use the dialog plugin properly
    log::info!("Dialog [{}]: {} - {}", kind, title, message);
    
    Ok(0)
}

// Command: Open site
#[tauri::command]
async fn open_site(
    site_name: String,
    config: State<'_, ConfigState>,
    app: AppHandle,
) -> Result<(), String> {
    let url = match site_name.as_str() {
        "nightscout" => {
            let config = config.lock().unwrap();
            config.get::<String>("NIGHTSCOUT.URL").map_err(|e| e.to_string())?
        }
        "poeditor" => "https://poeditor.com/join/project/PzcEMSOFc7".to_string(),
        _ => return Err("Unknown site".to_string()),
    };
    
    app.shell()
        .open(url, None)
        .map_err(|e| e.to_string())
}

// Command: Open log file
#[tauri::command]
async fn open_log_file(app: AppHandle) -> Result<(), String> {
    let log_dir = app
        .path_resolver()
        .app_log_dir()
        .ok_or("Log directory not found")?;
    
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(log_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(log_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(log_dir)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

// Command: Restart app
#[tauri::command]
async fn restart(app: AppHandle) {
    app.restart();
}

// Command: Close window
#[tauri::command]
async fn close_window(window: Window, app: AppHandle) {
    if window.label() == "main" {
        app.exit(0);
    } else {
        window.hide().unwrap_or_default();
    }
}

// Command: Show settings
#[tauri::command]
async fn show_settings(
    config: State<'_, ConfigState>,
    app: AppHandle,
) -> Result<(), String> {
    let config = config.lock().unwrap();
    let position = config.get::<WindowPosition>("WIDGET.POSITION").map_err(|e| e.to_string())?;
    
    let settings_window = app
        .get_window("settings")
        .ok_or("Settings window not found")?;
    
    let settings_width = 800;
    let settings_x = position.x - settings_width;
    let settings_y = position.y;
    
    settings_window
        .set_position(PhysicalPosition::new(settings_x, settings_y))
        .map_err(|e| e.to_string())?;
    settings_window.show().map_err(|e| e.to_string())
}

// Command: Test age visibility
#[tauri::command]
async fn test_age_visibility(show: bool, app: AppHandle) {
    if let Some(window) = app.get_window("main") {
        window.emit("set-age-visibility", show).ok();
    }
}

// Command: Test units
#[tauri::command]
async fn test_units(is_mmol: bool, config: State<'_, ConfigState>, app: AppHandle) -> Result<(), String> {
    let mut config = config.lock().unwrap();
    config.set("WIDGET.UNITS_IN_MMOL", is_mmol).map_err(|e| e.to_string())?;
    
    if let Some(window) = app.get_window("main") {
        window.emit("set-units", is_mmol).ok();
    }
    if let Some(window) = app.get_window("settings") {
        window.emit("set-units", is_mmol).ok();
    }
    
    Ok(())
}

// Command: Test calc trend
#[tauri::command]
async fn test_calc_trend(
    calc_trend: bool,
    is_mmol: bool,
    config: State<'_, ConfigState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut config = config.lock().unwrap();
    config.set("WIDGET.CALC_TREND", calc_trend).map_err(|e| e.to_string())?;
    
    if let Some(window) = app.get_window("main") {
        window.emit("set-calc-trend", (calc_trend, is_mmol)).ok();
    }
    
    Ok(())
}

// Command: Check validation
#[tauri::command]
async fn check_validation(
    config: State<'_, ConfigState>,
    app: AppHandle,
) -> Result<(), String> {
    let config = config.lock().unwrap();
    
    if let Err(e) = config.validate() {
        if let Some(window) = app.get_window("settings") {
            let error_message = format!("Config invalid: {}", e);
            window.emit("config-validation-error", error_message).ok();
        }
    }
    
    Ok(())
}

fn main() {
    // Setup logger
    setup_logger();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Initialize config
            let config = match Config::new(app.app_handle().clone()) {
                Ok(c) => c,
                Err(e) => {
                    log::error!("Failed to initialize config: {}", e);
                    return Err(e.into());
                }
            };
            app.manage(Mutex::new(config));
            
            // Setup windows with initial positions
            let app_handle = app.app_handle().clone();
            if let Ok(config_state) = app.try_state::<ConfigState>() {
                let config = config_state.lock().unwrap();
                let position = config
                    .get::<WindowPosition>("WIDGET.POSITION")
                    .unwrap_or(WindowPosition { x: 1000, y: 100 });
                
                if let Some(main_window) = app.get_window("main") {
                    let _ = main_window.set_position(PhysicalPosition::new(position.x, position.y));
                }
                
                // Setup settings window position
                if let Some(settings_window) = app.get_window("settings") {
                    let settings_width = 800;
                    let settings_x = position.x - settings_width;
                    let settings_y = position.y;
                    
                    let _ = settings_window.set_position(PhysicalPosition::new(settings_x, settings_y));
                    
                    // Show settings window if config is invalid
                    if config.validate().is_err() {
                        let _ = settings_window.show();
                    }
                }
            }
            
            // Request update check
            updater::check_for_updates(app_handle);
            
            Ok(())
        })
        .on_window_event(|event| {
            match event.event() {
                WindowEvent::Moved(position) => {
                    if event.window().label() == "main" {
                        if let Ok(state) = event.window().app_handle().try_state::<ConfigState>() {
                            let mut config = state.lock().unwrap();
                            let _ = config.set("WIDGET.POSITION.x", position.x);
                            let _ = config.set("WIDGET.POSITION.y", position.y);
                            
                            // Update settings window position
                            if let Some(settings_window) = event.window().app_handle().get_window("settings") {
                                let settings_width = 800;
                                let settings_x = position.x - settings_width;
                                let settings_y = position.y;
                                
                                let _ = settings_window.set_position(PhysicalPosition::new(settings_x, settings_y));
                            }
                        }
                    }
                }
                WindowEvent::CloseRequested { .. } => {
                    if event.window().label() == "settings" {
                        let _ = event.window().hide();
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            get_version,
            get_language,
            set_language,
            get_translate,
            show_message_box,
            open_site,
            open_log_file,
            restart,
            close_window,
            show_settings,
            test_age_visibility,
            test_units,
            test_calc_trend,
            check_validation,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

