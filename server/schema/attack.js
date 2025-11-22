const mongoose = require('mongoose');

// Schema for tracking attack attempts (aggregated counts)
const AttackAttemptSchema = new mongoose.Schema({
  fingerprint: { type: String, index: true },      // HMAC hash
  session: String,                                 // cookie id (optional)
  ip: String,                                      // raw IP maybe store truncated / last octet removed if privacy required
  ua_hash: String,
  accept_language: String,
  route: String,
  method: String,
  payload_hash: String,                            // hash of attack payload
  attack_type: String,                             // e.g., sql_injection, xss (your detection)
  sample_payload: String,                          // optional: store redacted payload or none
  count: { type: Number, default: 1 },
  first_seen: { type: Date, default: Date.now },
  last_seen: { type: Date, default: Date.now }
}, {
  timestamps: false // We use first_seen and last_seen instead
});

// compound index example for fast grouping
AttackAttemptSchema.index({ fingerprint: 1, attack_type: 1 });

// Schema for individual attack logs (with hash chain)
const AttackLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  input: { type: String, required: true },           // Full attack payload
  attackType: { type: String, required: true, index: true }, // SQL_INJECTION, XSS_ATTACK, etc.
  ip: { type: String, index: true },
  page: String,                                     // login, search, etc.
  field: String,                                    // username, password, query, etc.
  deceptionUsed: String,                             // The fake error message shown
  severity: { type: Number, default: 0 },           // 0-5 severity level
  previousHash: String,                             // Previous hash in chain
  currentHash: String,                               // Current hash in chain (indexed below)
  fingerprint: String,                               // Fingerprint from middleware
  session: String,                                   // Session ID
  ua_hash: String,                                  // User agent hash
  accept_language: String,                           // Accept language
  route: String,                                     // Request route
  method: String                                    // HTTP method
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for fast queries (avoid duplicates)
AttackLogSchema.index({ timestamp: -1 }); // Most recent first
AttackLogSchema.index({ attackType: 1, timestamp: -1 });
AttackLogSchema.index({ currentHash: 1 }); // Hash chain lookup

// Export models - check if model already exists to avoid overwriting
let AttackAttempt;
let AttackLog;

try {
  AttackAttempt = mongoose.model('AttackAttempt');
} catch (e) {
  AttackAttempt = mongoose.model('AttackAttempt', AttackAttemptSchema);
}

try {
  AttackLog = mongoose.model('AttackLog');
} catch (e) {
  AttackLog = mongoose.model('AttackLog', AttackLogSchema);
}

module.exports = { AttackAttempt, AttackLog };
