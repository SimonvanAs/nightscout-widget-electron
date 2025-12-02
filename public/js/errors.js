"use strict";

/**
 * Error handling utilities for standardized error management
 * @module errors
 */

/**
 * Error types enumeration
 */
export const ErrorType = {
  NETWORK: `NETWORK`,
  VALIDATION: `VALIDATION`,
  AUTHENTICATION: `AUTHENTICATION`,
  API: `API`,
  UNKNOWN: `UNKNOWN`
};

/**
 * Error codes enumeration
 */
export const ErrorCode = {
  NETWORK_OFFLINE: `NETWORK_OFFLINE`,
  NETWORK_TIMEOUT: `NETWORK_TIMEOUT`,
  NETWORK_SERVER_ERROR: `NETWORK_SERVER_ERROR`,
  NETWORK_NOT_FOUND: `NETWORK_NOT_FOUND`,
  VALIDATION_TOKEN: `VALIDATION_TOKEN`,
  VALIDATION_URL: `VALIDATION_URL`,
  VALIDATION_RESPONSE: `VALIDATION_RESPONSE`,
  AUTH_TOKEN_EXPIRED: `AUTH_TOKEN_EXPIRED`,
  AUTH_TOKEN_INVALID: `AUTH_TOKEN_INVALID`,
  API_403: `API_403`,
  API_500: `API_500`,
  UNKNOWN: `UNKNOWN`
};

/**
 * Standardized error class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {ErrorType} type - Error type
   * @param {ErrorCode} code - Error code
   * @param {Error} [originalError] - Original error if any
   */
  constructor(message, type, code, originalError = null) {
    super(message);
    this.name = `AppError`;
    this.type = type;
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Converts error to user-friendly message
   * @returns {string} User-friendly error message
   */
  toUserMessage() {
    switch (this.code) {
    case ErrorCode.NETWORK_OFFLINE:
      return `You are currently offline. Please check your network connection.`;
    case ErrorCode.NETWORK_TIMEOUT:
      return `The request timed out. Please try again.`;
    case ErrorCode.NETWORK_SERVER_ERROR:
      return `The server is not responding. Check your Nightscout site address.`;
    case ErrorCode.NETWORK_NOT_FOUND:
      return `The requested resource was not found on the server.`;
    case ErrorCode.VALIDATION_TOKEN:
      return `Invalid token format. Please check your token.`;
    case ErrorCode.VALIDATION_URL:
      return `Invalid URL format. Please check your Nightscout URL.`;
    case ErrorCode.VALIDATION_RESPONSE:
      return `Invalid response from server. Please try again.`;
    case ErrorCode.AUTH_TOKEN_EXPIRED:
      return `Authentication token has expired. Please refresh.`;
    case ErrorCode.AUTH_TOKEN_INVALID:
      return `Invalid authentication token. Please check your settings.`;
    case ErrorCode.API_403:
      return `Access denied. Please check your token permissions.`;
    case ErrorCode.API_500:
      return `Server error occurred. Please try again later.`;
    default:
      return this.message || `An unknown error occurred.`;
    }
  }

  /**
   * Converts error to log message
   * @returns {string} Log-friendly error message
   */
  toLogMessage() {
    const parts = [
      `[${this.type}]`,
      `[${this.code}]`,
      this.message
    ];

    if (this.originalError) {
      parts.push(`Original: ${this.originalError.message}`);
    }

    return parts.join(` `);
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Handles an error and returns standardized AppError
   * @param {Error|string|unknown} error - The error to handle
   * @param {ErrorType} [defaultType] - Default error type
   * @param {ErrorCode} [defaultCode] - Default error code
   * @returns {AppError} Standardized error
   */
  static handle(error, defaultType = ErrorType.UNKNOWN, defaultCode = ErrorCode.UNKNOWN) {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, defaultType, defaultCode, error);
    }

    if (typeof error === `string`) {
      return new AppError(error, defaultType, defaultCode);
    }

    return new AppError(`Unknown error occurred`, defaultType, defaultCode);
  }

  /**
   * Creates a network error
   * @param {string} message - Error message
   * @param {ErrorCode} code - Error code
   * @param {Error} [originalError] - Original error
   * @returns {AppError} Network error
   */
  static networkError(message, code = ErrorCode.NETWORK_SERVER_ERROR, originalError = null) {
    return new AppError(message, ErrorType.NETWORK, code, originalError);
  }

  /**
   * Creates a validation error
   * @param {string} message - Error message
   * @param {ErrorCode} code - Error code
   * @returns {AppError} Validation error
   */
  static validationError(message, code = ErrorCode.VALIDATION_TOKEN) {
    return new AppError(message, ErrorType.VALIDATION, code);
  }

  /**
   * Creates an authentication error
   * @param {string} message - Error message
   * @param {ErrorCode} code - Error code
   * @returns {AppError} Authentication error
   */
  static authError(message, code = ErrorCode.AUTH_TOKEN_INVALID) {
    return new AppError(message, ErrorType.AUTHENTICATION, code);
  }

  /**
   * Creates an API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {AppError} API error
   */
  static apiError(message, statusCode) {
    let code = ErrorCode.API_500;
    if (statusCode === 403) {
      code = ErrorCode.API_403;
    } else if (statusCode === 404) {
      code = ErrorCode.NETWORK_NOT_FOUND;
    } else if (statusCode >= 500) {
      code = ErrorCode.API_500;
    }

    return new AppError(message, ErrorType.API, code);
  }
}

