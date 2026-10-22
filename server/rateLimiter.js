/**
 * KoreFlame - Security Rate Limiter
 * In-memory sliding window rate limiter to protect against brute-force attacks and abuse.
 */

class RateLimiter {
  constructor(windowMs = 15 * 60 * 1000, maxRequests = 10, message = 'Too many requests. Please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.hits = new Map();

    // Periodic cleanup of expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000).unref();
  }

  middleware(keyGenerator = (req) => req.ip || req.connection?.remoteAddress || 'unknown') {
    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      let record = this.hits.get(key);

      if (!record) {
        record = [];
        this.hits.set(key, record);
      }

      // Filter timestamps within current window
      const validTimestamps = record.filter(timestamp => now - timestamp < this.windowMs);
      this.hits.set(key, validTimestamps);

      if (validTimestamps.length >= this.maxRequests) {
        const oldest = validTimestamps[0];
        const retryAfterSeconds = Math.ceil((this.windowMs - (now - oldest)) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: this.message,
          retryAfter: retryAfterSeconds
        });
      }

      validTimestamps.push(now);
      next();
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(t => now - t < this.windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

const loginLimiter = new RateLimiter(
  15 * 60 * 1000,
  20,
  'Too many sign-in attempts from this connection. For security, please wait 15 minutes before trying again.'
);

const registerLimiter = new RateLimiter(
  60 * 60 * 1000,
  10,
  'Too many registration attempts. Please wait an hour before creating another account.'
);

const forgotPasswordLimiter = new RateLimiter(
  15 * 60 * 1000,
  3,
  'Too many password reset requests. Please wait 15 minutes before requesting another link.'
);

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter
};
