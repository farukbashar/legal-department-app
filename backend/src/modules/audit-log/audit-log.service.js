const prisma = require('../../db/prisma');

async function listAuditLog({ entityType, limit = 100 } = {}) {
  return prisma.auditLog.findMany({
    where: { ...(entityType ? { entityType } : {}) },
    include: { performer: true },
    orderBy: { performedAt: 'desc' },
    take: Number(limit),
  });
}

module.exports = { listAuditLog };
