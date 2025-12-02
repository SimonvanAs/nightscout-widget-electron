/**
 * Tauri API wrapper to replace electronAPI
 * This provides a compatible interface for the frontend code
 */

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

class TauriLogger {
  async info(msg) {
    console.log(`[INFO] ${msg}`);
  }

  async warn(msg) {
    console.warn(`[WARN] ${msg}`);
  }

  async error(msg) {
    console.error(`[ERROR] ${msg}`);
  }
}

class TauriDialog {
  async showMessageBox(options) {
    return await invoke('show_message_box', {
      kind: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
    });
  }

  async showMessageBoxSync(options) {
    return this.showMessageBox(options);
  }
}

const electronAPI = {
  closeWindow: async () => {
    const window = getCurrentWindow();
    await invoke('close_window', {});
  },
  
  showSettings: async () => {
    await invoke('show_settings', {});
  },
  
  getVersion: async () => {
    return await invoke('get_version', {});
  },
  
  getSettings: async () => {
    return await invoke('get_settings', {});
  },
  
  setSettings: async (data) => {
    await invoke('set_settings', { data });
  },
  
  testAgeVisibility: async (show) => {
    await invoke('test_age_visibility', { show });
  },
  
  setAgeVisibility: (callback) => {
    listen('set-age-visibility', (event) => {
      callback(event, event.payload);
    });
  },
  
  openSite: async (siteName) => {
    await invoke('open_site', { siteName });
  },
  
  openLogFile: async () => {
    await invoke('open_log_file', {});
  },
  
  restart: async () => {
    await invoke('restart', {});
  },
  
  logger: new TauriLogger(),
  
  dialog: new TauriDialog(),
  
  checkFormValidation: async () => {
    await invoke('check_validation', {});
  },
  
  getTranslate: async (language) => {
    return await invoke('get_translate', { language });
  },
  
  getLanguage: async () => {
    return await invoke('get_language', {});
  },
  
  setLanguage: async (language) => {
    await invoke('set_language', { language });
  },
  
  testUnits: async (isMMOL) => {
    await invoke('test_units', { isMmol: isMMOL });
  },
  
  setUnits: (callback) => {
    listen('set-units', (event) => {
      callback(event, event.payload);
    });
  },
  
  testCalcTrend: async (calcTrend, isMMOL) => {
    await invoke('test_calc_trend', { calcTrend, isMmol: isMMOL });
  },
  
  setCalcTrend: (callback) => {
    listen('set-calc-trend', (event) => {
      const [calcTrend, isMMOL] = event.payload;
      callback(event, calcTrend, isMMOL);
    });
  },
};

// Expose to window for compatibility
window.electronAPI = electronAPI;

export default electronAPI;

