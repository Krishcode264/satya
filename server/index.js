const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const { detectAttack, generateDeceptionResponse } = require('./attackDetector');
const { logAttack, getAttackLogs, getStats, getHashChain } = require('./logManager');

const app = express();
expressWs(app);

app.use(cors());
app.use(express.json());

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

  // Detect attack type
  const attackResult = detectAttack(userInput);
  
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

  // Broadcast to dashboards
  broadcastToDashboards({
    type: 'new_attack',
    log: logEntry,
    stats: getStats(),
    hashChain: getHashChain()
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

