"use strict";

/**
 * Backend API module for Nightscout data fetching
 * @module backend
 */

import { maskToken, validateToken, validateUrl, validateTokenResponse, constructSecureUrl } from "./security.js";
import { REQUEST_TIMEOUT_MS, TOKEN_REFRESH_BUFFER_MS } from "./constants.js";

const CONFIG = await window.electronAPI.getSettings();

const REQUEST_TIMEOUT = REQUEST_TIMEOUT_MS;
const log = window.electronAPI.logger;

const StatusCode = {
  OK: 200,
  NOT_FOUND: 404,
};

const Endpoints = {
  AUTH: `/api/v2/authorization/request`,
  DATA: `/api/v3/entries`,
  TEST: `/api/v3/status`,
};

const Fallback = {
  DATA: `/api/v2/entries/sgv`,
  TEST: `/api/v2/status`,
};

const GetParams = {
  SORT_BY: `date`,
  LIMIT: 10,
  FIELDS: `sgv,direction,date`,
  TYPE: `sgv`,
  TOKEN: null,
};

/**
 * Transforms API v2 response format to match API v3 format
 * @param {Array|object} dataObj - The data object from API v2
 * @returns {object} Transformed data object with status and result array
 */
const fallbackTransform = (dataObj) => {
  const transformedData = {
    status: StatusCode.OK
  };

  if (Array.isArray(dataObj)) {
    transformedData.result = dataObj.map(item => ({
      direction: item.direction,
      sgv: item.sgv,
      date: item.mills
    }));
  }

  return transformedData;
};

/**
 * Creates a fetch request with timeout and error handling
 * @param {string} method - HTTP method
 * @param {URL|string} url - Request URL
 * @param {object} [options] - Fetch options
 * @param {object} [options.headers] - Request headers
 * @param {boolean} [options.fallback] - Whether to use fallback transform
 * @returns {Promise<Response>} Fetch response promise
 */
const createFetchRequest = async (method, url, options = {}) => {
  const { headers = {}, fallback = false } = options;

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: `application/json`,
        ...headers
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Request status: ${response.status}`;
      
      if (response.status === StatusCode.NOT_FOUND) {
        errorMessage = `Request status: ${response.status} - The requested resource was not found on the server`;
      } else {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message 
            ? `Request status: ${response.status} - ${errorData.message}`
            : `Request status: ${response.status} - ${response.statusText}`;
        } catch {
          errorMessage = `Request status: ${response.status} - ${response.statusText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Apply fallback transform if needed
    if (fallback) {
      return fallbackTransform(data);
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === `AbortError`) {
      throw new Error(`Request timeout reached: ${REQUEST_TIMEOUT} ms.`);
    }
    
    if (!navigator.onLine) {
      throw new Error(`You are currently offline. Please check your network connection.`);
    }
    
    if (error.message.includes(`Failed to fetch`) || error.message.includes(`NetworkError`)) {
      throw new Error(`The server is not responding. Check your nightscout site address.`);
    }
    
    throw error;
  }
};

/**
 * Checks if the JWT token has expired (with buffer time)
 * @returns {boolean} True if token is expired or will expire soon
 */
const hasTokenExpired = () => {
  const now = Date.now();
  // Add buffer time - refresh token before it actually expires
  const expirationWithBuffer = CONFIG.JWT_EXPIRATION - TOKEN_REFRESH_BUFFER_MS;

  if (now > expirationWithBuffer) {
    return true;
  }

  return false;
};

/**
 * Obtains a JWT token from the Nightscout API
 * @param {object} paramsObj - Parameters object
 * @param {string} paramsObj.url - Nightscout base URL
 * @param {string} paramsObj.token - Access token
 * @returns {Promise<void>} Promise that resolves when token is obtained
 * @throws {Error} If token validation, URL validation, or API request fails
 */
