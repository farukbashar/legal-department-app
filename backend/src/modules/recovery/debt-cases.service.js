const prisma = require('../../db/prisma');

function withBalance(debtCase) {
  const paid = (debtCase.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
  return {
    ...debtCase,
    totalPaid: paid,
    outstandingBalance: Number(debtCase.amountOwed) - paid,
  };
}

async function listDebtCases({ status } = {}) {
  const cases = await prisma.debtCase.findMany({
    where: { ...(status ? { status } : {}) },
    include: { owner: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });
  return cases.map(withBalance);
}

async function getDebtCase(id) {
  const c = await prisma.debtCase.findUnique({
    where: { id: Number(id) },
    include: { owner: true, payments: true },
  });
  if (!c) throw new Error('Debt case not found');
  return withBalance(c);
}

async function createDebtCase(data, userId) {
  const c = await prisma.debtCase.create({
    data: {
      debtor: data.debtor,
      description: data.description,
      amountOwed: data.amountOwed,
      currency: data.currency || 'NGN',
      status: 'outstanding',
      ownerId: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'debt_case',
      entityId: c.id,
      action: 'created',
      performedBy: userId,
    },
  });

  return c;
}

// Also covers recovery-progress updates, since that's just the status field.
async function updateDebtCase(id, data, userId) {
  const c = await prisma.debtCase.update({
    where: { id: Number(id) },
    data: {
      ...(data.debtor && { debtor: data.debtor }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.amountOwed !== undefined && { amountOwed: data.amountOwed }),
      ...(data.currency && { currency: data.currency }),
      ...(data.status && { status: data.status }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'debt_case',
      entityId: c.id,
      action: 'updated',
      performedBy: userId,
      notes: JSON.stringify(data),
    },
  });

  return c;
}

async function deleteDebtCase(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'debt_case',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.debtCase.delete({ where: { id: Number(id) } });
}

module.exports = { listDebtCases, getDebtCase, createDebtCase, updateDebtCase, deleteDebtCase };
