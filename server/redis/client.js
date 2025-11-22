// Load environment variables from .env file
require('dotenv').config();

const redis = require('redis');
console.log(process.env.REDIS_URL,"process.env.REDIS_URL");

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';


console.log(REDIS_URL,"REDIS_URL");
// Create Redis client
const client = redis.createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 5000, // 5 second timeout
  }
});

// Error handling
client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

client.on('connect', () => {
  console.log('🔄 Redis: Connecting to', REDIS_URL);
});

client.on('ready', () => {
  console.log('✅ Redis: Client ready and connected');
});

client.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

client.on('end', () => {
  console.log('⚠️  Redis: Connection ended');
});

// Connect to Redis with better error handling
(async () => {
  try {
    console.log('🔄 Redis: Attempting to connect...');
    await client.connect();
    console.log('✅ Redis: Connected successfully');
    
    // Test connection with a ping
    try {
      const pong = await client.ping();
      if (pong === 'PONG') {
        console.log('✅ Redis: Connection verified with PING');
      }
    } catch (pingErr) {
      console.warn('⚠️  Redis: PING test failed:', pingErr.message);
    }
  } catch (err) {
    console.error('❌ Redis: Failed to connect:', err.message);
    console.log('⚠️  Continuing without Redis - tarpit will not work');
    console.log('💡 Make sure Redis is running. Docker: docker run -d -p 6379:6379 redis');
    console.log('💡 Or check if Redis is accessible at:', REDIS_URL);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Closing Redis connection...');
  await client.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Closing Redis connection...');
  await client.quit();
  process.exit(0);
});

module.exports = client;

