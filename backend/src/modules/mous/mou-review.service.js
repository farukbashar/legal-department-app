const prisma = require('../../db/prisma');

async function submitForReview(id, userId) {
  const mou = await prisma.mou.findUnique({ where: { id: Number(id) } });
  if (!mou) throw new Error('MoU not found');
  if (mou.status !== 'draft') throw new Error('Only a draft MoU can be submitted for review');

  const updated = await prisma.mou.update({
    where: { id: Number(id) },
    data: { status: 'in_review' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: mou.id,
      action: 'submitted_for_review',
      performedBy: userId,
    },
  });

  return updated;
}

module.exports = { submitForReview };
