const express = require('express');
const router = express.Router();
const dashboardService = require('./dashboard.service');
const { requireAuth } = require('../../middleware/auth.middleware');

router.use(requireAuth);

// GET /api/dashboard/summary — everything in one response
router.get('/summary', async (req, res) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Individual widgets, in case the frontend wants to refresh one at a time
router.get('/active-contracts', async (req, res) => {
  try {
    res.json(await dashboardService.getActiveContracts());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/expiring-contracts', async (req, res) => {
  try {
    const withinDays = req.query.withinDays ? Number(req.query.withinDays) : 30;
    res.json(await dashboardService.getExpiringContracts(withinDays));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending-opinions', async (req, res) => {
  try {
    res.json(await dashboardService.getPendingLegalOpinions());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/court-cases', async (req, res) => {
  try {
    res.json(await dashboardService.getCourtCases());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/high-risk-litigation', async (req, res) => {
  try {
    res.json(await dashboardService.getHighRiskLitigation());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/compliance-score', async (req, res) => {
  try {
    res.json(await dashboardService.getComplianceScore());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/monthly-performance', async (req, res) => {
  try {
    res.json(await dashboardService.getMonthlyPerformance());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
