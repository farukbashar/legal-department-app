const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { requireAuth, requireRole } = require('../../middleware/auth.middleware');

// Registration is admin-only — this is an internal tool, not public signup.
router.post('/register', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// GET /api/auth/users — admin-only user list, for the Users management screen
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id — admin-only, for deactivating/reactivating or changing role
router.put('/users/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/change-password — self-service, requires the current password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/users/:id/reset-password — admin-only, no old password needed
router.post('/users/:id/reset-password', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await authService.adminResetPassword(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
