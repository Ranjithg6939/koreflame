/**
 * KoreFlame - Authentication API Routes
 * Secure authentication controller handling registration, login, logout,
 * OAuth verification, password resets, session management, and rate limiting.
 */

const express = require('express');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { validateEmail, validatePassword, validateName } = require('./validation');
const { loginLimiter, registerLimiter, forgotPasswordLimiter } = require('./rateLimiter');
const { sendPasswordResetEmail, sendVerificationEmail, isConfigured: smtpConfigured } = require('./emailService');

const router = express.Router();

const COOKIE_NAME = 'kf_session';
const IS_PROD = process.env.NODE_ENV === 'production';

// Helper: set secure session cookie
function setSessionCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge,
    path: '/'
  });
}

// Helper: extract token from cookie or Authorization header
function getRequestToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

// ----------------------------------------------------------------------------
// 1. Provider Configuration Discovery
// ----------------------------------------------------------------------------
router.get('/config', (req, res) => {
  res.json({
    success: true,
    googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    appleConfigured: Boolean(process.env.APPLE_SERVICE_ID),
    appleServiceId: process.env.APPLE_SERVICE_ID || null,
    smtpConfigured
  });
});

// ----------------------------------------------------------------------------
// 2. User Registration
// ----------------------------------------------------------------------------
router.post('/register', registerLimiter.middleware(), async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, agreeTerms } = req.body || {};

    // 1. Validate Terms
    if (!agreeTerms) {
      return res.status(400).json({
        success: false,
        field: 'agreeTerms',
        message: 'You must agree to the table reservation policies and loyalty terms.'
      });
    }

    // 2. Validate Full Name
    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: nameCheck.message
      });
    }

    // 3. Validate Email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: emailCheck.message
      });
    }
    const normalizedEmail = emailCheck.value;

    // 4. Validate Password
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: passCheck.message
      });
    }

    // 5. Confirm Password
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Passwords do not match.'
      });
    }

    // 6. Check Email Uniqueness in Database
    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        field: 'email',
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // 7. Hash Password using bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 8. Create User in SQLite Database
    const newUser = db.createUser({
      name: nameCheck.value,
      email: normalizedEmail,
      phone: (phone || '').trim() || null,
      passwordHash,
      role: 'guest',
      tier: 'Bronze Member',
      points: 200,
      emailVerified: 1 // In dev default verified; if verification flow activated can toggle
    });

    // 9. Generate Cryptographically Secure Session Token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    db.createSession(sessionToken, newUser.id, expiresAt);

    // 10. Issue HttpOnly Session Cookie
    setSessionCookie(res, sessionToken, true);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! 200 welcome loyalty points awarded.',
      token: sessionToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        tier: newUser.tier,
        points: newUser.points,
        emailVerified: newUser.email_verified,
        avatar: newUser.avatar,
        isLoggedIn: true
      }
    });
  } catch (err) {
    console.error('[Registration Error]', err);
    return res.status(500).json({
      success: false,
      message: 'A server error occurred while creating your account. Please try again.'
    });
  }
});

// ----------------------------------------------------------------------------
// 3. User Login
// ----------------------------------------------------------------------------
router.post('/login', loginLimiter.middleware(), async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body || {};

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Email address is required.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password is required.'
      });
    }

    const trimmedIdentifier = String(email).trim().toLowerCase();
    const user = db.findUserByEmail(trimmedIdentifier);

    // Timing-safe check: always perform a bcrypt comparison even if user doesn't exist
    // to prevent timing attacks that reveal user existence
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLM';
    const hashToCompare = user && user.password_hash ? user.password_hash : dummyHash;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email address or password. Please try again.'
      });
    }

    // Generate Session Token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const durationDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    db.createSession(sessionToken, user.id, expiresAt);

    setSessionCookie(res, sessionToken, Boolean(rememberMe));

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tier: user.tier,
        points: user.points,
        emailVerified: user.email_verified,
        avatar: user.avatar,
        isLoggedIn: true
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({
      success: false,
      message: 'A server error occurred during sign-in. Please try again.'
    });
  }
});

// ----------------------------------------------------------------------------
// 4. Current User Session Check (/me)
// ----------------------------------------------------------------------------
router.get('/me', (req, res) => {
  const token = getRequestToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'No active authentication session.'
    });
  }

  const session = db.findSession(token);
  if (!session) {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Session expired or invalidated. Please sign in again.'
    });
  }

  return res.json({
    success: true,
    authenticated: true,
    user: {
      id: session.user_id,
      name: session.name,
      email: session.email,
      phone: session.phone,
      role: session.role,
      tier: session.tier,
      points: session.points,
      emailVerified: session.email_verified,
      avatar: session.avatar,
      memberSince: session.member_since,
      isLoggedIn: true
    }
  });
});

