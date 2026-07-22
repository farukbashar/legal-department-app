const express = require('express');
const router = express.Router();
const knowledgeService = require('./knowledge.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/knowledge-base?type=precedent&q=keyword
router.get('/', async (req, res) => {
  try {
    const { type, q } = req.query;
    const items = await knowledgeService.listItems({ type, q });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/knowledge-base/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await knowledgeService.getItem(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/knowledge-base  { type, title, content, fileUrl }
router.post('/', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const item = await knowledgeService.createItem(req.body, req.user.id);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/knowledge-base/:id
router.put('/:id', requireRole('admin', 'head_of_legal', 'legal_officer'), async (req, res) => {
  try {
    const item = await knowledgeService.updateItem(req.params.id, req.body, req.user.id);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/knowledge-base/:id
router.delete('/:id', requireRole('admin', 'head_of_legal'), async (req, res) => {
  try {
    await knowledgeService.deleteItem(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
