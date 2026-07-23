const express = require('express');
const router = express.Router();
const searchService = require('./search.service');
const { requireAuth } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/search?q=keyword
router.get('/', async (req, res) => {
  try {
    const results = await searchService.globalSearch(req.query.q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
