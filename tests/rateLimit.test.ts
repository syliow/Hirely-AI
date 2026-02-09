import { checkRateLimit } from '../lib/rateLimit';

// Mock Date.now() if needed, or just run fast
// Since the window is 1 minute and max requests is 30, we can just run 31 requests quickly.

console.log('Testing Rate Limiter...');

const identifier = 'test-user-' + Math.random().toString(36).substring(7);
const MAX_REQUESTS = 60; // Updated to match RATE_LIMIT_CONFIG.maxRequests

let limited = false;

for (let i = 0; i < MAX_REQUESTS; i++) {
  const result = checkRateLimit(identifier, 'minute');
  if (result.limited) {
    console.error(`Request ${i + 1} was incorrectly limited!`);
    process.exit(1);
  }
}

// The next request should be limited
const result = checkRateLimit(identifier, 'minute');
if (!result.limited) {
  console.error(`Request ${MAX_REQUESTS + 1} was NOT limited but should have been!`);
  process.exit(1);
} else {
  console.log(`✅ Rate limiter correctly blocked the ${MAX_REQUESTS + 1}st request.`);
}

// Check remaining
const status = checkRateLimit(identifier, 'minute');
if (status.remaining !== 0) {
  console.error('Remaining count is not 0 for limited user');
   process.exit(1);
}

console.log('✅ Rate limit test passed!');
