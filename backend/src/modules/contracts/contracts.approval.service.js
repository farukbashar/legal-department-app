const prisma = require('../../db/prisma');

// Define who approves at each step, in order. Adjust to match REA's real chain.
const DEFAULT_APPROVAL_CHAIN = ['legal_officer', 'head_of_legal'];

async function startApprovalWorkflow(contractId, userId) {
  const contract = await prisma.contract.findUnique({ where: { id: Number(contractId) } });
  if (!contract) throw new Error('Contract not found');

  // Wipe any previous (e.g. rejected) approval chain before starting a fresh one
  await prisma.contractApproval.deleteMany({ where: { contractId: Number(contractId) } });

  const steps = await Promise.all(
    DEFAULT_APPROVAL_CHAIN.map((roleRequired, index) =>
      prisma.contractApproval.create({
        data: {
          contractId: Number(contractId),
          step: index + 1,
          status: 'pending',
          comments: `Awaiting approval from role: ${roleRequired}`,
        },
      })
    )
  );

  await prisma.contract.update({
    where: { id: Number(contractId) },
    data: { status: 'pending_approval' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: Number(contractId),
      action: 'approval_workflow_started',
      performedBy: userId,
    },
  });

  return steps;
}

async function listApprovals(contractId) {
  return prisma.contractApproval.findMany({
    where: { contractId: Number(contractId) },
    include: { approver: true },
    orderBy: { step: 'asc' },
  });
}

async function decideApproval(approvalId, { decision, comments }, user) {
  const approval = await prisma.contractApproval.findUnique({ where: { id: Number(approvalId) } });
  if (!approval) throw new Error('Approval step not found');
  if (approval.status !== 'pending') throw new Error('This approval step has already been decided');

  // Enforce steps happen in order
  const priorPending = await prisma.contractApproval.findFirst({
    where: { contractId: approval.contractId, step: { lt: approval.step }, status: 'pending' },
  });
  if (priorPending) throw new Error('A prior approval step is still pending');

  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Decision must be "approved" or "rejected"');
  }

  const updated = await prisma.contractApproval.update({
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
      entityType: 'contract',
      entityId: approval.contractId,
      action: `approval_${decision}`,
      performedBy: user.id,
      notes: comments,
    },
  });

  if (decision === 'rejected') {
    await prisma.contract.update({
      where: { id: approval.contractId },
      data: { status: 'draft' },
    });
    return updated;
  }

  // If approved, check whether all steps are now done
  const remaining = await prisma.contractApproval.count({
    where: { contractId: approval.contractId, status: 'pending' },
  });

  if (remaining === 0) {
    await prisma.contract.update({
      where: { id: approval.contractId },
      data: { status: 'active' },
    });
  }

  return updated;
}

module.exports = { startApprovalWorkflow, listApprovals, decideApproval };
