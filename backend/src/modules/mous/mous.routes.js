const express = require('express');
const router = express.Router();
const draftingService = require('./mou-drafting.service');
const reviewService = require('./mou-review.service');
const approvalService = require('./mou-approval.service');
const renewalService = require('./mou-renewal.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/mous?status=draft
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const mous = await draftingService.listMous({ status });
    res.json(mous);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mous/:id
router.get('/:id', async (req, res) => {
  try {
    const mou = await draftingService.getMou(req.params.id);
    res.json(mou);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/mous
router.post('/', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const mou = await draftingService.draftMou(req.body, req.user.id);
    res.status(201).json(mou);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/mous/:id  (only while in draft — enforced by workflow step, not here)
router.put('/:id', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const mou = await draftingService.updateDraft(req.params.id, req.body, req.user.id);
    res.json(mou);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/mous/:id
router.delete('/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await draftingService.deleteMou(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Review ----------

// POST /api/mous/:id/submit-for-review
router.post('/:id/submit-for-review', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const mou = await reviewService.submitForReview(req.params.id, req.user.id);
    res.json(mou);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Approval ----------

// POST /api/mous/:id/approvals/start
router.post('/:id/approvals/start', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const steps = await approvalService.startApprovalWorkflow(req.params.id, req.user.id);
    res.status(201).json(steps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/mous/:id/approvals
router.get('/:id/approvals', async (req, res) => {
  try {
    const approvals = await approvalService.listApprovals(req.params.id);
    res.json(approvals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/mous/approvals/:approvalId/decide  { decision: 'approved'|'rejected', comments }
router.post('/approvals/:approvalId/decide', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const result = await approvalService.decideApproval(req.params.approvalId, req.body, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Renewal reminders ----------

// POST /api/mous/:id/renew  { newRenewalDate }
router.post('/:id/renew', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const mou = await renewalService.renewMou(req.params.id, req.body, req.user.id);
    res.json(mou);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/mous/:id/reminders
router.get('/:id/reminders', async (req, res) => {
  try {
    const reminders = await renewalService.listReminders(req.params.id);
    res.json(reminders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
