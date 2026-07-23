const express = require('express');
const router = express.Router();
const requestsService = require('./opinion-requests.service');
const draftingService = require('./opinion-drafting.service');
const reviewService = require('./opinion-review.service');
const searchService = require('./opinion-search.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// POST /api/legal-opinions/requests  { subject, description, priority }
// Any authenticated staff member can submit a request
router.post('/requests', async (req, res) => {
  try {
    const request = await requestsService.createRequest(req.body, req.user.id);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/legal-opinions/requests?status=submitted&priority=high&archived=false|true|all
router.get('/requests', async (req, res) => {
  try {
    const { status, priority, archived } = req.query;
    const requests = await requestsService.listRequests({ status, priority, archived });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legal-opinions/requests/:id
router.get('/requests/:id', async (req, res) => {
  try {
    const request = await requestsService.getRequest(req.params.id);
    res.json(request);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/legal-opinions/requests/:id/assign  { officerId }
router.post('/requests/:id/assign', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const request = await requestsService.assignOfficer(req.params.id, req.body, req.user.id);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/legal-opinions/requests/:id/archive
router.post('/requests/:id/archive', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const request = await requestsService.archiveRequest(req.params.id, req.user.id);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/legal-opinions/requests/:id/unarchive
router.post('/requests/:id/unarchive', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const request = await requestsService.unarchiveRequest(req.params.id, req.user.id);
    res.json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/legal-opinions/requests/:id — permanent, admin-only
router.delete('/requests/:id', requireRole('admin'), async (req, res) => {
  try {
    await requestsService.deleteRequest(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Draft opinions ----------

// POST /api/legal-opinions/requests/:id/draft/start
router.post('/requests/:id/draft/start', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const opinion = await draftingService.startDraft(req.params.id, req.user.id);
    res.status(201).json(opinion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Search previous opinions ----------

// GET /api/legal-opinions/opinions/search?q=keyword&status=approved
// Must be registered before /opinions/:id so "search" isn't parsed as an id.
router.get('/opinions/search', async (req, res) => {
  try {
    const { q, status } = req.query;
    const opinions = await searchService.searchOpinions({ q, status });
    res.json(opinions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/legal-opinions/opinions/:id
router.get('/opinions/:id', async (req, res) => {
  try {
    const opinion = await draftingService.getOpinion(req.params.id);
    res.json(opinion);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /api/legal-opinions/opinions/:id/draft  { content }
router.put('/opinions/:id/draft', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const opinion = await draftingService.updateDraft(req.params.id, req.body, req.user.id);
    res.json(opinion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Review and approval ----------

// POST /api/legal-opinions/opinions/:id/submit-for-review
router.post('/opinions/:id/submit-for-review', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const opinion = await reviewService.submitForReview(req.params.id, req.user.id);
    res.json(opinion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/legal-opinions/opinions/:id/review  { decision: 'approved'|'rejected', comments }
router.post('/opinions/:id/review', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const opinion = await reviewService.decideReview(req.params.id, req.body, req.user);
    res.json(opinion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
