const prisma = require('../../db/prisma');

const DEFAULT_APPROVAL_CHAIN = ['legal_officer', 'head_of_legal'];

async function startApprovalWorkflow(mouId, userId) {
  const mou = await prisma.mou.findUnique({ where: { id: Number(mouId) } });
  if (!mou) throw new Error('MoU not found');
  if (mou.status !== 'in_review') throw new Error('MoU must be submitted for review before starting approvals');

  await prisma.mouApproval.deleteMany({ where: { mouId: Number(mouId) } });

  const steps = await Promise.all(
    DEFAULT_APPROVAL_CHAIN.map((roleRequired, index) =>
      prisma.mouApproval.create({
        data: {
          mouId: Number(mouId),
          step: index + 1,
          status: 'pending',
          comments: `Awaiting approval from role: ${roleRequired}`,
        },
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: Number(mouId),
      action: 'approval_workflow_started',
      performedBy: userId,
    },
  });

  return steps;
}

async function listApprovals(mouId) {
  return prisma.mouApproval.findMany({
    where: { mouId: Number(mouId) },
    include: { approver: true },
    orderBy: { step: 'asc' },
  });
}

async function decideApproval(approvalId, { decision, comments }, user) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const approval = await prisma.mouApproval.findUnique({ where: { id: Number(approvalId) } });
  if (!approval) throw new Error('Approval step not found');
  if (approval.status !== 'pending') throw new Error('This approval step has already been decided');

  const priorPending = await prisma.mouApproval.findFirst({
    where: { mouId: approval.mouId, step: { lt: approval.step }, status: 'pending' },
  });
  if (priorPending) throw new Error('A prior approval step is still pending');

  const updated = await prisma.mouApproval.update({
    where: { id: Number(approvalId) },
    data: {
      status: decision,
      comments,
      approverId: user.id,
      decidedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'mou',
      entityId: approval.mouId,
      action: `approval_${decision}`,
      performedBy: user.id,
      notes: comments,
    },
  });

  if (decision === 'rejected') {
    await prisma.mou.update({ where: { id: approval.mouId }, data: { status: 'draft' } });
    return updated;
  }

  const remaining = await prisma.mouApproval.count({
    where: { mouId: approval.mouId, status: 'pending' },
  });

  if (remaining === 0) {
    await prisma.mou.update({ where: { id: approval.mouId }, data: { status: 'approved' } });
  }

  return updated;
}

module.exports = { startApprovalWorkflow, listApprovals, decideApproval };
