"use strict";

/**
 * Token Service - Manages JWT token lifecycle
 * @module services/TokenService
 */

import { maskToken, validateToken, validateUrl, validateTokenResponse, constructSecureUrl } from "../security.js";
import { TOKEN_REFRESH_BUFFER_MS } from "../constants.js";

/**
 * TokenService class for managing authentication tokens
 */
export class TokenService {
  /**
   * @param {object} config - Configuration object
   * @param {object} config.nightscout - Nightscout configuration
   * @param {string} config.nightscout.url - Nightscout base URL
   * @param {string} config.nightscout.token - Access token
   * @param {Function} config.logger - Logger function
   * @param {Function} config.fetchFn - Fetch function (for testing)
   */
  constructor(config) {
    this.config = config;
    this.logger = config.logger;
    this.fetchFn = config.fetchFn || fetch;
    this.token = null;
    this.expiration = 0;
  }

  /**
   * Checks if the token has expired (with buffer time)
   * @returns {boolean} True if token is expired or will expire soon
   */
  hasTokenExpired() {
    const now = Date.now();
    const expirationWithBuffer = this.expiration - TOKEN_REFRESH_BUFFER_MS;
    return now > expirationWithBuffer;
  }

  /**
   * Gets the current token, refreshing if necessary
   * @returns {Promise<string>} The JWT token
   */
  async getToken() {
    if (!this.token || this.hasTokenExpired()) {
      await this.refreshToken();
    }
    return this.token;
  }

  /**
   * Refreshes the JWT token from the API
   * @returns {Promise<void>}
   * @throws {Error} If token validation, URL validation, or API request fails
   */
  async refreshToken() {
    const params = {
      url: this.config.nightscout.url,
      token: this.config.nightscout.token
    };

    // Validate token before making request
    const tokenValidation = validateToken(params.token);
    if (!tokenValidation.valid) {
      this.logger.error(`Token validation failed: ${tokenValidation.error}`);
      throw new Error(tokenValidation.error);
    }

    // Validate URL
    const urlValidation = validateUrl(params.url);
    if (!urlValidation.valid) {
      this.logger.error(`URL validation failed: ${urlValidation.error}`);
      throw new Error(urlValidation.error);
    }

    // Construct secure URL
    const urlResult = constructSecureUrl(params.url, `/api/v2/authorization/request`, params.token);
    if (!urlResult.valid) {
      this.logger.error(`URL construction failed: ${urlResult.error}`);
      throw new Error(urlResult.error);
    }

    const maskedToken = maskToken(params.token);
    this.logger.info(`Requesting JWT token for ${maskedToken}`);

    try {
      const response = await this.fetchFn(urlResult.url.href);
      
      if (!response.ok) {
        throw new Error(`Failed to obtain token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      const responseValidation = validateTokenResponse(data);
      if (!responseValidation.valid) {
        this.logger.error(`Token response validation failed: ${responseValidation.error}`);
        this.clearToken();
        throw new Error(responseValidation.error);
      }

      this.token = data.token;
      this.expiration = responseValidation.expirationInMillis;

      const maskedResponseToken = maskToken(data.token);
      this.logger.info(`JWT token obtained successfully (${maskedResponseToken})`);
    } catch (error) {
      const maskedToken = maskToken(params.token);
      this.logger.error(`Failed to obtain JWT token: ${error.message} for ${maskedToken}`);
      this.clearToken();
      throw error;
    }
  }

  /**
   * Clears the stored token
   */
  clearToken() {
    this.token = null;
    this.expiration = 0;
  }

  /**
   * Sets the token directly (for testing or manual setting)
   * @param {string} token - The JWT token
   * @param {number} expiration - Expiration timestamp in milliseconds
   */
  setToken(token, expiration) {
    this.token = token;
    this.expiration = expiration;
  }
}

