"use strict";

/**
 * Backend Service - Main service for Nightscout API communication
 * @module services/BackendService
 */

import { TokenService } from "./TokenService.js";
import { DataService } from "./DataService.js";
import { ConfigService } from "./ConfigService.js";

/**
 * BackendService class - Main service for API communication
 * Encapsulates all backend functionality and replaces global state
 */
export class BackendService {
  /**
   * @param {object} config - Configuration object
   * @param {object} config.nightscout - Nightscout configuration
   * @param {Function} config.logger - Logger function
   * @param {Function} [config.getSettingsFn] - Function to get settings
   * @param {Function} [config.setSettingsFn] - Function to set settings
   * @param {Function} [config.fetchFn] - Fetch function (for testing)
   */
  constructor(config) {
    this.logger = config.logger;
    
    // Initialize config service
    this.configService = new ConfigService(
      config.initialConfig || {},
      config.getSettingsFn,
      config.setSettingsFn
    );

    // Initialize token service
    this.tokenService = new TokenService({
      nightscout: config.nightscout,
      logger: config.logger,
      fetchFn: config.fetchFn
    });

    // Initialize data service
    this.dataService = new DataService({
      tokenService: this.tokenService,
      baseUrl: config.nightscout.url,
      endpoints: {
        DATA: `/api/v3/entries`,
        TEST: `/api/v3/status`,
        FALLBACK_DATA: `/api/v2/entries/sgv`,
        FALLBACK_TEST: `/api/v2/status`
      },
      logger: config.logger,
      fetchFn: config.fetchFn,
      requestTimeout: config.requestTimeout || 10000
    });
  }

  /**
   * Fetches glucose data from Nightscout API
   * @param {Function} onSuccess - Success callback with data
   * @param {Function} onError - Error callback with error message
   * @returns {Promise<void>} Promise that resolves when request completes
   */
  async getData(onSuccess, onError) {
    try {
      const data = await this.dataService.getData();
      onSuccess(data);
    } catch (error) {
      onError(error.message);
    }
  }

  /**
   * Tests connection to Nightscout API
   * @param {object} testParams - Test parameters
   * @param {string} testParams.url - Nightscout base URL
   * @param {string} testParams.token - Access token
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   * @returns {Promise<void>} Promise that resolves when request completes
   */
  async getStatus(testParams, onSuccess, onError) {
    try {
      const status = await this.dataService.getStatus(testParams);
      onSuccess(status);
    } catch (error) {
      onError(error.message);
    }
  }

  /**
   * Gets the configuration service
   * @returns {ConfigService} The configuration service
   */
  getConfigService() {
    return this.configService;
  }

  /**
   * Gets the token service
   * @returns {TokenService} The token service
   */
  getTokenService() {
    return this.tokenService;
  }

  /**
   * Gets the data service
   * @returns {DataService} The data service
   */
  getDataService() {
    return this.dataService;
  }
}

