/**
 * Attack Log Manager with Blockchain-style Hash Chaining
 * Provides immutability through cryptographic hash chaining
 * Now uses MongoDB for persistent storage
 */

const crypto = require('crypto');
const mongoose = require('mongoose');
const { AttackLog } = require('./schema/attack');

/**
 * Calculate SHA256 hash
 */
function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Create hash chain entry
 */
function createHashChainEntry(logEntry, previousHash) {
  const entryData = JSON.stringify({
    timestamp: logEntry.timestamp,
    input: logEntry.input,
    attackType: logEntry.attackType,
    ip: logEntry.ip,
    previousHash: previousHash
  });

  const currentHash = calculateHash(entryData);
  
  return {
    hash: currentHash,
    timestamp: logEntry.timestamp,
    attackType: logEntry.attackType,
    input: logEntry.input.substring(0, 50) + (logEntry.input.length > 50 ? '...' : '')
  };
}

/**
 * Get the latest hash from database
 */
async function getLatestHash() {
  try {
    if (mongoose.connection.readyState !== 1) return null;
    const latest = await AttackLog.findOne().sort({ timestamp: -1 }).select('currentHash').lean();
    return latest?.currentHash || null;
  } catch (error) {
    console.error('Error getting latest hash:', error);
    return null;
  }
}

/**
 * Log an attack with hash chain linkage - saves to MongoDB
 */
async function logAttack(attackData) {
  const timestamp = new Date();
  
  // Get previous hash from database
  const previousHash = await getLatestHash();
  
  const logEntryData = {
    timestamp: timestamp,
    input: attackData.input,
    attackType: attackData.attackType,
    ip: attackData.ip,
    page: attackData.page || 'unknown',
    field: attackData.field || 'unknown',
    deceptionUsed: attackData.deceptionUsed,
    severity: attackData.severity || 0,
    previousHash: previousHash,
    fingerprint: attackData.fingerprint,
    session: attackData.session,
    ua_hash: attackData.ua_hash,
    accept_language: attackData.accept_language,
    route: attackData.route,
    method: attackData.method
  };

  // Create hash chain entry
  const chainEntry = createHashChainEntry(logEntryData, previousHash);
  logEntryData.currentHash = chainEntry.hash;

  // Save to MongoDB if connected
  let savedLog = null;
  if (mongoose.connection.readyState === 1) {
    try {
      savedLog = await AttackLog.create(logEntryData);
    } catch (error) {
      console.error('Error saving attack log to MongoDB:', error);
      // Continue with in-memory fallback
    }
  }

  // Return log entry (use saved DB entry if available, otherwise return the data)
  const logEntry = savedLog ? {
    id: savedLog._id.toString(),
    timestamp: savedLog.timestamp.toISOString(),
    input: savedLog.input,
    attackType: savedLog.attackType,
    ip: savedLog.ip,
    page: savedLog.page,
    field: savedLog.field,
    deceptionUsed: savedLog.deceptionUsed,
    severity: savedLog.severity,
    previousHash: savedLog.previousHash,
    currentHash: savedLog.currentHash
  } : {
    id: Date.now().toString(),
    timestamp: timestamp.toISOString(),
    ...logEntryData
  };

  return logEntry;
}

/**
 * Get all attack logs from MongoDB
 */
async function getAttackLogs(limit = 100) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return []; // Return empty if DB not connected
    }
    
    const logs = await AttackLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    // Transform to match expected format
    return logs.map(log => ({
      id: log._id.toString(),
      timestamp: log.timestamp.toISOString(),
      input: log.input,
      attackType: log.attackType,
      ip: log.ip,
      page: log.page,
      field: log.field,
      deceptionUsed: log.deceptionUsed,
      severity: log.severity,
      previousHash: log.previousHash,
      currentHash: log.currentHash
    }));
  } catch (error) {
    console.error('Error fetching attack logs from MongoDB:', error);
    return [];
  }
}

/**
 * Get attack statistics from MongoDB
 */
