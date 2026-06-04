import { POST } from '../app/api/generate/route';
import { NextRequest } from 'next/server';

// Mock NextRequest since we are in a node environment without full Next.js context
// We need to extend Request or at least mimic it enough for the handler
class MockNextRequest extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init);
  }
}

// Helper to create a request
function createRequest(ip: string) {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  headers.set('content-length', '100'); // Valid length
  headers.set('content-type', 'application/json');

  return new MockNextRequest('http://localhost/api/generate', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ action: 'audit', payload: {} }), // Invalid payload but enough to pass initial checks
  }) as unknown as NextRequest;
}

async function runTest() {
  console.log('Testing API Rate Limiting...');

  const ip = '192.168.1.' + Math.floor(Math.random() * 255);
  const MAX_REQUESTS = 60; // Updated to match lib/rateLimit.ts config

  // We expect the first 60 requests to fail with 400 (Invalid JSON/Validation) or 500 (Missing API Key)
  // BUT NOT 429 (Rate Limit).
  // The handler checks rate limit FIRST.

  // Wait, if rate limit is first, then even invalid requests count towards limit?
  // Yes, that's usually good practice to prevent DoS even with invalid payloads.
  // My implementation puts rate limit check at step 0, BEFORE validation.

  console.log(`Simulating ${MAX_REQUESTS} requests from IP ${ip}...`);

  for (let i = 0; i < MAX_REQUESTS; i++) {
    const req = createRequest(ip);
    const res = await POST(req);

    if (res.status === 429) {
      console.error(`Request ${i + 1} was incorrectly rate limited!`);
      process.exit(1);
    }
  }

  console.log(`Verifying request ${MAX_REQUESTS + 1} is rate limited...`);
  const req = createRequest(ip);
  const res = await POST(req);

  if (res.status !== 429) {
    console.error(`Request ${MAX_REQUESTS + 1} should have been rate limited (Status: ${res.status})`);
    // Print body if possible
    try {
        const body = await res.json();
        console.error('Response body:', body);
    } catch (e) {}
    process.exit(1);
  }

  const body = await res.json();
  if (body.errorCode !== 'RATE_LIMIT_EXCEEDED') {
     console.error(`Expected error code RATE_LIMIT_EXCEEDED, got ${body.errorCode}`);
     process.exit(1);
  }

  // Check different IP
  console.log('Verifying different IP is NOT rate limited...');
  const newIp = '10.0.0.' + Math.floor(Math.random() * 255);
  const req2 = createRequest(newIp);
  const res2 = await POST(req2);

  if (res2.status === 429) {
      console.error(`New IP ${newIp} was incorrectly rate limited!`);
      process.exit(1);
  }
  console.log('✅ Different IP check passed');

  console.log('✅ API Rate Limiting verified successfully!');
}

runTest().catch(e => {
  console.error('Test failed with error:', e);
  process.exit(1);
});
