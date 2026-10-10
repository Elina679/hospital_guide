/**
 * API configuration
 * Defaults to the Vite dev proxy so local preview can call the backend without CORS issues.
 */

export const DEFAULT_BACKEND_ORIGIN = 'https://lashandra-unwintry-dianna.ngrok-free.dev';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/api/v1' : `${DEFAULT_BACKEND_ORIGIN}/api/v1`);

const mockBackendSetting = import.meta.env.VITE_USE_MOCK_BACKEND;

export const USE_MOCK_BACKEND = mockBackendSetting
  ? mockBackendSetting === 'true'
  : import.meta.env.DEV;

export const REQUEST_TIMEOUT = 30000;

export const MAX_RETRY_COUNT = 3;

export const RETRY_DELAY = 1000;

export const isDevelopment = import.meta.env.DEV;

export const LOG_CONFIG = {
  logRequests: isDevelopment,
  logResponses: isDevelopment,
  logErrors: true,
};
