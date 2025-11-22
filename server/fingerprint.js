// fingerprint-middleware.js
const crypto = require('crypto');

const COOKIE_NAME = '__attack_session';
const HMAC_SECRET = process.env.FP_SECRET || 'replace_with_strong_random_secret';

// normalize header text (shorten huge UAs, remove variable bits if needed)
function normalizeUA(ua = '') {
  return ua.split(')')[0].slice(0, 200); // simple normalization example
}

function getRemoteIp(req) {
  // Make sure you set app.set('trust proxy', true) if behind proxies
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    return xff.split(',')[0].trim();
  }
  // req.ip is Express-aware if trust proxy set
  return req.ip || req.connection?.remoteAddress || '127.0.0.1';
}

function hmacHash(value) {
  return crypto.createHmac('sha256', HMAC_SECRET).update(value).digest('hex');
}

function fingerprintMiddleware(req, res, next) {
  // 1) Ensure a server cookie to help correlation
  let session = req.cookies?.[COOKIE_NAME];
  if (!session) {
    session = crypto.randomUUID();
    // cookie options - secure, httpOnly etc.
    res.cookie(COOKIE_NAME, session, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 30 });
  }

  // 2) gather values
  const ip = getRemoteIp(req);
  const ua = normalizeUA(req.headers['user-agent'] || '');
  const al = (req.headers['accept-language'] || '').split(',')[0] || '';
  const path = req.originalUrl || req.url;
  const method = req.method;

  // 3) fingerprint string; choose what to include — order matters
  const fingerprintSource = `${ip}|${ua}|${al}`;
  const fingerprint = hmacHash(fingerprintSource);

  // attach for later use
  req.fingerprint = { fingerprint, fingerprintSource, session, ip, ua, al, path, method };

  // optionally attach a short id for logging (not raw fingerprint)
  req.attackId = fingerprint.slice(0, 16);

  next();
}

// Export both the middleware and hmacHash function
module.exports = fingerprintMiddleware;
module.exports.hmacHash = hmacHash;
