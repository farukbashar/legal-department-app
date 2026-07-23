const express = require('express');
const router = express.Router();
const remindersService = require('./reminders.service');
const { requireAuth } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/reminders?scope=due|upcoming|all&withinDays=30
router.get('/', async (req, res) => {
  try {
    const { scope, withinDays } = req.query;
    const reminders = await remindersService.listReminders({ scope, withinDays });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reminders/:id/mark-sent
router.put('/:id/mark-sent', async (req, res) => {
  try {
    const reminder = await remindersService.markSent(req.params.id);
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
