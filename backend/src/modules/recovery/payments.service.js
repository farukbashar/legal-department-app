const prisma = require('../../db/prisma');

async function recordPayment(debtCaseId, { amount, paymentDate, method, notes }, userId) {
  const debtCase = await prisma.debtCase.findUnique({
    where: { id: Number(debtCaseId) },
    include: { payments: true },
  });
  if (!debtCase) throw new Error('Debt case not found');

  const payment = await prisma.debtPayment.create({
    data: {
      debtCaseId: Number(debtCaseId),
      amount,
      paymentDate: new Date(paymentDate),
      method,
      notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'debt_case',
      entityId: Number(debtCaseId),
      action: 'payment_recorded',
      performedBy: userId,
      notes: `${amount} on ${paymentDate}`,
    },
  });

  // Auto-update recovery status based on total paid vs amount owed
  const totalPaid = debtCase.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
  let status = 'in_recovery';
  if (totalPaid >= Number(debtCase.amountOwed)) status = 'recovered';
  else if (totalPaid > 0) status = 'partially_recovered';

  await prisma.debtCase.update({
    where: { id: Number(debtCaseId) },
    data: { status },
  });

  return payment;
}

async function listPayments(debtCaseId) {
  return prisma.debtPayment.findMany({
    where: { debtCaseId: Number(debtCaseId) },
    orderBy: { paymentDate: 'desc' },
  });
}

module.exports = { recordPayment, listPayments };
