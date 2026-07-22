const prisma = require('../../db/prisma');

// Marks an MoU as renewed with a new renewal date, and schedules the next
// reminder 30 days ahead of that new date.
async function renewMou(id, { newRenewalDate }, userId) {
  const mou = await prisma.mou.findUnique({ where: { id: Number(id) } });
  if (!mou) throw new Error('MoU not found');
  if (!['approved', 'active', 'renewed'].includes(mou.status)) {
    throw new Error('Only an approved or active MoU can be renewed');
  }

  const updated = await prisma.mou.update({
    where: { id: Number(id) },
    data: {
      status: 'renewed',
      renewalDate: new Date(newRenewalDate),
    },
  });

  const remindAt = new Date(updated.renewalDate);
  remindAt.setDate(remindAt.getDate() - 30);

  await prisma.reminder.create({
    data: {
      entityType: 'mou',
      entityId: updated.id,
      remindAt,
      message: `MoU "${updated.title}" is due for renewal on ${updated.renewalDate.toDateString()}`,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: updated.id,
      action: 'renewed',
      performedBy: userId,
      notes: `New renewal date: ${newRenewalDate}`,
    },
  });

  return updated;
}

async function listReminders(id) {
  return prisma.reminder.findMany({
    where: { entityType: 'mou', entityId: Number(id) },
    orderBy: { remindAt: 'desc' },
  });
}

module.exports = { renewMou, listReminders };
