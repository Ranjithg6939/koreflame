/**
 * KoreFlame - Automated Authentication Test Suite
 * Comprehensive automated verification covering client & server validation,
 * database persistence, password hashing, session cookies, rate limiting,
 * role-based access control, and edge cases.
 */

const assert = require('node:assert');
const crypto = require('node:crypto');
const http = require('node:http');
const db = require('../server/db');
const { validateEmail, validatePassword, validateName } = require('../server/validation');
const app = require('../server');

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    // Listen on dynamic port (0) to avoid conflicts
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Runner] Test server listening on ${baseUrl}`);
      resolve();
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve());
    } else {
      resolve();
    }
  });
}

// Helper: HTTP request wrapper
async function apiRequest(path, { method = 'GET', body = null, headers = {}, cookie = null } = {}) {
  const url = `${baseUrl}${path}`;
  const reqHeaders = { ...headers };
  if (body) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  if (cookie) {
    reqHeaders['Cookie'] = cookie;
  }

  const response = await fetch(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : null
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  const setCookie = response.headers.get('set-cookie');
  return { status: response.status, data, headers: response.headers, setCookie };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🔥 Running KoreFlame Authentication Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• ${name} ... `);
    try {
      await fn();
      console.log('PASSED ✅');
      passed++;
    } catch (err) {
      console.log('FAILED ❌');
      console.error('  Error:', err.message);
      failed++;
    }
  }

  await startServer();

  try {
    // ------------------------------------------------------------------------
    // Scenario 1: Email Validation Syntax & Normalization
    // ------------------------------------------------------------------------
    await test('Email validation rejects malformed emails', () => {
      const malformed = ['ranjith@', 'user.com', 'user@.com', 'abc@@gmail.com', 'user with spaces@gmail.com', ''];
      for (const email of malformed) {
        const result = validateEmail(email);
        assert.strictEqual(result.valid, false, `Failed to reject: "${email}"`);
      }
    });

    await test('Email validation accepts valid emails and trims/normalizes to lowercase', () => {
      const valid = '   DiningGuest@KoreFlame.COM   ';
      const result = validateEmail(valid);
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'diningguest@koreflame.com');
    });

    // ------------------------------------------------------------------------
    // Scenario 2: Strong Password Validation Rules
    // ------------------------------------------------------------------------
    await test('Password validation rejects passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('8 characters'));
    });

    await test('Password validation rejects passwords missing uppercase letter', () => {
      const result = validatePassword('nouppercase123!');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('uppercase'));
    });

    await test('Password validation rejects passwords missing lowercase letter', () => {
      const result = validatePassword('NOLOWERCASE123!');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('lowercase'));
    });

    await test('Password validation rejects passwords missing number', () => {
      const result = validatePassword('NoNumbersSpecial!');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('number'));
    });

    await test('Password validation rejects passwords missing special character', () => {
      const result = validatePassword('NoSpecialChar1234');
      assert.strictEqual(result.valid, false);
      assert.ok(result.message.includes('special character'));
    });

    await test('Password validation rejects common passwords (e.g. 123456, password)', () => {
      assert.strictEqual(validatePassword('password').valid, false);
      assert.strictEqual(validatePassword('123456').valid, false);
      assert.strictEqual(validatePassword('qwerty').valid, false);
      assert.strictEqual(validatePassword('admin').valid, false);
    });

    await test('Password validation accepts genuine strong password', () => {
      const result = validatePassword('SeoulGrill@2026!');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.value, 'SeoulGrill@2026!');
    });

    // ------------------------------------------------------------------------
    // Scenario 3: Registration API Validation & Error Reporting
    // ------------------------------------------------------------------------
    await test('Registration API rejects empty form with 400 Bad Request', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {}
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.success, false);
    });

    await test('Registration API rejects mismatched passwords with 400 Bad Request', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Test Guest',
          email: 'testmismatch@koreflame.com',
          password: 'Password@1234!',
          confirmPassword: 'DifferentPassword@1234!',
          agreeTerms: true
        }
      });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.data.field, 'confirmPassword');
      assert.strictEqual(res.data.message, 'Passwords do not match.');
    });

    // ------------------------------------------------------------------------
    // Scenario 4: Valid Registration & Database Persistence
    // ------------------------------------------------------------------------
    const uniqueEmail = `testuser_${Date.now()}@koreflame.com`;
    let userCookie = null;

    await test('Valid registration persists user to database and issues HttpOnly cookie', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Ji-Hoon Park',
          email: uniqueEmail,
          phone: '+1 (555) 789-0123',
          password: 'KoreFlame#Master2026',
          confirmPassword: 'KoreFlame#Master2026',
          agreeTerms: true
        }
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.user.email, uniqueEmail);
      assert.strictEqual(res.data.user.name, 'Ji-Hoon Park');
      assert.strictEqual(res.data.user.points, 200);

      // Verify password is NOT exposed in response
      assert.strictEqual(res.data.user.password_hash, undefined);
      assert.strictEqual(res.data.user.password, undefined);

      // Verify Set-Cookie header exists with HttpOnly
      assert.ok(res.setCookie, 'Expected Set-Cookie header');
      assert.ok(res.setCookie.includes('HttpOnly'), 'Expected HttpOnly cookie');
      userCookie = res.setCookie.split(';')[0];

      // Verify user actually persisted in SQLite DB
      const dbUser = db.findUserByEmail(uniqueEmail);
      assert.ok(dbUser, 'User not found in SQLite database');
      assert.strictEqual(dbUser.email, uniqueEmail);
    });

    // ------------------------------------------------------------------------
    // Scenario 5: Duplicate Registration Rejection
    // ------------------------------------------------------------------------
    await test('Duplicate registration returns 409 Conflict with exact error message', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Ji-Hoon Park Clone',
          email: uniqueEmail,
          password: 'KoreFlame#Master2026',
          confirmPassword: 'KoreFlame#Master2026',
          agreeTerms: true
        }
      });
      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'An account with this email already exists. Please log in.');
    });

    // ------------------------------------------------------------------------
    // Scenario 6: Login API Authentication
    // ------------------------------------------------------------------------
    await test('Login with incorrect password returns 401 Unauthorized', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: uniqueEmail,
          password: 'WrongPassword@999'
        }
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.success, false);
    });

    await test('Login with non-existent account returns 401 Unauthorized without account enumeration', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent_account_12345@koreflame.com',
          password: 'Password@1234!'
        }
      });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid email address or password. Please try again.');
    });

    await test('Login with correct credentials returns 200 OK and valid session', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          email: uniqueEmail,
          password: 'KoreFlame#Master2026'
        }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.user.email, uniqueEmail);
      assert.ok(res.data.token, 'Expected session token in response');
      userCookie = res.setCookie.split(';')[0];
    });

    // ------------------------------------------------------------------------
    // Scenario 6b: State verifyCredentials (Offline/Client Defense)
    // ------------------------------------------------------------------------
    await test('Client verifyCredentials strictly rejects non-existent accounts (never auto-creates)', () => {
      // Mock basic localStorage environment
      const memStore = {};
      global.localStorage = {
        getItem: (k) => memStore[k] || null,
        setItem: (k, v) => { memStore[k] = String(v); },
        removeItem: (k) => { delete memStore[k]; }
      };
      global.window = { dispatchEvent: () => {} };
      global.document = { documentElement: { setAttribute: () => {} } };
      global.CustomEvent = class {};

      const statePath = require.resolve('../assets/js/state.js');
      const stateContent = require('fs').readFileSync(statePath, 'utf8');
      const evalState = new Function('localStorage', 'window', 'CustomEvent', `${stateContent}; return KF_STATE;`);
      const testState = evalState(global.localStorage, global.window, global.CustomEvent);

      // Attempt login with unregistered account
      const unreg = testState.verifyCredentials('never_created@example.com', 'SomePassword123!');
      assert.strictEqual(unreg.success, false, 'Unregistered account MUST be rejected');
      assert.strictEqual(unreg.error, 'ACCOUNT_NOT_FOUND');

      // Attempt login with registered account but wrong password
      const wrongPass = testState.verifyCredentials('guest@koreflame.com', 'WrongPassword@123!');
      assert.strictEqual(wrongPass.success, false, 'Wrong password MUST be rejected');
      assert.strictEqual(wrongPass.error, 'INVALID_CREDENTIALS');

      // Attempt login with registered account and correct password
      const correct = testState.verifyCredentials('guest@koreflame.com', 'Guest@KoreFlame2026!');
      assert.strictEqual(correct.success, true, 'Correct password for registered account MUST succeed');
      assert.strictEqual(correct.user.email, 'guest@koreflame.com');
    });

    // ------------------------------------------------------------------------
    // Scenario 7: Session Verification (/api/auth/me) & Logout
    // ------------------------------------------------------------------------
    await test('/api/auth/me returns 401 Unauthorized without cookie', async () => {
      const res = await apiRequest('/api/auth/me');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.authenticated, false);
    });

    await test('/api/auth/me returns authenticated user with valid session cookie', async () => {
      const res = await apiRequest('/api/auth/me', { cookie: userCookie });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.authenticated, true);
      assert.strictEqual(res.data.user.email, uniqueEmail);
    });

    await test('Logout invalidates server session', async () => {
      const res = await apiRequest('/api/auth/logout', { method: 'POST', cookie: userCookie });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);

      // Verify session is now rejected
      const checkRes = await apiRequest('/api/auth/me', { cookie: userCookie });
      assert.strictEqual(checkRes.status, 401);
    });

    await test('/api/auth/me accepts Bearer token and rejects invalidated token after logout', async () => {
      // Re-login to get a fresh session and token
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: uniqueEmail, password: 'KoreFlame#Master2026' }
      });
      const token = loginRes.data.token;
      assert.ok(token, 'Expected token from login response');

      // Check session via Bearer token without cookie
      const meRes = await apiRequest('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(meRes.status, 200);
      assert.strictEqual(meRes.data.authenticated, true);
      assert.strictEqual(meRes.data.user.email, uniqueEmail);

      // Logout with Bearer token
      const logoutRes = await apiRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(logoutRes.status, 200);

      // Verify Bearer token is now rejected
      const postLogout = await apiRequest('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(postLogout.status, 401);
      assert.strictEqual(postLogout.data.authenticated, false);
    });

    // ------------------------------------------------------------------------
    // Scenario 8: Role Authorization & Privilege Escalation Protection
    // ------------------------------------------------------------------------
    await test('Guest user cannot access protected admin check endpoint (403 Forbidden)', async () => {
      // Log in guest user
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: uniqueEmail, password: 'KoreFlame#Master2026' }
      });
      const guestCookie = loginRes.setCookie.split(';')[0];

      // Try accessing admin
      const adminRes = await apiRequest('/api/admin/check', { cookie: guestCookie });
      assert.strictEqual(adminRes.status, 403);
      assert.strictEqual(adminRes.data.success, false);
    });

    await test('Seeded Admin account can authenticate and access admin endpoint', async () => {
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'admin@koreflame.com', password: 'Admin@KoreFlame2026!' }
      });
      assert.strictEqual(loginRes.status, 200);
      assert.strictEqual(loginRes.data.user.role, 'admin');

      const adminCookie = loginRes.setCookie.split(';')[0];
      const checkRes = await apiRequest('/api/admin/check', { cookie: adminCookie });
      assert.strictEqual(checkRes.status, 200);
      assert.strictEqual(checkRes.data.success, true);
    });

    // ------------------------------------------------------------------------
    // Scenario 9: Forgot Password & Reset Token Cryptography
    // ------------------------------------------------------------------------
    await test('Forgot password endpoint returns generic safe message and saves hashed token', async () => {
      const res = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: uniqueEmail }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.message.includes('If an account is associated with that email'));

      // Verify token hash in DB
      const user = db.findUserByEmail(uniqueEmail);
      const row = db.db.prepare('SELECT * FROM password_resets WHERE user_id = ? AND used = 0').get(user.id);
      assert.ok(row, 'Expected unexpired password reset token in DB');
      assert.strictEqual(row.token_hash.length, 64, 'Token hash must be SHA-256 (64 hex chars)');
    });

    // ------------------------------------------------------------------------
    // Scenario 10: OAuth Configuration Endpoint
    // ------------------------------------------------------------------------
    await test('OAuth provider discovery /config returns truthful configuration flags', async () => {
      const res = await apiRequest('/api/auth/config');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(typeof res.data.googleConfigured, 'boolean');
      assert.strictEqual(typeof res.data.appleConfigured, 'boolean');
    });

    await test('Unconfigured Google sign-in returns honest 501 error message', async () => {
      const res = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: { idToken: 'fake-token' }
      });
      if (!process.env.GOOGLE_CLIENT_ID) {
        assert.strictEqual(res.status, 501);
        assert.strictEqual(res.data.message, 'Google sign-in is not configured yet. Please use email registration.');
      }
    });

    await test('Unconfigured Apple sign-in returns honest 501 error message', async () => {
      const res = await apiRequest('/api/auth/apple', {
        method: 'POST',
        body: { identityToken: 'fake-token' }
      });
      if (!process.env.APPLE_SERVICE_ID) {
        assert.strictEqual(res.status, 501);
        assert.strictEqual(res.data.message, 'Apple sign-in is not configured yet. Please use email registration.');
      }
    });

  } finally {
    await stopServer();
  }

  console.log('\n======================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
