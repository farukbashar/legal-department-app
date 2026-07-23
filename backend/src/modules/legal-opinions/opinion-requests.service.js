const prisma = require('../../db/prisma');

function archivedFilter(archived) {
  if (archived === 'true') return { archivedAt: { not: null } };
  if (archived === 'all') return {};
  return { archivedAt: null };
}

async function createRequest({ subject, description, priority }, requesterId) {
  const req = await prisma.legalOpinionRequest.create({
    data: {
      subject,
      description,
      priority: priority || 'medium',
      status: 'submitted',
      requesterId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion_request',
      entityId: req.id,
      action: 'created',
      performedBy: requesterId,
    },
  });

  return req;
}

async function listRequests({ status, priority, archived } = {}) {
  return prisma.legalOpinionRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...archivedFilter(archived),
    },
    include: { requester: true, assignedTo: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRequest(id) {
  const req = await prisma.legalOpinionRequest.findUnique({
    where: { id: Number(id) },
    include: { requester: true, assignedTo: true, opinion: true },
  });
  if (!req) throw new Error('Request not found');
  return req;
}

async function assignOfficer(id, { officerId }, userId) {
  const req = await prisma.legalOpinionRequest.update({
    where: { id: Number(id) },
    data: { assignedToId: officerId, status: 'assigned' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion_request',
      entityId: req.id,
      action: 'officer_assigned',
      performedBy: userId,
      notes: `Assigned to user ${officerId}`,
    },
  });

  return req;
}

async function archiveRequest(id, userId) {
  const req = await prisma.legalOpinionRequest.update({
    where: { id: Number(id) },
    data: { archivedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: { entityType: 'legal_opinion_request', entityId: req.id, action: 'archived', performedBy: userId },
  });
  return req;
}

async function unarchiveRequest(id, userId) {
  const req = await prisma.legalOpinionRequest.update({
    where: { id: Number(id) },
    data: { archivedAt: null },
  });
  await prisma.auditLog.create({
    data: { entityType: 'legal_opinion_request', entityId: req.id, action: 'unarchived', performedBy: userId },
  });
  return req;
}

async function deleteRequest(id, userId) {
  await prisma.auditLog.create({
    data: { entityType: 'legal_opinion_request', entityId: Number(id), action: 'deleted', performedBy: userId },
  });
  return prisma.legalOpinionRequest.delete({ where: { id: Number(id) } });
}

module.exports = {
  createRequest,
  listRequests,
  getRequest,
  assignOfficer,
  archiveRequest,
  unarchiveRequest,
  deleteRequest,
};
