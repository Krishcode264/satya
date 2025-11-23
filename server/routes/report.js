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

    // Fetch grouped attack attempts for this FP
    const attempts = await AttackAttempt.find({ fingerprint }).lean();

    if (!attempts.length) {
      return res.json({
        fingerprint,
        summary: {
          fingerprint,
          totalAttacks: 0,
          sqlInjection: 0,
          xssAttack: 0,
          commandInjection: 0,
          dirTraversal: 0,
          unknownSuspicious: 0,
          highRiskCount: 0,
          attacksByPage: {},
          attacksByHour: {}
        },
        attempts
      });
    }

    // Compute total attacks (sum of counts)
    const totalAttacks = attempts.reduce((sum, a) => sum + (a.count || 1), 0);

    // Count attack types
    const sqlInjection = attempts
      .filter(a => a.attack_type === 'sql_injection')
      .reduce((acc, a) => acc + a.count, 0);

    const xssAttack = attempts
      .filter(a => a.attack_type === 'xss_attack')
      .reduce((acc, a) => acc + a.count, 0);

    const commandInjection = attempts
      .filter(a => a.attack_type === 'command_injection')
      .reduce((acc, a) => acc + a.count, 0);

    const dirTraversal = attempts
      .filter(a => a.attack_type === 'directory_traversal')
      .reduce((acc, a) => acc + a.count, 0);

    const unknownSuspicious = attempts
      .filter(a => a.attack_type === 'unknown_suspicious')
      .reduce((acc, a) => acc + a.count, 0);

    const highRiskCount = attempts
      .filter(a => a.severity >= 4)
      .reduce((acc, a) => acc + a.count, 0);

    // Page stats
    const attacksByPage = {};
    attempts.forEach(a => {
      const page = a.route || "unknown";
      attacksByPage[page] = (attacksByPage[page] || 0) + a.count;
    });

    // Hour stats (based on last_seen timestamp)
    const attacksByHour = {};
    attempts.forEach(a => {
      const hour = new Date(a.last_seen).getHours();
      attacksByHour[hour] = (attacksByHour[hour] || 0) + a.count;
    });

    const summary = {
      fingerprint,
      totalAttacks,
      sqlInjection,
      xssAttack,
      commandInjection,
      dirTraversal,
      unknownSuspicious,
      highRiskCount,
      attacksByPage,
      attacksByHour
    };

    res.json({
      fingerprint,
      summary,
      attempts
    });

  } catch (err) {
    console.error("Error loading attacker detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// router.get('/attacker/:fingerprint', async (req, res) => {
//     try {
//       const { fingerprint } = req.params;
  
//       // All raw attack logs (timeline)
//       const logs = await AttackLog.find({ fingerprint })
//         .sort({ timestamp: 1 })
//         .lean();
  
//       // Summary information
//       const summary = {
//         fingerprint,
//         totalAttacks: logs.length,
  
//         sqlInjection: logs.filter(l => l.attackType === 'sql_injection').length,
//         xssAttack: logs.filter(l => l.attackType === 'xss_attack').length,
//         commandInjection: logs.filter(l => l.attackType === 'command_injection').length,
//         dirTraversal: logs.filter(l => l.attackType === 'directory_traversal').length,
//         unknownSuspicious: logs.filter(l => l.attackType === 'unknown_suspicious').length,
//         normal: logs.filter(l => l.attackType === 'normal').length,
  
//         highRiskCount: logs.filter(l => l.severity >= 4).length,
  
//         attacksByPage: {},
//         attacksByHour: {}
//       };
  
//       // Build page stats
//       logs.forEach(log => {
//         const page = log.route || log.page || "unknown";
//         if (!summary.attacksByPage[page]) summary.attacksByPage[page] = 0;
//         summary.attacksByPage[page]++;
//       });
  
//       // Build hour stats
//       logs.forEach(log => {
//         const h = new Date(log.timestamp).getHours();
//         summary.attacksByHour[h] = (summary.attacksByHour[h] || 0) + 1;
//       });
  
//       // Extra attacker info from AttackAttempt
//       const attempts = await AttackAttempt.find({ fingerprint }).lean();
  
//       res.json({
//         fingerprint,
//         summary,
//         attempts,
//         logs
//       });
  
//     } catch (err) {
//       console.error("Error loading attacker detail:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });
module.exports = {router};
