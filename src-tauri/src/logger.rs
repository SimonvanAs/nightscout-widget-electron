use log::LevelFilter;
use std::env;
use tauri::AppHandle;

pub fn setup_logger() {
    let is_dev = env::var("NODE_ENV")
        .map(|v| v == "development")
        .unwrap_or(false);
    
    let level = if is_dev {
        LevelFilter::Debug
    } else {
        LevelFilter::Warn
    };
    
    env_logger::Builder::from_default_env()
        .filter_level(level)
        .init();
}

pub fn get_log_file_path(app: AppHandle) -> Option<std::path::PathBuf> {
    app.path_resolver().app_log_dir()
}

