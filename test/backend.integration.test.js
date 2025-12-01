/**
 * @jest-environment jsdom
 */
"use strict";

/**
 * Integration tests for backend API functions
 * These tests mock the fetch API to test the full request/response cycle
 */

import { BackendService } from '../js/services/BackendService.js';
import { TokenService } from '../js/services/TokenService.js';

// Mock fetch globally
global.fetch = jest.fn();

// Mock navigator
global.navigator = {
  onLine: true
};

// Mock AbortController
global.AbortController = class AbortController {
  constructor() {
    this.signal = { aborted: false };
  }
  abort() {
    this.signal.aborted = true;
  }
};

describe(`Backend Integration Tests`, () => {
  let backendService;
  let mockLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    backendService = new BackendService({
      nightscout: {
        url: `https://example.com`,
        token: `test-token-12345`
      },
      logger: mockLogger,
      fetchFn: global.fetch
    });
  });

  describe(`BackendService.getData`, () => {
    it(`should successfully fetch data from API v3`, async () => {
      const mockData = {
        result: [
          { sgv: 120, direction: 'Flat', date: Date.now() },
          { sgv: 115, direction: 'FortyFiveUp', date: Date.now() - 300000 }
        ]
      };

      // Mock token response (will be called first)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      // Mock data response (will be called second)
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getData(onSuccess, onError);

      expect(global.fetch).toHaveBeenCalledTimes(2); // Token + Data
      expect(onSuccess).toHaveBeenCalledWith(mockData);
      expect(onError).not.toHaveBeenCalled();
    });

    it(`should fallback to API v2 on 403 error`, async () => {
      const mockV2Data = [
        { sgv: 120, direction: 'Flat', mills: Date.now() },
        { sgv: 115, direction: 'FortyFiveUp', mills: Date.now() - 300000 }
      ];

      // Mock token response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      // V3 call fails with 403
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ message: 'Forbidden' })
      });

      // V2 fallback succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockV2Data
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getData(onSuccess, onError);

      expect(global.fetch).toHaveBeenCalledTimes(3); // Token + V3 (403) + V2
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it(`should handle network errors`, async () => {
      // Mock token response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      // Data fetch fails
      global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getData(onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it(`should handle timeout errors`, async () => {
      // Mock token response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });
      
      // Simulate timeout
      global.fetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Request timeout');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getData(onSuccess, onError);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toContain('timeout');
    });
  });

  describe(`BackendService.getStatus`, () => {
    it(`should successfully test connection`, async () => {
      // Mock token response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      const mockStatus = {
        status: 'ok',
        version: '1.0.0'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getStatus(
        { url: 'https://example.com', token: 'test-token' },
        onSuccess,
        onError
      );

      expect(global.fetch).toHaveBeenCalledTimes(2); // Token + Status
      expect(onSuccess).toHaveBeenCalledWith(mockStatus);
      expect(onError).not.toHaveBeenCalled();
    });

    it(`should handle 404 errors`, async () => {
      // Mock token response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'jwt-token-abc123',
          exp: Math.floor(Date.now() / 1000) + 3600
        })
      });

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Not Found' })
      });

      const onSuccess = jest.fn();
      const onError = jest.fn();

      await backendService.getStatus(
        { url: 'https://example.com', token: 'test-token' },
        onSuccess,
        onError
      );

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toContain('404');
    });
  });

  describe(`TokenService`, () => {
    it(`should obtain token before making request if token is missing`, async () => {
      const tokenService = new TokenService({
        nightscout: {
          url: 'https://example.com',
          token: 'test-token-12345'
        },
        logger: mockLogger,
        fetchFn: global.fetch
      });

      const mockTokenResponse = {
        token: 'jwt-token-abc123',
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse
      });

      const token = await tokenService.getToken();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(token).toBe('jwt-token-abc123');
    });

    it(`should cache token until expiration`, async () => {
      const tokenService = new TokenService({
        nightscout: {
          url: 'https://example.com',
          token: 'test-token-12345'
        },
        logger: mockLogger,
        fetchFn: global.fetch
      });

      const mockTokenResponse = {
        token: 'jwt-token-abc123',
        exp: Math.floor(Date.now() / 1000) + 3600
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockTokenResponse
      });

      // First call - should fetch token
      const token1 = await tokenService.getToken();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cached token
      const token2 = await tokenService.getToken();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(token1).toBe(token2);
    });
  });
});

