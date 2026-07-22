require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Legal Department API running on port ${PORT}`));
