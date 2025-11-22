const mongoose = require('mongoose');

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
});

// compound index example for fast grouping
AttackAttemptSchema.index({ fingerprint: 1, attack_type: 1 });

// Export model - check if model already exists to avoid overwriting
// This prevents "Cannot overwrite model" errors during hot reloading
let AttackAttempt;
try {
  // Try to get existing model first (for hot reloading)
  AttackAttempt = mongoose.model('AttackAttempt');
} catch (e) {
  // Model doesn't exist, create it
  AttackAttempt = mongoose.model('AttackAttempt', AttackAttemptSchema);
}

module.exports = AttackAttempt;
