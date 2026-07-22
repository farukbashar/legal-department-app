const prisma = require('../../db/prisma');

async function recordJudgment(caseId, { outcome, amount, judgmentDate, notes }, userId) {
  const c = await prisma.litigationCase.findUnique({ where: { id: Number(caseId) }, include: { judgment: true } });
  if (!c) throw new Error('Case not found');
  if (!['won', 'lost', 'settled', 'dismissed'].includes(outcome)) {
    throw new Error('Outcome must be one of: won, lost, settled, dismissed');
  }
  if (c.judgment) throw new Error('This case already has a judgment recorded');

  const judgment = await prisma.judgment.create({
    data: {
      caseId: Number(caseId),
      outcome,
      amount: amount ?? null,
      judgmentDate: new Date(judgmentDate),
      notes,
    },
  });

  // Move the case itself into a terminal status reflecting the judgment
  await prisma.litigationCase.update({
    where: { id: Number(caseId) },
    data: { status: 'judgment_entered' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: Number(caseId),
      action: 'judgment_recorded',
      performedBy: userId,
      notes: `${outcome}${amount ? ` — ${amount}` : ''}`,
    },
  });

  return judgment;
}

async function getJudgment(caseId) {
  const judgment = await prisma.judgment.findUnique({ where: { caseId: Number(caseId) } });
  if (!judgment) throw new Error('No judgment recorded for this case');
  return judgment;
}

async function updateJudgment(caseId, data, userId) {
  const existing = await prisma.judgment.findUnique({ where: { caseId: Number(caseId) } });
  if (!existing) throw new Error('No judgment recorded for this case');

  const judgment = await prisma.judgment.update({
    where: { caseId: Number(caseId) },
    data: {
      ...(data.outcome && { outcome: data.outcome }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.judgmentDate && { judgmentDate: new Date(data.judgmentDate) }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: Number(caseId),
      action: 'judgment_updated',
      performedBy: userId,
      notes: JSON.stringify(data),
    },
  });

  return judgment;
}

module.exports = { recordJudgment, getJudgment, updateJudgment };
