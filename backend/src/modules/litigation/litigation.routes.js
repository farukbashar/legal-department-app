const express = require('express');
const router = express.Router();
const casesService = require('./cases.service');
const hearingsService = require('./hearings.service');
const counselService = require('./counsel.service');
const judgmentsService = require('./judgments.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/litigation/cases?status=open&court=Federal High Court
router.get('/cases', async (req, res) => {
  try {
    const { status, court } = req.query;
    const cases = await casesService.listCases({ status, court });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/litigation/cases/:id
router.get('/cases/:id', async (req, res) => {
  try {
    const c = await casesService.getCase(req.params.id);
    res.json(c);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/litigation/cases
router.post('/cases', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const c = await casesService.createCase(req.body, req.user.id);
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/litigation/cases/:id  (also used for status / financial exposure updates)
router.put('/cases/:id', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const c = await casesService.updateCase(req.params.id, req.body, req.user.id);
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/litigation/cases/:id
router.delete('/cases/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await casesService.deleteCase(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Hearing schedules ----------

// POST /api/litigation/cases/:id/hearings  { hearingDate, purpose }
router.post('/cases/:id/hearings', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const hearing = await hearingsService.scheduleHearing(req.params.id, req.body, req.user.id);
    res.status(201).json(hearing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/litigation/cases/:id/hearings
router.get('/cases/:id/hearings', async (req, res) => {
  try {
    const hearings = await hearingsService.listHearings(req.params.id);
    res.json(hearings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/litigation/hearings/:hearingId/outcome  { outcome }
router.put('/hearings/:hearingId/outcome', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const hearing = await hearingsService.recordOutcome(req.params.hearingId, req.body, req.user.id);
    res.json(hearing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Assigned counsel ----------

// POST /api/litigation/cases/:id/counsel  { name, firm, role, contactEmail }
router.post('/cases/:id/counsel', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const counsel = await counselService.assignCounsel(req.params.id, req.body, req.user.id);
    res.status(201).json(counsel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/litigation/cases/:id/counsel
router.get('/cases/:id/counsel', async (req, res) => {
  try {
    const counsel = await counselService.listCounsel(req.params.id);
    res.json(counsel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/litigation/counsel/:counselId
router.delete('/counsel/:counselId', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await counselService.removeCounsel(req.params.counselId, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Judgment tracking ----------

// POST /api/litigation/cases/:id/judgment  { outcome, amount, judgmentDate, notes }
router.post('/cases/:id/judgment', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const judgment = await judgmentsService.recordJudgment(req.params.id, req.body, req.user.id);
    res.status(201).json(judgment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/litigation/cases/:id/judgment
router.get('/cases/:id/judgment', async (req, res) => {
  try {
    const judgment = await judgmentsService.getJudgment(req.params.id);
    res.json(judgment);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /api/litigation/cases/:id/judgment
router.put('/cases/:id/judgment', requireRole('admin', 'head_of_legal', 'counsel'), async (req, res) => {
  try {
    const judgment = await judgmentsService.updateJudgment(req.params.id, req.body, req.user.id);
    res.json(judgment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