async function getStats() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        totalAttacks: 0,
        sqlInjection: 0,
        xssAttack: 0,
        commandInjection: 0,
        dirTraversal: 0,
        unknownSuspicious: 0,
        normal: 0,
        highRiskCount: 0,
        totalDelayTime: 0,
        avgDelayTime: 0,
        attacksByPage: {},
        attacksByHour: {}
      };
    }

    // Get total count
    const totalAttacks = await AttackLog.countDocuments();

    // Get counts by attack type
    const [sqlInjection, xssAttack, commandInjection, dirTraversal, unknownSuspicious, normal] = await Promise.all([
      AttackLog.countDocuments({ attackType: 'SQL_INJECTION' }),
      AttackLog.countDocuments({ attackType: 'XSS_ATTACK' }),
      AttackLog.countDocuments({ attackType: 'COMMAND_INJECTION' }),
      AttackLog.countDocuments({ attackType: 'DIR_TRAVERSAL' }),
      AttackLog.countDocuments({ attackType: 'UNKNOWN_SUSPICIOUS' }),
      AttackLog.countDocuments({ attackType: 'NORMAL' })
    ]);

    // Get high-risk attacks (severity >= 3)
    const highRiskLogs = await AttackLog.find({ severity: { $gte: 3 } }).select('severity').lean();
    const highRiskCount = highRiskLogs.length;
    const totalDelayTime = highRiskCount * 3; // 3 seconds per high-risk attack
    const avgDelayTime = highRiskCount > 0 ? (totalDelayTime / highRiskCount).toFixed(2) : 0;

    // Get attacks by page
    const pageAggregation = await AttackLog.aggregate([
      { $group: { _id: '$page', count: { $sum: 1 } } }
    ]);
    const attacksByPage = {};
    pageAggregation.forEach(item => {
      attacksByPage[item._id || 'unknown'] = item.count;
    });

    // Get attacks by hour
    const hourAggregation = await AttackLog.aggregate([
      { $project: { hour: { $hour: '$timestamp' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } }
    ]);
    const attacksByHour = {};
    hourAggregation.forEach(item => {
      attacksByHour[item._id] = item.count;
    });

    return {
      totalAttacks,
      sqlInjection,
      xssAttack,
      commandInjection,
      dirTraversal,
      unknownSuspicious,
      normal,
      highRiskCount,
      totalDelayTime,
      avgDelayTime,
      attacksByPage,
      attacksByHour
    };
  } catch (error) {
    console.error('Error fetching stats from MongoDB:', error);
    return {
      totalAttacks: 0,
      sqlInjection: 0,
      xssAttack: 0,
      commandInjection: 0,
      dirTraversal: 0,
      unknownSuspicious: 0,
      normal: 0,
      highRiskCount: 0,
      totalDelayTime: 0,
      avgDelayTime: 0,
      attacksByPage: {},
      attacksByHour: {}
    };
  }
}

/**
 * Get hash chain information from MongoDB
 */
async function getHashChain() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return {
        genesisHash: null,
        latestHash: null,
        chainLength: 0,
        recentEntries: []
      };
    }

    // Get first entry (genesis)
    const genesis = await AttackLog.findOne().sort({ timestamp: 1 }).select('currentHash').lean();
    const genesisHash = genesis?.currentHash || null;

    // Get latest entry
    const latest = await AttackLog.findOne().sort({ timestamp: -1 }).select('currentHash').lean();
    const latestHash = latest?.currentHash || null;

    // Get total count
    const chainLength = await AttackLog.countDocuments();

    // Get recent 5 entries
    const recentLogs = await AttackLog.find()
      .sort({ timestamp: -1 })
      .limit(5)
      .select('timestamp attackType input currentHash')
      .lean();

    const recentEntries = recentLogs.map(log => ({
      hash: log.currentHash,
      timestamp: log.timestamp.toISOString(),
      attackType: log.attackType,
      input: log.input.length > 50 ? log.input.substring(0, 50) + '...' : log.input
    })).reverse(); // Most recent first

    return {
      genesisHash,
      latestHash,
      chainLength,
      recentEntries
    };
  } catch (error) {
    console.error('Error fetching hash chain from MongoDB:', error);
    return {
      genesisHash: null,
      latestHash: null,
      chainLength: 0,
      recentEntries: []
    };
  }
}

/**
 * Get log entry by ID from MongoDB
 */
async function getLogById(id) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return null;
    }

    const log = await AttackLog.findById(id).lean();
    if (!log) return null;

    return {
      id: log._id.toString(),
      timestamp: log.timestamp.toISOString(),
      input: log.input,
      attackType: log.attackType,
      ip: log.ip,
      page: log.page,
      field: log.field,
      deceptionUsed: log.deceptionUsed,
      severity: log.severity,
      previousHash: log.previousHash,
      currentHash: log.currentHash
    };
  } catch (error) {
    console.error('Error fetching log by ID from MongoDB:', error);
    return null;
  }
}

/**
 * Verify hash chain integrity from MongoDB
 */
async function verifyHashChain() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return { valid: false, message: 'Database not connected' };
    }

    const logs = await AttackLog.find().sort({ timestamp: 1 }).lean();
    
    if (logs.length === 0) {
      return { valid: true, message: 'Chain is empty' };
    }

    for (let i = 1; i < logs.length; i++) {
      const current = logs[i];
      const previous = logs[i - 1];
      
      // Recalculate hash
      const entryData = JSON.stringify({
        timestamp: current.timestamp,
        input: current.input,
        attackType: current.attackType,
        ip: current.ip,
        previousHash: previous.currentHash
      });
      
      const calculatedHash = calculateHash(entryData);
      
      if (calculatedHash !== current.currentHash) {
        return {
          valid: false,
          message: `Chain broken at entry ${i}`,
          entryIndex: i,
          entryId: current._id.toString()
        };
      }
    }

    return { valid: true, message: 'Chain integrity verified' };
  } catch (error) {
    console.error('Error verifying hash chain:', error);
    return { valid: false, message: 'Error verifying chain', error: error.message };
  }
}

module.exports = {
  logAttack,
  getAttackLogs,
  getStats,
  getHashChain,
  getLogById,
  verifyHashChain
};

