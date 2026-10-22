/**
 * KoreFlame - SQLite Database Layer
 * Persistent, parameterized SQLite database using Node 24 native node:sqlite.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'koreflame.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'guest',
    tier TEXT NOT NULL DEFAULT 'Bronze Member',
    points INTEGER NOT NULL DEFAULT 200,
    email_verified INTEGER NOT NULL DEFAULT 0,
    oauth_provider TEXT,
    oauth_id TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);

  CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_email_verif_token ON email_verifications(token_hash);
`);

// Seed default users if table is empty
function seedDefaultUsers() {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const row = checkStmt.get();
  if (row.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role, tier, points, email_verified, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Guest user: Guest@KoreFlame2026!
    const guestHash = bcrypt.hashSync('Guest@KoreFlame2026!', 10);
    insertStmt.run(
      'Min-Ji Kim',
      'guest@koreflame.com',
      '+1 (555) 382-7492',
      guestHash,
      'guest',
      'Gold Grillmaster',
      1240,
      1,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
    );

    // Admin user: Admin@KoreFlame2026!
    const adminHash = bcrypt.hashSync('Admin@KoreFlame2026!', 10);
    insertStmt.run(
      'Executive Chef Kang',
      'admin@koreflame.com',
      '+1 (555) 890-1122',
      adminHash,
      'admin',
      'Executive Staff',
      9999,
      1,
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=400&auto=format&fit=crop'
    );

    console.log('[KoreFlame DB] Default accounts initialized (guest@koreflame.com & admin@koreflame.com).');
  }
}

seedDefaultUsers();

module.exports = {
  db,
  // User queries
  findUserByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    return stmt.get(email.trim().toLowerCase());
  },
  findUserById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },
  findUserByOAuth(provider, oauthId) {
    const stmt = db.prepare('SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?');
    return stmt.get(provider, oauthId);
  },
  createUser({ name, email, phone, passwordHash, role = 'guest', tier = 'Bronze Member', points = 200, emailVerified = 0, oauthProvider = null, oauthId = null, avatar = null }) {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role, tier, points, email_verified, oauth_provider, oauth_id, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      name.trim(),
      email.trim().toLowerCase(),
      phone ? phone.trim() : null,
      passwordHash || null,
      role,
      tier,
      points,
      emailVerified,
      oauthProvider,
      oauthId,
      avatar
    );
    return this.findUserById(result.lastInsertRowid);
  },
  updateUserPassword(userId, passwordHash) {
    const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(passwordHash, userId);
  },
  verifyUserEmail(userId) {
    const stmt = db.prepare('UPDATE users SET email_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(userId);
  },
  // Session queries
  createSession(token, userId, expiresAt) {
    const stmt = db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)');
    stmt.run(token, userId, expiresAt.toISOString());
  },
  findSession(token) {
    const stmt = db.prepare(`
      SELECT s.*, u.id as user_id, u.name, u.email, u.phone, u.role, u.tier, u.points, u.email_verified, u.avatar, u.created_at as member_since
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
    `);
    return stmt.get(token);
  },
  deleteSession(token) {
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(token);
  },
  deleteUserSessions(userId) {
    const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?');
    stmt.run(userId);
  },
  cleanExpiredSessions() {
    db.exec("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')");
  },
  // Password Reset Tokens
  createPasswordReset(userId, tokenHash, expiresAt) {
    // Invalidate prior unused tokens
    const invalidateStmt = db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?');
    invalidateStmt.run(userId);

    const stmt = db.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)');
    stmt.run(userId, tokenHash, expiresAt.toISOString());
  },
  findValidPasswordReset(tokenHash) {
    const stmt = db.prepare(`
      SELECT * FROM password_resets
      WHERE token_hash = ? AND used = 0 AND datetime(expires_at) > datetime('now')
    `);
    return stmt.get(tokenHash);
  },
  markPasswordResetUsed(id) {
    const stmt = db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?');
    stmt.run(id);
  },
  // Email Verification Tokens
  createEmailVerification(userId, tokenHash, expiresAt) {
    const invalidateStmt = db.prepare('UPDATE email_verifications SET used = 1 WHERE user_id = ?');
    invalidateStmt.run(userId);

    const stmt = db.prepare('INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)');
    stmt.run(userId, tokenHash, expiresAt.toISOString());
  },
  findValidEmailVerification(tokenHash) {
    const stmt = db.prepare(`
      SELECT * FROM email_verifications
      WHERE token_hash = ? AND used = 0 AND datetime(expires_at) > datetime('now')
    `);
    return stmt.get(tokenHash);
  },
  markEmailVerificationUsed(id) {
    const stmt = db.prepare('UPDATE email_verifications SET used = 1 WHERE id = ?');
    stmt.run(id);
  }
};
