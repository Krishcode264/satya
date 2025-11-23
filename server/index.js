// Load environment variables from .env file
require('dotenv').config();
const { aiPrediction } = require("./service/aiPrediction");
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

// MongoDB connection - reads from .env file or environment variable
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/chameleon-honeypot';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Continuing without MongoDB - attacks will not be persisted to database');

});

// Import models after mongoose is set up
const { AttackAttempt, AttackLog } = require('./schema/attack');

// Debug: Verify models are loaded correctly
if (!AttackAttempt || typeof AttackAttempt.findOneAndUpdate !== 'function') {
  console.warn('⚠️  AttackAttempt model may not be properly initialized');
} else {
  console.log('✅ AttackAttempt model loaded successfully');
}

if (!AttackLog || typeof AttackLog.create !== 'function') {
  console.warn('⚠️  AttackLog model may not be properly initialized');
} else {
  console.log('✅ AttackLog model loaded successfully');
}

app.use(cors());

app.use(express.json());
app.set('trust proxy', true); // important if behind proxy
app.use(cookieParser());
app.use(fingerprint); // Fingerprint middleware (must come first)
app.use(require('./middleware/tarpit-middleware')); // Tarpit middleware (uses fingerprint)

// Store WebSocket connections for dashboard
const dashboardConnections = new Set();

