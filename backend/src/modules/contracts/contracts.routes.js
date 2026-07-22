const express = require('express');
const router = express.Router();
const contractsService = require('./contracts.service');
const approvalService = require('./contracts.approval.service');
const signatureService = require('./contracts.signature.service');
const versionsService = require('./contracts.versions.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

// All contract routes require a logged-in user
router.use(requireAuth);

// GET /api/contracts?status=active&department=Finance
router.get('/', async (req, res) => {
  try {
    const { status, department } = req.query;
    const contracts = await contractsService.listContracts({ status, department });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contracts/:id
router.get('/:id', async (req, res) => {
  try {
    const contract = await contractsService.getContract(req.params.id);
    res.json(contract);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/contracts  (legal officers and above)
router.post('/', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const contract = await contractsService.createContract(req.body, req.user.id);
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/contracts/:id
router.put('/:id', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const contract = await contractsService.updateContract(req.params.id, req.body, req.user.id);
    res.json(contract);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/contracts/:id  (admin / head of legal only)
router.delete('/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await contractsService.deleteContract(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Approval workflow ----------

// POST /api/contracts/:id/approvals/start
router.post('/:id/approvals/start', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const steps = await approvalService.startApprovalWorkflow(req.params.id, req.user.id);
    res.status(201).json(steps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/contracts/:id/approvals
router.get('/:id/approvals', async (req, res) => {
  try {
    const approvals = await approvalService.listApprovals(req.params.id);
    res.json(approvals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/contracts/approvals/:approvalId/decide  { decision: 'approved'|'rejected', comments }
router.post('/approvals/:approvalId/decide', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const result = await approvalService.decideApproval(req.params.approvalId, req.body, req.user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Digital signatures ----------

// POST /api/contracts/:id/signatures  { signerName, signerEmail, method }
router.post('/:id/signatures', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const signature = await signatureService.requestSignature(req.params.id, req.body, req.user.id);
    res.status(201).json(signature);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/contracts/:id/signatures
router.get('/:id/signatures', async (req, res) => {
  try {
    const signatures = await signatureService.listSignatures(req.params.id);
    res.json(signatures);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/contracts/signatures/:signatureId/record  { status: 'signed'|'declined' }
router.post('/signatures/:signatureId/record', async (req, res) => {
  try {
    const result = await signatureService.recordSignature(req.params.signatureId, req.body, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Version history ----------

// POST /api/contracts/:id/versions  { fileName, fileUrl }
router.post('/:id/versions', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const doc = await versionsService.uploadVersion(req.params.id, req.body, req.user.id);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/contracts/:id/versions
router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await versionsService.listVersions(req.params.id);
    res.json(versions);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
