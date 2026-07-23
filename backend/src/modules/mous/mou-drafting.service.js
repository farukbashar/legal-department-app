const prisma = require('../../db/prisma');

function archivedFilter(archived) {
  if (archived === 'true') return { archivedAt: { not: null } };
  if (archived === 'all') return {};
  return { archivedAt: null };
}

async function listMous({ status, archived } = {}) {
  return prisma.mou.findMany({
    where: { ...(status ? { status } : {}), ...archivedFilter(archived) },
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getMou(id) {
  const mou = await prisma.mou.findUnique({
    where: { id: Number(id) },
    include: { owner: true, approvals: true },
  });
  if (!mou) throw new Error('MoU not found');
  return mou;
}

async function draftMou(data, userId) {
  const mou = await prisma.mou.create({
    data: {
      title: data.title,
      parties: data.parties,
      purpose: data.purpose,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
      status: 'draft',
      ownerId: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: mou.id,
      action: 'drafted',
      performedBy: userId,
    },
  });

  // Auto-create a renewal reminder 30 days before the renewal date, if one was given
  if (mou.renewalDate) {
    const remindAt = new Date(mou.renewalDate);
    remindAt.setDate(remindAt.getDate() - 30);

    await prisma.reminder.create({
      data: {
        entityType: 'mou',
        entityId: mou.id,
        remindAt,
        message: `MoU "${mou.title}" is due for renewal on ${mou.renewalDate.toDateString()}`,
      },
    });
  }

  return mou;
}

async function updateDraft(id, data, userId) {
  const mou = await prisma.mou.update({
    where: { id: Number(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.parties && { parties: data.parties }),
      ...(data.purpose !== undefined && { purpose: data.purpose }),
      ...(data.renewalDate && { renewalDate: new Date(data.renewalDate) }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: mou.id,
      action: 'draft_updated',
      performedBy: userId,
    },
  });

  return mou;
}

async function archiveMou(id, userId) {
  const mou = await prisma.mou.update({ where: { id: Number(id) }, data: { archivedAt: new Date() } });
  await prisma.auditLog.create({
    data: { entityType: 'mou', entityId: mou.id, action: 'archived', performedBy: userId },
  });
  return mou;
}

async function unarchiveMou(id, userId) {
  const mou = await prisma.mou.update({ where: { id: Number(id) }, data: { archivedAt: null } });
  await prisma.auditLog.create({
    data: { entityType: 'mou', entityId: mou.id, action: 'unarchived', performedBy: userId },
  });
  return mou;
}

async function deleteMou(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.mou.delete({ where: { id: Number(id) } });
}

module.exports = { listMous, getMou, draftMou, updateDraft, archiveMou, unarchiveMou, deleteMou };
