"use strict";

import { MILLISECONDS_PER_SECOND } from "./constants.js";

/**
 * Security utilities for token masking and input validation
 * @module security
 */

/**
 * Masks a token for safe logging (shows first 4 and last 4 characters)
 * @param {string|null|undefined} token - The token to mask
 * @returns {string} Masked token string (e.g., "abcd...xyz1")
 */
export const maskToken = (token) => {
  if (!token || typeof token !== `string` || token.trim() === ``) {
    return `***`;
  }

  if (token.length <= 8) {
    return `***`;
  }

  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
};

/**
 * Validates a token format
 * @param {string|null|undefined} token - The token to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateToken = (token) => {
  if (!token) {
    return { valid: false, error: `Token is undefined or missing` };
  }

  if (typeof token !== `string`) {
    return { valid: false, error: `Token must be a string` };
  }

  if (token.trim() === ``) {
    return { valid: false, error: `Token cannot be empty` };
  }

  if (token.length < 10) {
    return { valid: false, error: `Token is too short (minimum 10 characters)` };
  }

  return { valid: true };
};

/**
 * Validates a URL format
 * @param {string|null|undefined} url - The URL to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== `string`) {
    return { valid: false, error: `URL is required and must be a string` };
  }

  const trimmedUrl = url.trim();
  if (trimmedUrl === ``) {
    return { valid: false, error: `URL cannot be empty` };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    if (urlObj.protocol !== `http:` && urlObj.protocol !== `https:`) {
      return { valid: false, error: `URL must use http or https protocol` };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Invalid URL format: ${error.message}` };
  }
};

/**
 * Validates a token response from the API
 * @param {object|null|undefined} response - The response object to validate
 * @returns {{valid: boolean, error?: string, expirationInMillis?: number}} Validation result
 */
export const validateTokenResponse = (response) => {
  if (!response) {
    return { valid: false, error: `Invalid response: empty or null response` };
  }

  if (typeof response !== `object`) {
    return { valid: false, error: `Invalid response: must be an object` };
  }

  if (!response.token) {
    return { valid: false, error: `Invalid response: token field missing` };
  }

  if (typeof response.exp !== `number`) {
    return { valid: false, error: `Invalid response: expiration field missing or invalid` };
  }

  if (typeof response.token !== `string` || response.token.trim() === ``) {
    return { valid: false, error: `Invalid response: token is empty or invalid` };
  }

  if (response.exp <= 0) {
    return { valid: false, error: `Invalid response: expiration must be a positive number` };
  }

  const expirationInMillis = response.exp * MILLISECONDS_PER_SECOND;
  return { valid: true, expirationInMillis };
};

/**
 * Constructs a secure URL for API requests
 * @param {string} baseUrl - The base URL
 * @param {string} endpoint - The API endpoint
 * @param {string} token - The token to append (optional)
 * @returns {{valid: boolean, url?: URL, error?: string}} Result with URL object or error
 */
export const constructSecureUrl = (baseUrl, endpoint, token = null) => {
  const urlValidation = validateUrl(baseUrl);
  if (!urlValidation.valid) {
    return { valid: false, error: urlValidation.error };
  }

  try {
    // Normalize base URL (ensure it ends with /)
    const normalizedBaseUrl = baseUrl.endsWith(`/`) ? baseUrl : `${baseUrl}/`;
    
    // Remove leading slash from endpoint if present
    const normalizedEndpoint = endpoint.startsWith(`/`) ? endpoint.substring(1) : endpoint;
    
    // Construct full path
    let fullPath = normalizedBaseUrl + normalizedEndpoint;
    
    // Append token if provided
    if (token) {
      const tokenValidation = validateToken(token);
      if (!tokenValidation.valid) {
        return { valid: false, error: tokenValidation.error };
      }
      fullPath += `/` + token;
    }

    const url = new URL(fullPath);
    return { valid: true, url };
  } catch (error) {
    return { valid: false, error: `Failed to construct URL: ${error.message}` };
  }
};
