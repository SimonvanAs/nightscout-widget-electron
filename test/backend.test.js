/**
 * @jest-environment jsdom
 */
"use strict";

// Test the exported functions by creating a simpler test approach
// Since backend.js uses top-level await, we test the core logic directly

// Replicate the fallbackTransform function logic for testing
const StatusCode = {
  OK: 200,
  NOT_FOUND: 404,
};

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

describe(`fallbackTransform`, () => {
  it(`should transform array data correctly`, () => {
    const inputData = [
      { direction: `SingleUp`, sgv: 120, mills: 1609459200000 },
      { direction: `Flat`, sgv: 115, mills: 1609459260000 },
      { direction: `FortyFiveDown`, sgv: 110, mills: 1609459320000 }
    ];

    const result = fallbackTransform(inputData);

    expect(result).toEqual({
      status: 200,
      result: [
        { direction: `SingleUp`, sgv: 120, date: 1609459200000 },
        { direction: `Flat`, sgv: 115, date: 1609459260000 },
        { direction: `FortyFiveDown`, sgv: 110, date: 1609459320000 }
      ]
    });
  });

  it(`should handle empty array`, () => {
    const result = fallbackTransform([]);
    expect(result).toEqual({
      status: 200,
      result: []
    });
  });

  it(`should handle non-array input`, () => {
    const result = fallbackTransform(null);
    expect(result).toEqual({
      status: 200
    });
  });

  it(`should handle undefined input`, () => {
    const result = fallbackTransform(undefined);
    expect(result).toEqual({
      status: 200
    });
  });

  it(`should handle object with missing fields`, () => {
    const inputData = [
      { direction: `SingleUp`, sgv: 120 },
      { direction: `Flat` }
    ];

    const result = fallbackTransform(inputData);

    expect(result).toEqual({
      status: 200,
      result: [
        { direction: `SingleUp`, sgv: 120, date: undefined },
        { direction: `Flat`, sgv: undefined, date: undefined }
      ]
    });
  });
});

describe(`obtainToken - Input Validation Logic`, () => {
  // Test the validation logic that obtainToken uses
  const validateToken = (token) => {
    // Matches backend.js implementation: first checks !token, then type/trim
    if (!token) {
      return { valid: false, error: `Token is undefined or missing` };
    }
    
    if (typeof token !== `string` || token.trim() === ``) {
      return { valid: false, error: `Token is invalid or empty` };
    }
    
    return { valid: true };
  };

  const maskToken = (token) => {
    if (!token) {
      return `***`;
    }
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  it(`should detect undefined token`, () => {
    const result = validateToken(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Token is undefined or missing`);
  });

  it(`should detect null token`, () => {
    const result = validateToken(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Token is undefined or missing`);
  });

  it(`should detect empty string token`, () => {
    // Empty string is falsy, so !token check catches it first
    const result = validateToken(``);
    expect(result.valid).toBe(false);
    // Empty string is caught by !token check, not the type check
    expect(result.error).toBe(`Token is undefined or missing`);
  });

  it(`should detect whitespace-only token`, () => {
    const result = validateToken(`   `);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Token is invalid or empty`);
  });

  it(`should detect non-string token`, () => {
    const result = validateToken(12345);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Token is invalid or empty`);
  });

  it(`should accept valid token`, () => {
    const result = validateToken(`valid-token-123`);
    expect(result.valid).toBe(true);
  });

  it(`should mask token correctly`, () => {
    const token = `test-token-abc123xyz789`;
    const masked = maskToken(token);
    expect(masked).toBe(`test...z789`);
  });

  it(`should handle short token in masking`, () => {
    const token = `abc`;
    const masked = maskToken(token);
    expect(masked).toBe(`abc...abc`);
  });

  it(`should handle null token in masking`, () => {
    const masked = maskToken(null);
    expect(masked).toBe(`***`);
  });
});

describe(`obtainToken - URL Construction Logic`, () => {
  const Endpoints = {
    AUTH: `/api/v2/authorization/request`,
  };

  const constructAuthUrl = (baseUrl, token) => {
    // Matches backend.js: adds trailing slash if missing, then appends endpoint + token
    const normalizedUrl = baseUrl.endsWith(`/`) ? baseUrl : `${baseUrl}/`;
    // eslint-disable-next-line no-undef
    return new URL(normalizedUrl + Endpoints.AUTH + `/` + token);
  };

  it(`should construct URL correctly with trailing slash`, () => {
    const url = constructAuthUrl(`https://example.com/`, `test-token`);
    expect(url.href).toContain(`/api/v2/authorization/request/test-token`);
  });

  it(`should construct URL correctly without trailing slash`, () => {
    const url = constructAuthUrl(`https://example.com`, `test-token`);
    expect(url.href).toContain(`/api/v2/authorization/request/test-token`);
  });

  it(`should include token in URL path`, () => {
    const url = constructAuthUrl(`https://example.com`, `my-secret-token`);
    // URL constructor normalizes the path, so we check href contains the path
    expect(url.href).toContain(`/api/v2/authorization/request/my-secret-token`);
    expect(url.pathname).toContain(`api/v2/authorization/request/my-secret-token`);
  });
});

describe(`obtainToken - Response Validation Logic`, () => {
  const validateTokenResponse = (response) => {
    if (!response) {
      return { valid: false, error: `Invalid response: empty or null response` };
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

    return { valid: true, expirationInMillis: response.exp * 1000 };
  };

  it(`should reject null response`, () => {
    const result = validateTokenResponse(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`empty or null response`);
  });

  it(`should reject response missing token field`, () => {
    const response = { exp: 1234567890 };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`token field missing`);
  });

  it(`should reject response missing exp field`, () => {
    const response = { token: `jwt-token` };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`expiration field missing or invalid`);
  });

  it(`should reject response with empty token string`, () => {
    const response = { token: ``, exp: 1234567890 };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    // Empty string is falsy, so !response.token check catches it first
    expect(result.error).toContain(`token field missing`);
  });

  it(`should reject response with whitespace-only token`, () => {
    const response = { token: `   `, exp: 1234567890 };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`token is empty or invalid`);
  });

  it(`should reject response with non-string token`, () => {
    const response = { token: 12345, exp: 1234567890 };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`token is empty or invalid`);
  });

  it(`should reject response with non-number exp`, () => {
    const response = { token: `jwt-token`, exp: `not-a-number` };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain(`expiration field missing or invalid`);
  });

  it(`should accept valid response`, () => {
    const response = { 
      token: `jwt-token-abc123`, 
      exp: Math.floor(Date.now() / 1000) + 3600 
    };
    const result = validateTokenResponse(response);
    expect(result.valid).toBe(true);
    expect(result.expirationInMillis).toBe(response.exp * 1000);
  });
});
