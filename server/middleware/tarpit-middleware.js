/**
 * Tarpit Middleware
 * Implements rate limiting with progressive delays for suspicious clients
 * Uses Redis to track request counts per fingerprint
 */

const redisClient = require('../redis/client');

/**
 * Tarpit middleware - delays responses for clients making too many requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function tarpitMiddleware(req, res, next) {
  // Ensure fingerprint exists (from fingerprint middleware)

  if (!req.fingerprint || !req.fingerprint.fingerprint) {
    // If fingerprint doesn't exist, skip tarpit and continue
    return next();
  }
  console.log(req.fingerprint,"req.fingerprint");
  const fingerprint = req.fingerprint.fingerprint;
  const redisKey = `rl:${fingerprint}`;
  
  try {
    // Check if Redis is connected (redis v4+ uses isReady)
    // Also check status as fallback
    const isRedisReady = redisClient.isReady === true || redisClient.status === 'ready';
    if (!isRedisReady) {
      // Redis not available, skip tarpit
      req.fingerprint.count = 0;
      return next();
    }

    // Increment request count
    const count = await redisClient.incr(redisKey);

    // Set expiry on first request (60 seconds)
    if (count === 1) {
      await redisClient.expire(redisKey, 60);
    }

    // Attach count to request for later inspection
    req.fingerprint.count = count;

    // Apply progressive delay if count exceeds threshold
    console.log(count,"count");
    if (count > 30) {
        console.log("count is greater than 3 , delay activated ");
      // Calculate delay: (count - 3) * 200ms, max 5000ms
      const delay = Math.min((count - 3) * 200, 5000);
      
      // Non-blocking delay - only delays this specific request
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Log tarpit activation (optional, for monitoring)
      if (count % 10 === 0) {
        console.log(`🐌 Tarpit active for fingerprint ${fingerprint.slice(0, 16)}... (count: ${count}, delay: ${delay}ms)`);
      }
    }

    // Continue to next middleware/route
    next();
  } catch (error) {
    // If Redis operation fails, log error but continue
    console.error('❌ Tarpit middleware error:', error);
    req.fingerprint.count = 0;
    next();
  }
}

module.exports = tarpitMiddleware;

