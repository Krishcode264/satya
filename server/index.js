const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const mongoose = require('mongoose');
const fingerprint = require('./fingerprint');
const { hmacHash } = require('./fingerprint');
const cookieParser = require('cookie-parser');
const { detectAttack, generateDeceptionResponse } = require('./attackDetector');
const { logAttack, getAttackLogs, getStats, getHashChain } = require('./logManager');
const app = express();
expressWs(app);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chameleon-honeypot';
mongoose.connect(MONGODB_URI, {

}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.log('⚠️  Continuing without MongoDB - attacks will not be persisted to database');
});

// Import model after mongoose is set up
const AttackAttempt = require('./schema/attack');

// Debug: Verify model is loaded correctly
if (!AttackAttempt || typeof AttackAttempt.findOneAndUpdate !== 'function') {
  console.warn('⚠️  AttackAttempt model may not be properly initialized');
  console.log('AttackAttempt type:', typeof AttackAttempt);
  console.log('AttackAttempt constructor:', AttackAttempt?.constructor?.name);
} else {
  console.log('✅ AttackAttempt model loaded successfully');
}

app.use(cors());

app.use(express.json());
app.set('trust proxy', true); // important if behind proxy
app.use(cookieParser());
app.use(fingerprint);

// Store WebSocket connections for dashboard
const dashboardConnections = new Set();

// WebSocket endpoint for real-time dashboard updates
app.ws('/ws', (ws, req) => {
  dashboardConnections.add(ws);
  console.log('Dashboard connected');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'initial',
    logs: getAttackLogs(),
    stats: getStats(),
    hashChain: getHashChain()
  }));

  ws.on('close', () => {
    dashboardConnections.delete(ws);
    console.log('Dashboard disconnected');
  });
});

// Broadcast to all dashboard connections
function broadcastToDashboards(data) {
  const message = JSON.stringify(data);
  dashboardConnections.forEach(ws => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });
}

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  const { userInput, page = 'login', field = 'username' } = req.body;
  
  if (!userInput) {
    return res.status(400).json({ error: 'userInput is required' });
  }

  // Get client IP
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
console.log(ip,"ip is here ");
  // Detect attack type
  const attackResult = detectAttack(userInput);
  console.log(attackResult,"attackResult");
  // Generate deception response
  const deception = generateDeceptionResponse(attackResult.attackType, attackResult.severity);
  
  // Log the attack
  const logEntry = logAttack({
    input: userInput,
    attackType: attackResult.attackType,
    ip: ip,
    page: page,
    field: field,
    deceptionUsed: deception.message,
    severity: attackResult.severity
  });

  // Save to MongoDB if attack is suspicious (not NORMAL)
  let dbEntry = null;
  if (attackResult.attackType !== 'NORMAL' && mongoose.connection.readyState === 1) {
    try {
      // Verify AttackAttempt is a valid model
      if (!AttackAttempt || typeof AttackAttempt.findOneAndUpdate !== 'function') {
        throw new Error('AttackAttempt model is not properly initialized');
      }

      // Get fingerprint data from middleware
      const { fingerprint: fp, session, ip: fpIp, ua, al, path, method } = req.fingerprint || {};
      
      // Create payload hash
      const payload = JSON.stringify(req.body || req.query || req.url);
      const payload_hash = hmacHash(payload);
      
      // Normalize attack type for database (convert to lowercase, keep underscores)
      const detectionType = attackResult.attackType.toLowerCase();
      
      // Store sample payload (truncated for safety, max 500 chars)
      const sample_payload = userInput.length > 500 ? userInput.substring(0, 500) + '...' : userInput;
      
      // Use findOneAndUpdate with upsert to track count
      dbEntry = await AttackAttempt.findOneAndUpdate(
        { 
          fingerprint: fp, 
          attack_type: detectionType, 
          payload_hash 
        },
        {
          $setOnInsert: { 
            fingerprint: fp, 
            session, 
            ip: fpIp || ip, 
            ua_hash: hmacHash(ua || ''), 
            accept_language: al, 
            route: path, 
            method,
            sample_payload
          },
          $inc: { count: 1 },
          $set: { last_seen: new Date() }
        },
        { upsert: true, new: true }
      );
      
      console.log('📝 Attack saved to MongoDB:', {
        fingerprint: fp?.slice(0, 16),
        attack_type: detectionType,
        count: dbEntry?.count
      });
    } catch (dbError) {
      console.error('❌ MongoDB save error:', dbError);
      // Continue execution even if DB save fails
    }
  }

  // Broadcast to dashboards (include DB entry info if available)
  broadcastToDashboards({
    type: 'new_attack',
    log: logEntry,
    stats: getStats(),
    hashChain: getHashChain(),
    dbEntry: dbEntry ? {
      id: dbEntry._id,
      count: dbEntry.count,
      first_seen: dbEntry.first_seen,
      last_seen: dbEntry.last_seen
    } : null
  });

  // Simulate delay for high-severity attacks
  if (attackResult.severity >= 3) {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Return deception response to frontend
  res.json({
    message: deception.message,
    delay: attackResult.severity >= 3,
    attackDetected: attackResult.attackType !== 'NORMAL'
  });
});

// API endpoints for dashboard
app.get('/api/logs', (req, res) => {
  res.json(getAttackLogs());
});

app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.get('/api/hash-chain', (req, res) => {
  res.json(getHashChain());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CHAMELEON Backend running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

