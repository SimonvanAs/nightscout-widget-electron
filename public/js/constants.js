"use strict";

/**
 * Application-wide constants
 * @module constants
 */

// Time conversion constants
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;

// Unit conversion constants
export const MMOL_TO_MGDL_RATE = 18;

// Request constants
export const REQUEST_TIMEOUT_MS = 10000;
export const CONNECTION_RETRY_LIMIT = 5;

// Data display constants
export const DATA_AGE_SHOW_LIMIT = 999;

// Token expiration buffer (refresh 5 minutes before expiration)
export const TOKEN_REFRESH_BUFFER_MINUTES = 5;
export const TOKEN_REFRESH_BUFFER_MS = TOKEN_REFRESH_BUFFER_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

// Trend calculation constants
export const MIN_DATA_CALC_LENGTH = 6;
export const SENSOR_READ_INTERVAL_IN_MIN = 5;

