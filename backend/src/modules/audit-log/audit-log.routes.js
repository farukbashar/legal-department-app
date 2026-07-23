const express = require('express');
const router = express.Router();
const auditLogService = require('./audit-log.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

// Admin-only — this is an internal accountability tool, not for general staff.
router.use(requireAuth, requireRole('admin'));

// GET /api/audit-log?entityType=contract&limit=100
router.get('/', async (req, res) => {
  try {
    const { entityType, limit } = req.query;
    const entries = await auditLogService.listAuditLog({ entityType, limit });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
