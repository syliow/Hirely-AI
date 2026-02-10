/**
 * Rate Limiting Utility
 * Implements a sliding window rate limiter for API protection
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (works for serverless with short lifetime)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  // Maximum requests per window (RPM Protection)
  maxRequests: 60, // Increased to 60 RPM to prevent false positives
  // Window duration in milliseconds (1 minute)
  windowMs: 60 * 1000,
  // Daily limit per IP (RPD Protection)
  dailyMaxRequests: 14400, // Updated for Gemma 3 27B (14.4K RPD)
  // Daily window (24 hours)
  dailyWindowMs: 24 * 60 * 60 * 1000,
  // Note: TPM (Tokens Per Minute) is strictly handled by the error handling back-off mechanism
};

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  
  // Use the first available IP or fall back to a random string if failing to prevent global blocking
  const ip = forwarded?.split(',')[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             vercelIp ||
             'anonymous'; // Fallback to shared bucket for anonymous requests (prevents rate limit bypass)
  
  return ip;
}

/**
 * Check if a request should be rate limited
 * Returns { limited: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(
  identifier: string,
  type: 'minute' | 'daily' = 'minute'
): { limited: boolean; remaining: number; resetIn: number; retryAfter: number } {
  // Cleanup old entries periodically
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const key = `${type}:${identifier}`;
  const config = type === 'minute' 
    ? { max: RATE_LIMIT_CONFIG.maxRequests, window: RATE_LIMIT_CONFIG.windowMs }
    : { max: RATE_LIMIT_CONFIG.dailyMaxRequests, window: RATE_LIMIT_CONFIG.dailyWindowMs };

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window,
    });
    return {
      limited: false,
      remaining: config.max - 1,
      resetIn: config.window,
      retryAfter: 0,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.max - entry.count);
  const resetIn = Math.max(0, entry.resetTime - now);

  if (entry.count > config.max) {
    return {
      limited: true,
      remaining: 0,
      resetIn,
      retryAfter: Math.ceil(resetIn / 1000),
    };
  }

  return {
    limited: false,
    remaining,
    resetIn,
    retryAfter: 0,
  };
}

/**
 * Rate limit headers to include in response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  retryAfter?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
  };

  if (retryAfter && retryAfter > 0) {
    headers['Retry-After'] = retryAfter.toString();
  }

  return headers;
}

/**
 * Error codes for rate limiting
 */
export const RATE_LIMIT_ERROR = {
  MINUTE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT: 'DAILY_LIMIT_EXCEEDED',
  API_QUOTA: 'API_QUOTA_EXCEEDED',
} as const;

export type RateLimitErrorType = typeof RATE_LIMIT_ERROR[keyof typeof RATE_LIMIT_ERROR];