// WebSocket endpoint for real-time dashboard updates
app.ws('/ws', async (ws, req) => {
  dashboardConnections.add(ws);
  console.log('Dashboard connected');

  // Send initial data from MongoDB
  try {
    const [logs, stats, hashChain] = await Promise.all([
      getAttackLogs(),
      getStats(),
      getHashChain()
    ]);

    ws.send(JSON.stringify({
      type: 'initial',
      logs,
      stats,
      hashChain
    }));
  } catch (error) {
    console.error('Error sending initial data to dashboard:', error);
    ws.send(JSON.stringify({
      type: 'initial',
      logs: [],
      stats: {},
      hashChain: {}
    }));
  }

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
const reportRouter = require("./routes/report");
app.use("/api/report", reportRouter.router);


// // Put near top of file (config)
// const MODEL_CONF_THRESH = 0.35; // lower for higher recall; tune later
// const MODEL_HIGH_CONF = 0.6;

// // helper: normalized model output -> {flag, label, confidence}
// function interpretModelOutput(modelResult, expectedLabelName) {
//   // modelResult might be { prediction: "xss" } or { prediction: 1 } or { prediction: 0 }
//   // or { prediction: "xss", confidence: 0.78 }

//   if (!modelResult) return { flag: false, label: null, confidence: 0 };

//   let pred = modelResult.prediction;
//   let conf = modelResult.confidence;

//   // numeric predictions (0/1)
//   if (typeof pred === "number") {
//     const flag = pred === 1;
//     return { flag, label: pred === 1 ? expectedLabelName : "benign", confidence: conf ?? (flag ? 1 : 0) };
//   }

//   // string predictions
//   if (typeof pred === "string") {
//     const labelLower = pred.toLowerCase();
//     // expectedLabelName could be 'SQLI' or 'XSS' etc.
//     const flag = labelLower.includes(expectedLabelName.toLowerCase());
//     // if no confidence provided, fallback to 0.5 for flagged
//     const confidence = conf == null ? (flag ? 0.6 : 0.0) : Number(conf);
//     return { flag, label: labelLower, confidence };
//   }

//   // any other shape: attempt to read confidence
//   const confidence = Number(conf) || 0;
//   const flag = confidence >= MODEL_CONF_THRESH;
//   return { flag, label: flag ? expectedLabelName : "benign", confidence };
// }

// // New analyze route
// app.post('/api/analyze', async (req, res) => {
//   const { userInput, page = 'login', field = 'username' } = req.body;
//   if (!userInput || typeof userInput !== 'string') {
//     return res.status(400).json({ error: 'userInput is required' });
//   }

//   // client IP + fingerprint
//   const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
//   const { fingerprint: fp, session, ip: fpIp, ua, al, path, method } = req.fingerprint || {};

//   // 1) Call AI models (your existing wrapper)
//   let aiPredictionResult = null;
//   try {
//     aiPredictionResult = await aiPrediction(userInput); // expected structure: { input, sql_model: {...}, xss_model: {...} }
//   } catch (e) {
//     console.error('AI call error:', e);
//     aiPredictionResult = null;
//   }

//   // Safe defaults if model unreachable
//   const sqlModelRaw = aiPredictionResult?.sql_model ?? null;
//   const xssModelRaw = aiPredictionResult?.xss_model ?? null;

//   const sqlInfo = interpretModelOutput(sqlModelRaw, 'SQL');
//   const xssInfo = interpretModelOutput(xssModelRaw, 'XSS');

//   // 2) Decide using model-first policy
//   let finalAttackType = null;
//   let finalSeverity = 0;
//   let matchedPattern = null;
//   let modelUsed = null; // keeps which model decided (sql/xss/both/none)

//   if (sqlInfo.flag && !xssInfo.flag) {
//     finalAttackType = 'SQL_INJECTION';
//     finalSeverity = 4;
//     modelUsed = 'sql_model';
//   } else if (xssInfo.flag && !sqlInfo.flag) {
//     finalAttackType = 'XSS_ATTACK';
//     finalSeverity = 3;
//     modelUsed = 'xss_model';
//   } else if (sqlInfo.flag && xssInfo.flag) {
//     // both flagged -> choose higher confidence or mark multi-vector
//     modelUsed = 'both_models';
//     if (sqlInfo.confidence > xssInfo.confidence + 0.05) {
//       finalAttackType = 'SQL_INJECTION';
//       finalSeverity = 4;
//     } else if (xssInfo.confidence > sqlInfo.confidence + 0.05) {
//       finalAttackType = 'XSS_ATTACK';
//       finalSeverity = 3;
//     } else {
//       finalAttackType = 'MULTI_VECTOR';
//       finalSeverity = Math.max(4, 3);
//     }
//   } else {
//     // neither model flagged -> fall back to heuristics
//     const heur = detectAttack(userInput); // returns { attackType, severity, matchedPattern }
//     finalAttackType = heur.attackType;
//     finalSeverity = heur.severity;
//     matchedPattern = heur.matchedPattern;
//     modelUsed = 'heuristic';
//   }

//   // 3) If model and heuristic disagree strongly, apply tie-break rules:
//   // Example: heuristic says sql but models say benign: if heuristic severity high but models high-conf benign (rare), you may prefer model.
//   // We'll apply this conservative rule:
//   if (modelUsed === 'heuristic') {
//     // check if heuristic says malicious but any model has high confidence benign? (optional)
//     // keep heuristic for now (preserve prior behaviour)
//   } else {
//     // attach matchedPattern = model signature if available
//     matchedPattern = matchedPattern || `${modelUsed}:${sqlInfo.label || xssInfo.label}`;
//   }

//   // 4) Generate deception response using your existing function
//   const deception = generateDeceptionResponse(finalAttackType, finalSeverity);

//   // 5) Log attack entry (same as yours) - include model outputs
//   const logEntry = await logAttack({
//     input: userInput,
//     attackType: finalAttackType,
//     ip: fpIp || ip,
//     page,
//     field,
//     deceptionUsed: deception.message,
//     severity: finalSeverity,
//     fingerprint: fp,
//     session,
//     ua_hash: ua ? hmacHash(ua) : null,
//     accept_language: al,
//     route: path,
//     method,
//     model_info: {
//       sql: { raw: sqlModelRaw, parsed: sqlInfo },
//       xss: { raw: xssModelRaw, parsed: xssInfo }
//     }
//   });

//   // 6) Save to MongoDB (same logic you had)
//   let dbEntry = null;
//   try {
//     if (finalAttackType !== 'NORMAL' && mongoose.connection.readyState === 1) {
//       // inside your analyze handler, after computing sqlInfo, xssInfo, finalAttackType, deception, etc.
//       const detectionType = (finalAttackType || 'normal').toLowerCase();
//       const payloadHash = hmacHash(JSON.stringify(req.body || req.query || req.url));
//       const sample_payload = userInput.length > 500
//         ? userInput.substring(0, 500) + "..."
//         : userInput;

//       dbEntry = await AttackAttempt.findOneAndUpdate(
//         {
//           fingerprint: fp,
//           attack_type: detectionType,
//           payload_hash: payloadHash
//         },

//         {
//           // -----------------------------
//           // CREATE ONLY ON FIRST MATCH
//           // -----------------------------
//           $setOnInsert: {
//             fingerprint: fp,
//             session,
//             ip: fpIp || ip,
//             ua_hash: hmacHash(ua || ''),
//             accept_language: al,
//             route: path,
//             method,
//             sample_payload,

//             model_info: {
//               sql: {
//                 flag: sqlInfo.flag,
//                 label: sqlInfo.label,
//                 confidence: sqlInfo.confidence
//               },
//               xss: {
//                 flag: xssInfo.flag,
//                 label: xssInfo.label,
//                 confidence: xssInfo.confidence
//               }
//             },

//             final_detection: {
//               attackType: finalAttackType,
//               severity: finalSeverity,
//               matchedPattern: matchedPattern,
//               reason: `modelUsed:${modelUsed}`
//             },

//             deception_strategy: {
//               message: deception.message,
//               delayApplied: finalSeverity >= 3
//             }
//           },

//           // -----------------------------
//           // ALWAYS UPDATE ON EVERY HIT
//           // -----------------------------
//           $inc: { count: 1 },

//           $set: {
//             last_seen: new Date(),

//             // ensure nested parents exist for safe update
//             'model_info': {},
//             'model_info.sql': {},
//             'model_info.xss': {},
//             'final_detection': {},
//             'deception_strategy': {},

//             // SQL model update
//             'model_info.sql.flag': sqlInfo.flag,
//             'model_info.sql.label': sqlInfo.label,
//             'model_info.sql.confidence': sqlInfo.confidence,

//             // XSS model update
//             'model_info.xss.flag': xssInfo.flag,
//             'model_info.xss.label': xssInfo.label,
//             'model_info.xss.confidence': xssInfo.confidence,

//             // final fused detection
//             'final_detection.attackType': finalAttackType,
//             'final_detection.severity': finalSeverity,
//             'final_detection.matchedPattern': matchedPattern,
//             'final_detection.reason': `modelUsed:${modelUsed}`,

//             // deception info
//             'deception_strategy.message': deception.message,
//             'deception_strategy.delayApplied': finalSeverity >= 3
//           }
//         },

//         { upsert: true, new: true }
//       );

//       console.log(" is it running db created one ", dbEntry)

//     }
//   } catch (dbError) {
//     console.error('DB save error:', dbError);
//   }

//   // 7) Broadcast to dashboards (include model info and dbEntry)
//   const [stats, hashChain] = await Promise.all([getStats(), getHashChain()]);
//   broadcastToDashboards({
//     type: 'new_attack',
//     log: logEntry,            // your existing full log object
//     stats,
//     hashChain,
//     dbEntry: dbEntry ? {
//       id: dbEntry._id,
//       count: dbEntry.count,
//       first_seen: dbEntry.first_seen,
//       last_seen: dbEntry.last_seen
//     } : null,
//     // ADDITIONAL PAYLOAD FOR THE DASHBOARD
//     model_info: {
//       sql: sqlInfo,   // {flag,label,confidence}
//       xss: xssInfo
//     },
//     final_detection: {
//       attackType: finalAttackType,
//       severity: finalSeverity,
//       matchedPattern
//     },
//     deception_strategy: {
//       message: deception.message,
//       delayApplied: finalSeverity >= 3
//     }
//   });

//   // 8) Tarpit / delay if severity high (same as before)
//   if (finalSeverity >= 3) {
//     await new Promise(resolve => setTimeout(resolve, 3000));
//   }

//   // 9) Respond to frontend (preserve original structure)
//   res.json({
//     message: deception.message
//   });
// });




app.post('/api/analyze', async (req, res) => {
  const { userInput, page = 'login', field = 'username' } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'userInput is required' });
  }

  // Get client IP
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  console.log(ip, "ip is here ");
  // Detect attack type
  // const aiPredictionResult = await aiPrediction(userInput);
  // console.log(aiPredictionResult, "aiPredictionResult");
  const attackResult = detectAttack(userInput);
  // console.log(attackResult, "attackResult");
  // Generate deception response
  const deception = generateDeceptionResponse(attackResult.attackType, attackResult.severity);

  // Get fingerprint data from middleware
  const { fingerprint: fp, session, ip: fpIp, ua, al, path, method } = req.fingerprint || {};

  // Log the attack to MongoDB (all attacks, including NORMAL)
  const logEntry = await logAttack({
    input: userInput,
    attackType: attackResult.attackType,
    ip: fpIp || ip,
    page: page,
    field: field,
    deceptionUsed: deception.message,
    severity: attackResult.severity,
    fingerprint: fp,
    session: session,
    ua_hash: ua ? hmacHash(ua) : null,
    accept_language: al,
    route: path,
    method: method
  });

  // Save to MongoDB if attack is suspicious (not NORMAL)
  let dbEntry = null;
  if (attackResult.attackType !== 'NORMAL' && mongoose.connection.readyState === 1) {
    try {
      // Verify AttackAttempt is a valid model
      if (!AttackAttempt || typeof AttackAttempt.findOneAndUpdate !== 'function') {
        throw new Error('AttackAttempt model is not properly initialized');
      }

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
  // Fetch latest stats and hash chain from MongoDB
  const [stats, hashChain] = await Promise.all([
    getStats(),
    getHashChain()
  ]);

  broadcastToDashboards({
    type: 'new_attack',
    log: logEntry,
    stats,
    hashChain,
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

// API endpoints for dashboard - fetch from MongoDB
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await getAttackLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/hash-chain', async (req, res) => {
  try {
    const hashChain = await getHashChain();
    res.json(hashChain);
  } catch (error) {
    console.error('Error fetching hash chain:', error);
    res.status(500).json({ error: 'Failed to fetch hash chain' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CHAMELEON Backend running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