// ----------------------------------------------------------------------------
// 5. User Logout
// ----------------------------------------------------------------------------
router.post('/logout', (req, res) => {
  const token = getRequestToken(req);
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

// ----------------------------------------------------------------------------
// 6. Google Sign-In
// ----------------------------------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(501).json({
        success: false,
        error: 'GOOGLE_NOT_CONFIGURED',
        message: 'Google sign-in is not configured yet. Please use email registration.'
      });
    }

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing Google identity token.'
      });
    }

    // Verify token with Google's public tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!response.ok) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_GOOGLE_TOKEN',
        message: 'Google authentication token verification failed.'
      });
    }

    const payload = await response.json();

    // Verify audience matches configured Client ID
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({
        success: false,
        error: 'AUDIENCE_MISMATCH',
        message: 'Google token audience does not match configured application.'
      });
    }

    // Verify email presence and normalized identity
    const googleEmail = (payload.email || '').trim().toLowerCase();
    const googleName = payload.name || payload.given_name || 'Google Guest';
    const googleSub = payload.sub;
    const googleAvatar = payload.picture || null;

    let user = db.findUserByOAuth('google', googleSub);
    if (!user && googleEmail) {
      user = db.findUserByEmail(googleEmail);
    }

    if (!user) {
      user = db.createUser({
        name: googleName,
        email: googleEmail,
        passwordHash: null,
        role: 'guest',
        tier: 'Bronze Member',
        points: 200,
        emailVerified: 1,
        oauthProvider: 'google',
        oauthId: googleSub,
        avatar: googleAvatar
      });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    db.createSession(sessionToken, user.id, expiresAt);
    setSessionCookie(res, sessionToken, true);

    return res.json({
      success: true,
      message: `Signed in with Google as ${user.name}!`,
      token: sessionToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        tier: user.tier,
        points: user.points,
        emailVerified: user.email_verified,
        avatar: user.avatar,
        isLoggedIn: true
      }
    });
  } catch (err) {
    console.error('[Google Auth Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Google sign-in encounter a communication failure. Please try email sign-in.'
    });
  }
});

// ----------------------------------------------------------------------------
// 7. Apple Sign-In
// ----------------------------------------------------------------------------
router.post('/apple', async (req, res) => {
  try {
    const { identityToken, user: appleUserData } = req.body || {};

    if (!process.env.APPLE_SERVICE_ID) {
      return res.status(501).json({
        success: false,
        error: 'APPLE_NOT_CONFIGURED',
        message: 'Apple sign-in is not configured yet. Please use email registration.'
      });
    }

    if (!identityToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing Apple identity token.'
      });
    }

    // In production with Apple developer keys, identity token JWT is decoded and verified against Apple public keys
    // For now, if configured without keys, report safe error:
    return res.status(501).json({
      success: false,
      error: 'APPLE_NOT_CONFIGURED',
      message: 'Apple sign-in is not configured yet. Please use email registration.'
    });
  } catch (err) {
    console.error('[Apple Auth Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Apple sign-in encountered an unexpected issue.'
    });
  }
});

// ----------------------------------------------------------------------------
// 8. Forgot Password Flow
// ----------------------------------------------------------------------------
router.post('/forgot-password', forgotPasswordLimiter.middleware(), async (req, res) => {
  try {
    const { email } = req.body || {};
    const emailCheck = validateEmail(email);

    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const user = db.findUserByEmail(emailCheck.value);

    // Security requirement: Always return generic response to prevent account enumeration
    const genericResponse = {
      success: true,
      message: 'If an account is associated with that email, instructions to reset your password have been dispatched.'
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate single-use crypto token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    db.createPasswordReset(user.id, tokenHash, expiresAt);

    const protocol = req.protocol;
    const host = req.get('host');
    const resetUrl = `${protocol}://${host}/reset-password.html?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.json(genericResponse);
  } catch (err) {
    console.error('[Forgot Password Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to process password reset request at this time.'
    });
  }
});

// ----------------------------------------------------------------------------
// 9. Reset Password Execution
// ----------------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is missing.'
      });
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passCheck.message
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const record = db.findValidPasswordReset(tokenHash);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update password in DB
    db.updateUserPassword(record.user_id, passwordHash);
    db.markPasswordResetUsed(record.id);

    // Invalidate existing sessions for security
    db.deleteUserSessions(record.user_id);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new credentials.'
    });
  } catch (err) {
    console.error('[Reset Password Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to reset password. Please try again later.'
    });
  }
});

module.exports = router;
