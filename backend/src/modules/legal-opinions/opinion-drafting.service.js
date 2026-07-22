const prisma = require('../../db/prisma');

// Starts (or continues) drafting an opinion for a request that's been assigned.
async function startDraft(requestId, userId) {
  const request = await prisma.legalOpinionRequest.findUnique({
    where: { id: Number(requestId) },
    include: { opinion: true },
  });
  if (!request) throw new Error('Request not found');
  if (!request.assignedToId) throw new Error('Request must be assigned to an officer before drafting');
  if (request.opinion) return request.opinion; // draft already started

  const opinion = await prisma.legalOpinion.create({
    data: {
      requestId: Number(requestId),
      draftedById: userId,
      content: '',
      status: 'draft',
    },
  });

  await prisma.legalOpinionRequest.update({
    where: { id: Number(requestId) },
    data: { status: 'drafting' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion',
      entityId: opinion.id,
      action: 'draft_started',
      performedBy: userId,
    },
  });

  return opinion;
}

async function updateDraft(opinionId, { content }, userId) {
  const opinion = await prisma.legalOpinion.findUnique({ where: { id: Number(opinionId) } });
  if (!opinion) throw new Error('Opinion not found');
  if (opinion.status !== 'draft') throw new Error('Opinion is no longer in draft status');

  const updated = await prisma.legalOpinion.update({
    where: { id: Number(opinionId) },
    data: { content },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion',
      entityId: opinion.id,
      action: 'draft_updated',
      performedBy: userId,
    },
  });

  return updated;
}

async function getOpinion(id) {
  const opinion = await prisma.legalOpinion.findUnique({
    where: { id: Number(id) },
    include: { request: true, draftedBy: true, reviewedBy: true },
  });
  if (!opinion) throw new Error('Opinion not found');
  return opinion;
}

module.exports = { startDraft, updateDraft, getOpinion };
