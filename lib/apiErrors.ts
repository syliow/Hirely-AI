/**
 * API Error Response Utilities
 * Standardized error responses with proper error codes for frontend handling
 */

export interface ApiError {
  error: string;
  errorCode: string;
  retryAfter?: number;
  details?: Record<string, unknown>;
}

/**
 * Error codes that the frontend can use to show appropriate UI
 */
export const ERROR_CODES = {
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  
  // Validation errors
  MISSING_ACTION: 'MISSING_ACTION',
  INVALID_ACTION: 'INVALID_ACTION',
  MISSING_FILE: 'MISSING_FILE',
  INVALID_FILE_DATA: 'INVALID_FILE_DATA',
  MISSING_MIME_TYPE: 'MISSING_MIME_TYPE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  
  // Server errors
  MISSING_API_KEY: 'MISSING_API_KEY',
  API_ERROR: 'API_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages for each error code
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',
  DAILY_LIMIT_EXCEEDED: 'Daily usage limit reached. Please try again tomorrow.',
  API_QUOTA_EXCEEDED: 'Our AI service has reached its daily capacity. Please try again later.',
  
  MISSING_ACTION: 'Invalid request format.',
  INVALID_ACTION: 'Invalid request type.',
  MISSING_FILE: 'Please upload a resume file.',
  INVALID_FILE_DATA: 'The uploaded file appears to be corrupted.',
  MISSING_MIME_TYPE: 'Could not determine file type.',
  INVALID_FILE_TYPE: 'Only PDF and Word documents are supported.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  PAYLOAD_TOO_LARGE: 'Request is too large. Please try with a smaller file.',
  
  MISSING_API_KEY: 'Service is temporarily unavailable. Please try again later.',
  API_ERROR: 'An error occurred while processing your request. Please try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  errorCode: ErrorCode,
  customMessage?: string,
  retryAfter?: number,
  details?: Record<string, unknown>
): ApiError {
  return {
    error: customMessage || ERROR_MESSAGES[errorCode],
    errorCode,
    ...(retryAfter && { retryAfter }),
    ...(details && { details }),
  };
}

/**
 * Parse API error responses to detect quota/rate limit issues
 */
export function parseApiError(error: unknown): { errorCode: ErrorCode; message: string } {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for rate limit / quota errors from Gemini API
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return { errorCode: 'RATE_LIMIT_EXCEEDED', message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED };
    }
    
    if (message.includes('quota') || message.includes('exceeded') || message.includes('billing')) {
      return { errorCode: 'API_QUOTA_EXCEEDED', message: ERROR_MESSAGES.API_QUOTA_EXCEEDED };
    }
    
    if (message.includes('resource exhausted')) {
      return { errorCode: 'API_QUOTA_EXCEEDED', message: ERROR_MESSAGES.API_QUOTA_EXCEEDED };
    }
    
    return { errorCode: 'API_ERROR', message: error.message || ERROR_MESSAGES.API_ERROR };
  }
  
  return { errorCode: 'INTERNAL_ERROR', message: ERROR_MESSAGES.INTERNAL_ERROR };
}
