const prisma = require('../../db/prisma');

async function assignCounsel(caseId, { name, firm, role, contactEmail }, userId) {
  const c = await prisma.litigationCase.findUnique({ where: { id: Number(caseId) } });
  if (!c) throw new Error('Case not found');

  const counsel = await prisma.caseCounsel.create({
    data: {
      caseId: Number(caseId),
      name,
      firm,
      role: role || 'lead',
      contactEmail,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: Number(caseId),
      action: 'counsel_assigned',
      performedBy: userId,
      notes: `${name}${firm ? ` (${firm})` : ''} — ${role || 'lead'}`,
    },
  });

  return counsel;
}

async function listCounsel(caseId) {
  return prisma.caseCounsel.findMany({
    where: { caseId: Number(caseId) },
    orderBy: { createdAt: 'asc' },
  });
}

async function removeCounsel(counselId, userId) {
  const counsel = await prisma.caseCounsel.findUnique({ where: { id: Number(counselId) } });
  if (!counsel) throw new Error('Counsel assignment not found');

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: counsel.caseId,
      action: 'counsel_removed',
      performedBy: userId,
      notes: counsel.name,
    },
  });

  return prisma.caseCounsel.delete({ where: { id: Number(counselId) } });
}

module.exports = { assignCounsel, listCounsel, removeCounsel };
