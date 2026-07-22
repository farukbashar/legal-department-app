const prisma = require('../../db/prisma');

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

async function listRequests({ status, priority } = {}) {
  return prisma.legalOpinionRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
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

module.exports = { createRequest, listRequests, getRequest, assignOfficer };
