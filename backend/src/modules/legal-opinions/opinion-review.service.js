const prisma = require('../../db/prisma');

async function submitForReview(opinionId, userId) {
  const opinion = await prisma.legalOpinion.findUnique({ where: { id: Number(opinionId) } });
  if (!opinion) throw new Error('Opinion not found');
  if (opinion.status !== 'draft') throw new Error('Only a draft opinion can be submitted for review');
  if (!opinion.content || !opinion.content.trim()) throw new Error('Cannot submit an empty opinion for review');

  const updated = await prisma.legalOpinion.update({
    where: { id: Number(opinionId) },
    data: { status: 'submitted_for_review' },
  });

  await prisma.legalOpinionRequest.update({
    where: { id: opinion.requestId },
    data: { status: 'in_review' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion',
      entityId: opinion.id,
      action: 'submitted_for_review',
      performedBy: userId,
    },
  });

  return updated;
}

async function decideReview(opinionId, { decision, comments }, user) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const opinion = await prisma.legalOpinion.findUnique({ where: { id: Number(opinionId) } });
  if (!opinion) throw new Error('Opinion not found');
  if (opinion.status !== 'submitted_for_review') {
    throw new Error('Opinion is not currently awaiting review');
  }

  const updated = await prisma.legalOpinion.update({
    where: { id: Number(opinionId) },
    data: {
      status: decision === 'approved' ? 'approved' : 'draft', // rejection sends it back for revision
      reviewedById: user.id,
      reviewComments: comments,
    },
  });

  await prisma.legalOpinionRequest.update({
    where: { id: opinion.requestId },
    data: { status: decision === 'approved' ? 'completed' : 'drafting' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'legal_opinion',
      entityId: opinion.id,
      action: `review_${decision}`,
      performedBy: user.id,
      notes: comments,
    },
  });

  return updated;
}

module.exports = { submitForReview, decideReview };
