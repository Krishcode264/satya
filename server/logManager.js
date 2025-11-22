/**
 * Attack Log Manager with Blockchain-style Hash Chaining
 * Provides immutability through cryptographic hash chaining
 */

const crypto = require('crypto');

// In-memory storage (in production, use a database)
let attackLogs = [];
let hashChain = {
  genesisHash: null,
  latestHash: null,
  entries: []
};

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
 * Log an attack with hash chain linkage
 */
function logAttack(attackData) {
  const timestamp = new Date().toISOString();
  
  const logEntry = {
    id: attackLogs.length + 1,
    timestamp: timestamp,
    input: attackData.input,
    attackType: attackData.attackType,
    ip: attackData.ip,
    page: attackData.page || 'unknown',
    field: attackData.field || 'unknown',
    deceptionUsed: attackData.deceptionUsed,
    severity: attackData.severity || 0,
    previousHash: hashChain.latestHash,
    currentHash: null
  };

  // Create hash chain entry
  const chainEntry = createHashChainEntry(logEntry, hashChain.latestHash);
  logEntry.currentHash = chainEntry.hash;

  // Initialize genesis hash if this is the first entry
  if (hashChain.genesisHash === null) {
    hashChain.genesisHash = chainEntry.hash;
  }

  // Update hash chain
  hashChain.latestHash = chainEntry.hash;
  hashChain.entries.push(chainEntry);

  // Keep only last 100 chain entries in memory (for demo)
  if (hashChain.entries.length > 100) {
    hashChain.entries.shift();
  }

  // Store log entry
  attackLogs.push(logEntry);

  // Keep only last 1000 logs in memory (for demo)
  if (attackLogs.length > 1000) {
    attackLogs.shift();
  }

  return logEntry;
}

/**
 * Get all attack logs
 */
function getAttackLogs(limit = 100) {
  return attackLogs.slice(-limit).reverse(); // Most recent first
}

/**
 * Get attack statistics
 */
function getStats() {
  const stats = {
    totalAttacks: attackLogs.length,
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

  attackLogs.forEach(log => {
    // Count by attack type
    switch (log.attackType) {
      case 'SQL_INJECTION':
        stats.sqlInjection++;
        break;
      case 'XSS_ATTACK':
        stats.xssAttack++;
        break;
      case 'COMMAND_INJECTION':
        stats.commandInjection++;
        break;
      case 'DIR_TRAVERSAL':
        stats.dirTraversal++;
        break;
      case 'UNKNOWN_SUSPICIOUS':
        stats.unknownSuspicious++;
        break;
      case 'NORMAL':
        stats.normal++;
        break;
    }

    // Count high-risk attacks (severity >= 3)
    if (log.severity >= 3) {
      stats.highRiskCount++;
      stats.totalDelayTime += 3; // 3 seconds per high-risk attack
    }

    // Count by page
    stats.attacksByPage[log.page] = (stats.attacksByPage[log.page] || 0) + 1;

    // Count by hour
    const hour = new Date(log.timestamp).getHours();
    stats.attacksByHour[hour] = (stats.attacksByHour[hour] || 0) + 1;
  });

  // Calculate average delay
  if (stats.highRiskCount > 0) {
    stats.avgDelayTime = (stats.totalDelayTime / stats.highRiskCount).toFixed(2);
  }

  return stats;
}

/**
 * Get hash chain information
 */
function getHashChain() {
  return {
    genesisHash: hashChain.genesisHash,
    latestHash: hashChain.latestHash,
    chainLength: hashChain.entries.length,
    recentEntries: hashChain.entries.slice(-5).reverse() // Last 5 entries, most recent first
  };
}

/**
 * Get log entry by ID
 */
function getLogById(id) {
  return attackLogs.find(log => log.id === id);
}

/**
 * Verify hash chain integrity
 */
function verifyHashChain() {
  if (hashChain.entries.length === 0) {
    return { valid: true, message: 'Chain is empty' };
  }

  for (let i = 1; i < hashChain.entries.length; i++) {
    const current = hashChain.entries[i];
    const previous = hashChain.entries[i - 1];
    
    // Recalculate hash
    const entryData = JSON.stringify({
      timestamp: current.timestamp,
      input: current.input,
      attackType: current.attackType,
      ip: 'verification',
      previousHash: previous.hash
    });
    
    const calculatedHash = calculateHash(entryData);
    
    if (calculatedHash !== current.hash) {
      return {
        valid: false,
        message: `Chain broken at entry ${i}`,
        entryIndex: i
      };
    }
  }

  return { valid: true, message: 'Chain integrity verified' };
}

module.exports = {
  logAttack,
  getAttackLogs,
  getStats,
  getHashChain,
  getLogById,
  verifyHashChain
};

