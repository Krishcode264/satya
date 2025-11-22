const express = require('express');
const router = express.Router();
const { AttackAttempt, AttackLog } = require('../schema/attack');


// ------------------------
// API #1 — List all unique attackers
// ------------------------
router.get('/attackers', async (req, res) => {
  try {
    // Group by fingerprint
    const attackers = await AttackAttempt.aggregate([
      {
        $group: {
          _id: "$fingerprint",
          ip: { $first: "$ip" },
          totalAttacks: { $sum: "$count" },
          lastSeen: { $max: "$last_seen" },
          uniqueAttackTypes: { $addToSet: "$attack_type" },
          routes: { $addToSet: "$route" }
        }
      },
      { $sort: { lastSeen: -1 } }
    ]);

    // Format response
    const formatted = attackers.map(a => ({
      fingerprint: a._id,
      ip: a.ip,
      totalAttacks: a.totalAttacks,
      lastSeen: a.lastSeen,
      uniqueAttackTypes: a.uniqueAttackTypes,
      uniquePages: a.routes
    }));

    res.json({ attackers: formatted });

  } catch (err) {
    console.error("Error fetching attackers list:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/attacker/:fingerprint', async (req, res) => {
    try {
      const { fingerprint } = req.params;
  
      // All raw attack logs (timeline)
      const logs = await AttackLog.find({ fingerprint })
        .sort({ timestamp: 1 })
        .lean();
  
      // Summary information
      const summary = {
        fingerprint,
        totalAttacks: logs.length,
  
        sqlInjection: logs.filter(l => l.attackType === 'sql_injection').length,
        xssAttack: logs.filter(l => l.attackType === 'xss_attack').length,
        commandInjection: logs.filter(l => l.attackType === 'command_injection').length,
        dirTraversal: logs.filter(l => l.attackType === 'directory_traversal').length,
        unknownSuspicious: logs.filter(l => l.attackType === 'unknown_suspicious').length,
        normal: logs.filter(l => l.attackType === 'normal').length,
  
        highRiskCount: logs.filter(l => l.severity >= 4).length,
  
        attacksByPage: {},
        attacksByHour: {}
      };
  
      // Build page stats
      logs.forEach(log => {
        const page = log.route || log.page || "unknown";
        if (!summary.attacksByPage[page]) summary.attacksByPage[page] = 0;
        summary.attacksByPage[page]++;
      });
  
      // Build hour stats
      logs.forEach(log => {
        const h = new Date(log.timestamp).getHours();
        summary.attacksByHour[h] = (summary.attacksByHour[h] || 0) + 1;
      });
  
      // Extra attacker info from AttackAttempt
      const attempts = await AttackAttempt.find({ fingerprint }).lean();
  
      res.json({
        fingerprint,
        summary,
        attempts,
        logs
      });
  
    } catch (err) {
      console.error("Error loading attacker detail:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
module.exports = {router};
