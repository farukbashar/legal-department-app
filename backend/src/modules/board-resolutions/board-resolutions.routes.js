const express = require('express');
const router = express.Router();
const resolutionsService = require('./resolutions.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/board-resolutions?q=keyword&archived=false|true|all
router.get('/', async (req, res) => {
  try {
    const { q, archived } = req.query;
    const resolutions = await resolutionsService.listResolutions({ q, archived });
    res.json(resolutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/board-resolutions/:id
router.get('/:id', async (req, res) => {
  try {
    const r = await resolutionsService.getResolution(req.params.id);
    res.json(r);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/board-resolutions
router.post('/', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const r = await resolutionsService.createResolution(req.body, req.user.id);
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/board-resolutions/:id
router.put('/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const r = await resolutionsService.updateResolution(req.params.id, req.body, req.user.id);
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/board-resolutions/:id/archive
router.post('/:id/archive', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const r = await resolutionsService.archiveResolution(req.params.id, req.user.id);
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/board-resolutions/:id/unarchive
router.post('/:id/unarchive', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const r = await resolutionsService.unarchiveResolution(req.params.id, req.user.id);
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/board-resolutions/:id — permanent, admin-only
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await resolutionsService.deleteResolution(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Linked supporting documents ----------

// POST /api/board-resolutions/:id/documents  { fileName, fileUrl }
router.post('/:id/documents', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    const doc = await resolutionsService.linkDocument(req.params.id, req.body, req.user.id);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/board-resolutions/:id/documents
router.get('/:id/documents', async (req, res) => {
  try {
    const docs = await resolutionsService.listLinkedDocuments(req.params.id);
    res.json(docs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
