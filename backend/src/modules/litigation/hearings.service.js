const prisma = require('../../db/prisma');

async function scheduleHearing(caseId, { hearingDate, purpose }, userId) {
  const c = await prisma.litigationCase.findUnique({ where: { id: Number(caseId) } });
  if (!c) throw new Error('Case not found');

  const hearing = await prisma.hearing.create({
    data: {
      caseId: Number(caseId),
      hearingDate: new Date(hearingDate),
      purpose,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: Number(caseId),
      action: 'hearing_scheduled',
      performedBy: userId,
      notes: `${hearingDate} — ${purpose || 'no purpose given'}`,
    },
  });

  return hearing;
}

async function listHearings(caseId) {
  return prisma.hearing.findMany({
    where: { caseId: Number(caseId) },
    orderBy: { hearingDate: 'asc' },
  });
}

async function recordOutcome(hearingId, { outcome }, userId) {
  const hearing = await prisma.hearing.findUnique({ where: { id: Number(hearingId) } });
  if (!hearing) throw new Error('Hearing not found');

  const updated = await prisma.hearing.update({
    where: { id: Number(hearingId) },
    data: { outcome },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: hearing.caseId,
      action: 'hearing_outcome_recorded',
      performedBy: userId,
      notes: outcome,
    },
  });

  return updated;
}

module.exports = { scheduleHearing, listHearings, recordOutcome };