const obtainToken = async (paramsObj) => {
  // Validate token before making request
  const tokenValidation = validateToken(paramsObj.token);
  if (!tokenValidation.valid) {
    log.error(`Token validation failed: ${tokenValidation.error}`);
    throw new Error(tokenValidation.error);
  }

  // Validate URL
  const urlValidation = validateUrl(paramsObj.url);
  if (!urlValidation.valid) {
    log.error(`URL validation failed: ${urlValidation.error}`);
    throw new Error(urlValidation.error);
  }

  // Construct secure URL
  const urlResult = constructSecureUrl(paramsObj.url, Endpoints.AUTH, paramsObj.token);
  if (!urlResult.valid) {
    log.error(`URL construction failed: ${urlResult.error}`);
    throw new Error(urlResult.error);
  }

  const maskedToken = maskToken(paramsObj.token);
  log.info(`Requesting JWT token for ${maskedToken}`);

  try {
    const response = await createFetchRequest(`GET`, urlResult.url);
    
    // Validate response structure
    const responseValidation = validateTokenResponse(response);
    if (!responseValidation.valid) {
      log.error(`Token response validation failed: ${responseValidation.error}`);
      // Clear invalid token
      GetParams.TOKEN = null;
      CONFIG.JWT_EXPIRATION = 0;
      throw new Error(responseValidation.error);
    }

    GetParams.TOKEN = response.token;
    CONFIG.JWT_EXPIRATION = responseValidation.expirationInMillis;

    const maskedResponseToken = maskToken(response.token);
    log.info(`JWT token obtained successfully (${maskedResponseToken})`);
  } catch (error) {
    const maskedToken = maskToken(paramsObj.token);
    log.error(`Failed to obtain JWT token: ${error.message} for ${maskedToken}`);
    // Clear token on error
    GetParams.TOKEN = null;
    CONFIG.JWT_EXPIRATION = 0;
    throw error;
  }
};

/**
 * Fallback function to use API v2 when API v3 returns 403
 * @param {object} params - Request parameters
 * @param {string} params.url - Nightscout base URL
 * @param {string} params.token - Access token
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {string} endpoint - API endpoint to call
 * @returns {Promise<void>} Promise that resolves when request completes
 */
const fallbackGet = async (params, onSuccess, onError, endpoint) => {
  const url = new URL(params.url + endpoint);

  if (!endpoint.includes(`status`)) {
    url.searchParams.set(`count`, GetParams.LIMIT);
  }

  // Ensure token is available
  if (!GetParams.TOKEN || hasTokenExpired()) {
    try {
      await obtainToken(params);
    } catch (error) {
      onError(`Failed to obtain token: ${error.message}`);
      return;
    }
  }

  try {
    const data = await createFetchRequest(`GET`, url, {
      headers: {
        Authorization: `Bearer ${GetParams.TOKEN}`,
        Accept: `application/json`
      },
      fallback: true
    });
    
    onSuccess(data);
  } catch (error) {
    onError(error.message);
  }
};

/**
 * Fetches glucose data from Nightscout API
 * @param {Function} onSuccess - Success callback with data
 * @param {Function} onError - Error callback with error message
 * @returns {Promise<void>} Promise that resolves when request completes
 */
const getData = async (onSuccess, onError) => {
  const params = {
    "url": CONFIG.NIGHTSCOUT.URL,
    "token": CONFIG.NIGHTSCOUT.TOKEN
  };

  const url = new URL(params.url + Endpoints.DATA);

  url.searchParams.set(`sort$desc`, GetParams.SORT_BY);
  url.searchParams.set(`limit`, GetParams.LIMIT);
  url.searchParams.set(`fields`, GetParams.FIELDS);
  url.searchParams.set(`type$eq`, GetParams.TYPE);

  // Ensure token is available
  if (!GetParams.TOKEN || hasTokenExpired()) {
    try {
      await obtainToken(params);
    } catch (error) {
      onError(`Failed to obtain token: ${error.message}`);
      return;
    }
  }

  try {
    const data = await createFetchRequest(`GET`, url, {
      headers: {
        Authorization: `Bearer ${GetParams.TOKEN}`
      }
    });
    
    onSuccess(data);
  } catch (error) {
    if (error.message.includes(`Request status: 403`)) {
      log.warn(`Fallback to API v2 call due to 403 error`);
      fallbackGet(params, onSuccess, onError, Fallback.DATA);
    } else {
      onError(error.message);
    }
  }
};

/**
 * Tests connection to Nightscout API
 * @param {object} testParams - Test parameters
 * @param {string} testParams.url - Nightscout base URL
 * @param {string} testParams.token - Access token
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @returns {Promise<void>} Promise that resolves when request completes
 */
const getStatus = async (testParams, onSuccess, onError) => {
  const url = new URL(testParams.url + Endpoints.TEST);

  // Ensure token is available (check if URL changed or token expired)
  if (testParams.url !== CONFIG.NIGHTSCOUT.URL || !GetParams.TOKEN || hasTokenExpired()) {
    try {
      await obtainToken(testParams);
    } catch (error) {
      onError(`Failed to obtain token: ${error.message}`);
      return;
    }
  }

  try {
    const data = await createFetchRequest(`GET`, url, {
      headers: {
        Authorization: `Bearer ${GetParams.TOKEN}`
      }
    });
    
    onSuccess(data);
  } catch (error) {
    if (error.message.includes(`Request status: 403`)) {
      log.warn(`Fallback to API v2 call due to 403 error`);
      fallbackGet(testParams, onSuccess, onError, Fallback.TEST);
    } else {
      onError(error.message);
    }
  }
};

export { getData, getStatus };
