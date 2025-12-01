# API Documentation

This document describes the internal APIs used in the Owlet application.

## Backend API (`js/backend.js`)

### Functions

#### `getData(onSuccess, onError)`
Fetches glucose data from Nightscout API.

**Parameters:**
- `onSuccess {Function}` - Callback function called with data object on success
- `onError {Function}` - Callback function called with error message on failure

**Returns:** `Promise<void>`

**Example:**
```javascript
getData(
  (data) => console.log('Data received:', data),
  (error) => console.error('Error:', error)
);
```

#### `getStatus(testParams, onSuccess, onError)`
Tests connection to Nightscout API.

**Parameters:**
- `testParams {object}` - Test parameters
  - `url {string}` - Nightscout base URL
  - `token {string}` - Access token
- `onSuccess {Function}` - Callback function called on successful connection
- `onError {Function}` - Callback function called on connection failure

**Returns:** `Promise<void>`

**Example:**
```javascript
getStatus(
  { url: 'https://example.com', token: 'my-token' },
  () => console.log('Connection successful'),
  (error) => console.error('Connection failed:', error)
);
```

## Security API (`js/security.js`)

### Functions

#### `maskToken(token)`
Masks a token for safe logging.

**Parameters:**
- `token {string|null|undefined}` - The token to mask

**Returns:** `string` - Masked token (e.g., "abcd...xyz1")

**Example:**
```javascript
maskToken('my-secret-token-12345'); // Returns: "my-s...2345"
```

#### `validateToken(token)`
Validates a token format.

**Parameters:**
- `token {string|null|undefined}` - The token to validate

**Returns:** `{valid: boolean, error?: string}` - Validation result

**Example:**
```javascript
const result = validateToken('my-token');
if (!result.valid) {
  console.error(result.error);
}
```

#### `validateUrl(url)`
Validates a URL format.

**Parameters:**
- `url {string|null|undefined}` - The URL to validate

**Returns:** `{valid: boolean, error?: string}` - Validation result

**Example:**
```javascript
const result = validateUrl('https://example.com');
if (!result.valid) {
  console.error(result.error);
}
```

## Electron IPC API (`js/preload.js`)

The Electron API is exposed through `window.electronAPI` in the renderer process.

### Methods

#### `window.electronAPI.getSettings()`
Gets application settings.

**Returns:** `Promise<object>` - Settings object

#### `window.electronAPI.setSettings(data)`
Sets application settings.

**Parameters:**
- `data {object}` - Settings data object

#### `window.electronAPI.getVersion()`
Gets application version.

**Returns:** `Promise<string>` - Version string

#### `window.electronAPI.logger`
Logger object with methods:
- `info(msg)` - Log info message
- `warn(msg)` - Log warning message
- `error(msg)` - Log error message

#### `window.electronAPI.dialog`
Dialog object with methods:
- `showMessageBox(options)` - Show message box (async)
- `showMessageBoxSync(options)` - Show message box (sync)

## Constants (`js/constants.js`)

### Time Constants
- `MILLISECONDS_PER_SECOND` - 1000
- `SECONDS_PER_MINUTE` - 60
- `MINUTES_PER_HOUR` - 60

### Unit Conversion
- `MMOL_TO_MGDL_RATE` - 18

### Request Constants
- `REQUEST_TIMEOUT_MS` - 10000
- `CONNECTION_RETRY_LIMIT` - 5

### Data Display
- `DATA_AGE_SHOW_LIMIT` - 999

### Token Management
- `TOKEN_REFRESH_BUFFER_MINUTES` - 5
- `TOKEN_REFRESH_BUFFER_MS` - Calculated from minutes

## Error Handling (`js/errors.js`)

### Error Types
- `ErrorType.NETWORK` - Network-related errors
- `ErrorType.VALIDATION` - Validation errors
- `ErrorType.AUTHENTICATION` - Authentication errors
- `ErrorType.API` - API-related errors
- `ErrorType.UNKNOWN` - Unknown errors

### Error Codes
- `ErrorCode.NETWORK_OFFLINE` - Network is offline
- `ErrorCode.NETWORK_TIMEOUT` - Request timeout
- `ErrorCode.VALIDATION_TOKEN` - Token validation failed
- `ErrorCode.VALIDATION_URL` - URL validation failed
- `ErrorCode.AUTH_TOKEN_EXPIRED` - Token expired
- `ErrorCode.API_403` - Access denied (403)
- `ErrorCode.API_500` - Server error (500)

### ErrorHandler Class

#### `ErrorHandler.handle(error, defaultType, defaultCode)`
Handles an error and returns standardized AppError.

**Parameters:**
- `error {Error|string|unknown}` - The error to handle
- `defaultType {ErrorType}` - Default error type
- `defaultCode {ErrorCode}` - Default error code

**Returns:** `AppError` - Standardized error

