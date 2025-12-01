"use strict";

/**
 * Config Service - Manages application configuration
 * @module services/ConfigService
 */

/**
 * ConfigService class for managing application configuration
 */
export class ConfigService {
  /**
   * @param {object} initialConfig - Initial configuration object
   * @param {Function} getSettingsFn - Function to get settings from Electron
   * @param {Function} setSettingsFn - Function to set settings in Electron
   */
  constructor(initialConfig, getSettingsFn, setSettingsFn) {
    this.config = { ...initialConfig };
    this.getSettingsFn = getSettingsFn;
    this.setSettingsFn = setSettingsFn;
  }

  /**
   * Gets a configuration value by path
   * @param {string} path - Dot-separated path (e.g., 'NIGHTSCOUT.URL')
   * @returns {*} The configuration value
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  /**
   * Sets a configuration value by path
   * @param {string} path - Dot-separated path (e.g., 'NIGHTSCOUT.URL')
   * @param {*} value - The value to set
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) {
        obj[key] = {};
      }
      return obj[key];
    }, this.config);
    target[lastKey] = value;
  }

  /**
   * Gets the entire configuration object
   * @returns {object} The configuration object
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Updates configuration from Electron store
   * @returns {Promise<void>}
   */
  async refresh() {
    if (this.getSettingsFn) {
      this.config = await this.getSettingsFn();
    }
  }

  /**
   * Saves configuration to Electron store
   * @returns {Promise<void>}
   */
  async save() {
    if (this.setSettingsFn) {
      await this.setSettingsFn(this.config);
    }
  }
}

