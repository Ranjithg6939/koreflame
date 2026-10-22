/**
 * KoreFlame - Backend Application Server
 * Serves static restaurant assets and hosts secure authentication & reservation APIs.
 */

require('dotenv').config();
const path = require('node:path');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./server/authRoutes');
const db = require('./server/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'koreflame_cookie_fallback'));

// Basic Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Periodic session cleanup every hour
setInterval(() => {
  try {
    db.cleanExpiredSessions();
  } catch (e) {
    console.error('[Session Cleanup Error]', e);
  }
}, 60 * 60 * 1000).unref();

// Mount Authentication API
app.use('/api/auth', authRoutes);

// Protected Admin API check endpoint
app.get('/api/admin/check', (req, res) => {
  const token = req.cookies?.kf_session || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
  const session = db.findSession(token);
  if (!session || session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrative privileges required.' });
  }
  res.json({ success: true, user: session });
});

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm'],
  index: 'index.html'
}));

// Fallback error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected internal error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔥 [KoreFlame Server] Running at http://localhost:${PORT}`);
    console.log(`🛡️  [Auth System] SQLite database & bcrypt encryption active.`);
  });
}

module.exports = app;
