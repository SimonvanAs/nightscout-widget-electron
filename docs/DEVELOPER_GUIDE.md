# Developer Guide

This guide provides information for developers working on the Owlet project.

## Table of Contents

1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Code Style](#code-style)
4. [Testing](#testing)
5. [Contributing](#contributing)

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/kashamalasha/nightscout-widget-electron
cd nightscout-widget-electron

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Development Scripts

- `npm run dev` - Run in development mode with verbose logging
- `npm start` - Run in production mode
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test-coverage` - Run tests with coverage
- `npm run pack` - Build application without distribution
- `npm run dist` - Build distribution packages

## Architecture

### Project Structure

```
nightscout-widget-electron/
├── js/                    # JavaScript source files
│   ├── backend.js        # API communication
│   ├── widget.js         # Main widget UI
│   ├── settings.js      # Settings UI
│   ├── util.js          # Utility functions
│   ├── security.js       # Security utilities
│   ├── errors.js        # Error handling
│   ├── constants.js     # Application constants
│   ├── translator.js    # Translation handling
│   ├── logger.js        # Logging configuration
│   ├── preload.js       # Electron preload script
│   └── auto-update.js   # Auto-update logic
├── main.js              # Electron main process
├── widget.html          # Widget HTML
├── settings.html       # Settings HTML
├── styles.css          # Application styles
├── localization/       # Translation files
├── test/               # Test files
├── docs/               # Documentation
└── build/              # Build configuration
```

### Module System

The application uses ES6 modules for frontend code and CommonJS for Node.js code.

**ES Modules (Frontend):**
- `js/backend.js`
- `js/widget.js`
- `js/settings.js`
- `js/util.js`
- `js/security.js`
- `js/errors.js`
- `js/constants.js`
- `js/translator.js`

**CommonJS (Node.js):**
- `main.js`
- `js/logger.js`
- `js/preload.js`
- `js/auto-update.js`
- `build/*.js`

### Key Modules

#### Backend (`js/backend.js`)
Handles all communication with the Nightscout API:
- Token management
- Data fetching
- API fallback handling

#### Security (`js/security.js`)
Security utilities:
- Token masking
- Input validation
- URL construction

#### Errors (`js/errors.js`)
Standardized error handling:
- Error types and codes
- Error formatting
- User-friendly messages

#### Constants (`js/constants.js`)
Application-wide constants:
- Time conversions
- Unit conversions
- Request limits
- Display limits

## Code Style

### JavaScript

- Use ES6+ features
- Use `const` by default, `let` when needed
- Use arrow functions for callbacks
- Use template literals for strings
- Use async/await for asynchronous code
- Follow ESLint configuration

### Naming Conventions

- **Variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Functions:** camelCase
- **Classes:** PascalCase
- **Files:** kebab-case for HTML/CSS, camelCase for JS

### Comments

- Use JSDoc for all public functions
- Add inline comments for complex logic
- Explain "why" not just "what"

### Example

```javascript
/**
 * Fetches data from the API
 * @param {string} url - The API URL
 * @returns {Promise<object>} The response data
 */
const fetchData = async (url) => {
  // Validate URL before making request
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const response = await fetch(url);
  return response.json();
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test-coverage

# Run specific test file
npm test -- backend.test.js
```

### Writing Tests

Tests use Jest with jsdom environment for DOM testing.

Example test:

```javascript
describe('functionName', () => {
  it('should do something', () => {
    const result = functionName(input);
    expect(result).toBe(expected);
  });
});
```

## Contributing

### Workflow

1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Run linter and tests
5. Submit a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No linter errors
- [ ] JSDoc comments added
- [ ] Error handling implemented
- [ ] Security considerations addressed

### Commit Messages

Use conventional commit format:

```
type(scope): subject

body (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks

Example:
```
feat(security): add token masking for logging

Implement token masking to prevent sensitive data
from appearing in logs.
```

## Security Guidelines

1. **Never log sensitive data** - Use `maskToken()` for tokens
2. **Validate all inputs** - Use validation functions from `security.js`
3. **Use secure URL construction** - Use `constructSecureUrl()`
4. **Handle errors gracefully** - Use `ErrorHandler` class
5. **Follow CSP guidelines** - Content Security Policy is enforced

## Performance Guidelines

1. **Avoid blocking operations** - Use async/await
2. **Cache when appropriate** - Token expiration, response data
3. **Clean up resources** - Clear intervals, remove listeners
4. **Debounce rapid requests** - Prevent duplicate API calls

## Debugging

### Development Mode

Run with `npm run dev` for verbose logging.

### Logs

Logs are stored in:
- **Windows:** `%APPDATA%/owlet/logs/`
- **macOS:** `~/Library/Logs/owlet/`
- **Linux:** `~/.config/owlet/logs/`

### Common Issues

1. **Token validation errors** - Check token format and length
2. **URL validation errors** - Ensure URL uses http/https protocol
3. **Network errors** - Check Nightscout site accessibility
4. **Import errors** - Verify module paths and exports

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Nightscout API Documentation](https://nightscout.github.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

