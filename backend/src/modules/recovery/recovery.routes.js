const express = require('express');
const router = express.Router();
const debtCasesService = require('./debt-cases.service');
const paymentsService = require('./payments.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/recovery/cases?status=outstanding&archived=false|true|all
router.get('/cases', async (req, res) => {
  try {
    const { status, archived } = req.query;
    const cases = await debtCasesService.listDebtCases({ status, archived });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recovery/cases/:id
router.get('/cases/:id', async (req, res) => {
  try {
    const c = await debtCasesService.getDebtCase(req.params.id);
    res.json(c);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/recovery/cases
router.post('/cases', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const c = await debtCasesService.createDebtCase(req.body, req.user.id);
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/recovery/cases/:id  (also used for recovery-progress/status updates)
router.put('/cases/:id', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const c = await debtCasesService.updateDebtCase(req.params.id, req.body, req.user.id);
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recovery/cases/:id/archive
router.post('/cases/:id/archive', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const c = await debtCasesService.archiveDebtCase(req.params.id, req.user.id);
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/recovery/cases/:id/unarchive
router.post('/cases/:id/unarchive', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const c = await debtCasesService.unarchiveDebtCase(req.params.id, req.user.id);
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/recovery/cases/:id — permanent, admin-only
router.delete('/cases/:id', requireRole('admin'), async (req, res) => {
  try {
    await debtCasesService.deleteDebtCase(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Payment history ----------

// POST /api/recovery/cases/:id/payments  { amount, paymentDate, method, notes }
router.post('/cases/:id/payments', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const payment = await paymentsService.recordPayment(req.params.id, req.body, req.user.id);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/recovery/cases/:id/payments
router.get('/cases/:id/payments', async (req, res) => {
  try {
    const payments = await paymentsService.listPayments(req.params.id);
    res.json(payments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
