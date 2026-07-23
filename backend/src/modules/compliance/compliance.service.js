const prisma = require('../../db/prisma');

function archivedFilter(archived) {
  if (archived === 'true') return { archivedAt: { not: null } };
  if (archived === 'all') return {};
  return { archivedAt: null };
}

async function listObligations({ status, responsibleOfficerId, archived } = {}) {
  return prisma.complianceObligation.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(responsibleOfficerId ? { responsibleOfficerId: Number(responsibleOfficerId) } : {}),
      ...archivedFilter(archived),
    },
    include: { responsibleOfficer: true },
    orderBy: { dueDate: 'asc' },
  });
}

async function getObligation(id) {
  const o = await prisma.complianceObligation.findUnique({
    where: { id: Number(id) },
    include: { responsibleOfficer: true },
  });
  if (!o) throw new Error('Obligation not found');
  return o;
}

async function createObligation(data, userId) {
  const o = await prisma.complianceObligation.create({
    data: {
      regulation: data.regulation,
      description: data.description,
      dueDate: new Date(data.dueDate),
      responsibleOfficerId: data.responsibleOfficerId ?? null,
      status: 'pending',
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'compliance_obligation',
      entityId: o.id,
      action: 'created',
      performedBy: userId,
    },
  });

  // Auto-create a due-date reminder 14 days ahead
  const remindAt = new Date(o.dueDate);
  remindAt.setDate(remindAt.getDate() - 14);

  await prisma.reminder.create({
    data: {
      entityType: 'compliance_obligation',
      entityId: o.id,
      remindAt,
      message: `Compliance obligation "${o.regulation}" is due on ${o.dueDate.toDateString()}`,
    },
  });

  return o;
}

// Covers general edits plus dedicated due-date, responsible-officer, and
// status updates, since all four are just fields on the same record.
async function updateObligation(id, data, userId) {
  const o = await prisma.complianceObligation.update({
    where: { id: Number(id) },
    data: {
      ...(data.regulation && { regulation: data.regulation }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      ...(data.responsibleOfficerId !== undefined && { responsibleOfficerId: data.responsibleOfficerId }),
      ...(data.status && { status: data.status }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'compliance_obligation',
      entityId: o.id,
      action: 'updated',
      performedBy: userId,
      notes: JSON.stringify(data),
    },
  });

  return o;
}

async function archiveObligation(id, userId) {
  const o = await prisma.complianceObligation.update({ where: { id: Number(id) }, data: { archivedAt: new Date() } });
  await prisma.auditLog.create({
    data: { entityType: 'compliance_obligation', entityId: o.id, action: 'archived', performedBy: userId },
  });
  return o;
}

async function unarchiveObligation(id, userId) {
  const o = await prisma.complianceObligation.update({ where: { id: Number(id) }, data: { archivedAt: null } });
  await prisma.auditLog.create({
    data: { entityType: 'compliance_obligation', entityId: o.id, action: 'unarchived', performedBy: userId },
  });
  return o;
}

async function deleteObligation(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'compliance_obligation',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.complianceObligation.delete({ where: { id: Number(id) } });
}

module.exports = {
  listObligations,
  getObligation,
  createObligation,
  updateObligation,
  archiveObligation,
  unarchiveObligation,
  deleteObligation,
};
