
import { checkRateLimit, getClientIdentifier } from '../lib/rateLimit';

// Mock Request object
class MockRequest {
  headers: Map<string, string>;

  constructor(headers: Record<string, string> = {}) {
    this.headers = new Map(Object.entries(headers));
  }
}

// Monkey patch Request since we are in node environment
global.Request = MockRequest as any;

// Test function to verify that requests without IP headers are assigned a shared identifier
// instead of unique random IDs (which would bypass rate limiting).
function testRateLimitBypass() {
  console.log('Testing Rate Limit Bypass...');

  // Simulate 10 requests with no headers
  const ids = new Set();
  for (let i = 0; i < 10; i++) {
    const req = new MockRequest({});
    // The getClientIdentifier implementation uses request.headers.get()
    // We need to make sure our mock supports that
    (req as any).headers = {
      get: (key: string) => null
    };

    const id = getClientIdentifier(req as any);
    console.log(`Request ${i}: ID = ${id}`);
    ids.add(id);
  }

  if (ids.size > 1) {
    console.log('FAIL: Rate limit bypass detected! Multiple IDs generated for requests with no IP headers.');
  } else {
    console.log('PASS: Rate limit working correctly (shared ID for anonymous requests).');
  }
}

testRateLimitBypass();
