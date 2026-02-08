import { middleware } from '../middleware';
import { NextRequest } from 'next/server';

async function runTest() {
  console.log('Testing Middleware Security Headers...');

  // Mock Request
  const req = new NextRequest('http://localhost:3000/');

  // Run Middleware
  const res = middleware(req);

  // Verify Headers
  const headers = res.headers;

  const expectedHeaders = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()'
  };

  let passed = true;

  for (const [key, value] of Object.entries(expectedHeaders)) {
    const actual = headers.get(key);
    if (actual !== value) {
      console.error(`❌ Header mismatch for ${key}`);
      console.error(`   Expected: ${value}`);
      console.error(`   Actual:   ${actual}`);
      passed = false;
    } else {
      console.log(`✅ ${key} is correct`);
    }
  }

  // Ensure CSP is NOT present (removed to avoid breaking changes)
  if (headers.has('content-security-policy')) {
     console.error('❌ Content-Security-Policy should NOT be present');
     passed = false;
  } else {
     console.log('✅ Content-Security-Policy is correctly omitted');
  }

  if (passed) {
    console.log('🎉 All security headers are correct!');
    process.exit(0);
  } else {
    console.error('FAILED: Some headers were missing or incorrect.');
    process.exit(1);
  }
}

runTest().catch(e => {
  console.error(e);
  process.exit(1);
});
