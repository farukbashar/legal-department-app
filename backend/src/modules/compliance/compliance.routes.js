const express = require('express');
const router = express.Router();
const complianceService = require('./compliance.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/compliance?status=overdue&responsibleOfficerId=3
router.get('/', async (req, res) => {
  try {
    const { status, responsibleOfficerId } = req.query;
    const obligations = await complianceService.listObligations({ status, responsibleOfficerId });
    res.json(obligations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/compliance/:id
router.get('/:id', async (req, res) => {
  try {
    const o = await complianceService.getObligation(req.params.id);
    res.json(o);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/compliance
router.post('/', requireRole('admin', 'head_of_legal', 'compliance_officer'), async (req, res) => {
  try {
    const o = await complianceService.createObligation(req.body, req.user.id);
    res.status(201).json(o);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/compliance/:id  (also used for due date / officer / status updates)
router.put('/:id', requireRole('admin', 'head_of_legal', 'compliance_officer'), async (req, res) => {
  try {
    const o = await complianceService.updateObligation(req.params.id, req.body, req.user.id);
    res.json(o);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/compliance/:id
router.delete('/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await complianceService.deleteObligation(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
