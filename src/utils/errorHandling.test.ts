
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiError, ApiError, ErrorType, safeFetch } from './errorHandling';
import { toast } from '@/hooks/use-toast';

// Mock the toast function
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() })
}));

describe('createApiError', () => {
  it('should create a network error for fetch TypeError', () => {
    const fetchError = new TypeError('Failed to fetch');
    const error = createApiError(fetchError);
    
    expect(error).toBeInstanceOf(ApiError);
    expect(error.type).toBe(ErrorType.NETWORK);
    expect(error.message).toContain('Unable to connect');
  });
  
  it('should create an auth error for 401 status code', () => {
    const authError = { statusCode: 401 };
    const error = createApiError(authError);
    
    expect(error).toBeInstanceOf(ApiError);
    expect(error.type).toBe(ErrorType.AUTH);
    expect(error.statusCode).toBe(401);
  });
  
  it('should create a server error for 500+ status code', () => {
    const serverError = { statusCode: 500 };
    const error = createApiError(serverError);
    
    expect(error).toBeInstanceOf(ApiError);
    expect(error.type).toBe(ErrorType.SERVER);
    expect(error.statusCode).toBe(500);
  });
  
  it('should create an unknown error for other cases', () => {
    const unknownError = new Error('Some other error');
    const error = createApiError(unknownError);
    
    expect(error).toBeInstanceOf(ApiError);
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });
});

describe('safeFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should return data for successful response', async () => {
    const mockData = { success: true };
    const mockResponse = {
      ok: true,
      json: async () => mockData
    };
    
    const fetchPromise = Promise.resolve(mockResponse as Response);
    const result = await safeFetch(fetchPromise);
    
    expect(result.data).toEqual(mockData);
    expect(result.error).toBeNull();
    expect(toast).not.toHaveBeenCalled();
  });
  
  it('should return error for non-ok response', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    };
    
    const fetchPromise = Promise.resolve(mockResponse as Response);
    const result = await safeFetch(fetchPromise);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.error?.type).toBe(ErrorType.SERVER);
    expect(toast).toHaveBeenCalled();
  });
  
  it('should use fallback data when provided', async () => {
    const fallbackData = { fallback: true };
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    };
    
    const fetchPromise = Promise.resolve(mockResponse as Response);
    const result = await safeFetch(fetchPromise, fallbackData);
    
    expect(result.data).toEqual(fallbackData);
    expect(result.error).not.toBeNull();
  });
  
  it('should handle fetch rejection', async () => {
    const fetchPromise = Promise.reject(new TypeError('Failed to fetch'));
    const result = await safeFetch(fetchPromise);
    
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(ApiError);
    expect(result.error?.type).toBe(ErrorType.NETWORK);
    expect(toast).toHaveBeenCalled();
  });
});
