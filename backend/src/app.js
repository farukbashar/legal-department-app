require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const contractRoutes = require('./modules/contracts/contracts.routes');
const legalOpinionRoutes = require('./modules/legal-opinions/opinions.routes');
const litigationRoutes = require('./modules/litigation/litigation.routes');
const mouRoutes = require('./modules/mous/mous.routes');
const boardResolutionRoutes = require('./modules/board-resolutions/board-resolutions.routes');
const complianceRoutes = require('./modules/compliance/compliance.routes');
const recoveryRoutes = require('./modules/recovery/recovery.routes');
const knowledgeBaseRoutes = require('./modules/knowledge-base/knowledge-base.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const remindersRoutes = require('./modules/reminders/reminders.routes');
const uploadsRoutes = require('./modules/uploads/uploads.routes');
const searchRoutes = require('./modules/search/search.routes');
const auditLogRoutes = require('./modules/audit-log/audit-log.routes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Serve uploaded files. NOTE: on Render's free tier this disk is ephemeral —
// files are lost on redeploy/restart. Fine for now; swap for S3-backed
// storage before this holds anything that actually matters long-term.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/legal-opinions', legalOpinionRoutes);
app.use('/api/litigation', litigationRoutes);
app.use('/api/mous', mouRoutes);
app.use('/api/board-resolutions', boardResolutionRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audit-log', auditLogRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Legal Department API running on port ${PORT}`));
