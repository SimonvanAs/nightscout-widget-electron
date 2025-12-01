"use strict";

/**
 * Data Service - Manages data fetching from Nightscout API
 * @module services/DataService
 */

import { TokenService } from "./TokenService.js";

/**
 * DataService class for fetching data from Nightscout API
 */
export class DataService {
  /**
   * @param {object} config - Configuration object
   * @param {TokenService} config.tokenService - Token service instance
   * @param {object} config.endpoints - API endpoints
   * @param {string} config.baseUrl - Base URL for API requests
   * @param {Function} config.logger - Logger function
   * @param {Function} config.fetchFn - Fetch function (for testing)
   */
  constructor(config) {
    this.tokenService = config.tokenService;
    this.endpoints = config.endpoints;
    this.baseUrl = config.baseUrl || '';
    this.logger = config.logger;
    this.fetchFn = config.fetchFn || fetch;
    this.requestTimeout = config.requestTimeout || 10000;
  }

  /**
   * Creates a fetch request with timeout
   * @param {string} method - HTTP method
   * @param {URL|string} url - Request URL
   * @param {object} [options] - Fetch options
   * @returns {Promise<Response>} Fetch response promise
   */
  async createRequest(method, url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await this.fetchFn(url, {
        method,
        headers: {
          'Accept': 'application/json',
          ...options.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout reached: ${this.requestTimeout} ms.`);
      }
      
      throw error;
    }
  }

  /**
   * Fetches glucose data from Nightscout API
   * @param {object} [params] - Optional parameters
   * @param {number} [params.limit] - Number of records to fetch
   * @returns {Promise<object>} The data object
   */
  async getData(params = {}) {
    const limit = params.limit || 10;
    const token = await this.tokenService.getToken();
    
    const url = new URL(this.baseUrl + this.endpoints.DATA);
    url.searchParams.set('sort$desc', 'date');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('fields', 'sgv,direction,date');
    url.searchParams.set('type$eq', 'sgv');

    try {
      const response = await this.createRequest('GET', url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          this.logger.warn('Fallback to API v2 call due to 403 error');
          return this.getDataFallback(params);
        }
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('403')) {
        return this.getDataFallback(params);
      }
      throw error;
    }
  }

  /**
   * Fallback to API v2 when v3 returns 403
   * @param {object} [params] - Optional parameters
   * @returns {Promise<object>} The data object
   */
  async getDataFallback(params = {}) {
    const limit = params.limit || 10;
    const token = await this.tokenService.getToken();
    
    const url = new URL(this.baseUrl + this.endpoints.FALLBACK_DATA);
    url.searchParams.set('count', limit.toString());

    const response = await this.createRequest('GET', url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Transform v2 format to v3 format
    return {
      status: 200,
      result: Array.isArray(data) ? data.map(item => ({
        direction: item.direction,
        sgv: item.sgv,
        date: item.mills
      })) : []
    };
  }

  /**
   * Tests connection to Nightscout API
   * @param {object} testParams - Test parameters
   * @param {string} testParams.url - Nightscout base URL
   * @param {string} testParams.token - Access token
   * @returns {Promise<object>} The status object
   */
  async getStatus(testParams) {
    const baseUrl = testParams.url || this.baseUrl;
    const url = new URL(baseUrl + this.endpoints.TEST);
    const token = await this.tokenService.getToken();

    try {
      const response = await this.createRequest('GET', url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          return this.getStatusFallback(testParams);
        }
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('403')) {
        return this.getStatusFallback(testParams);
      }
      throw error;
    }
  }

  /**
   * Fallback status check using API v2
   * @param {object} testParams - Test parameters
   * @returns {Promise<object>} The status object
   */
  async getStatusFallback(testParams) {
    const baseUrl = testParams.url || this.baseUrl;
    const url = new URL(baseUrl + this.endpoints.FALLBACK_TEST);
    const token = await this.tokenService.getToken();

    const response = await this.createRequest('GET', url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

