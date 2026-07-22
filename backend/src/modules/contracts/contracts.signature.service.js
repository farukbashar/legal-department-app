const prisma = require('../../db/prisma');

async function requestSignature(contractId, { signerName, signerEmail, method }, userId) {
  const contract = await prisma.contract.findUnique({ where: { id: Number(contractId) } });
  if (!contract) throw new Error('Contract not found');
  if (contract.status !== 'active') {
    throw new Error('Contract must be fully approved before signatures can be requested');
  }

  const signature = await prisma.contractSignature.create({
    data: {
      contractId: Number(contractId),
      signerName,
      signerEmail,
      method: method || 'digital',
      status: 'pending',
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: Number(contractId),
      action: 'signature_requested',
      performedBy: userId,
      notes: `Requested from ${signerName} (${signerEmail})`,
    },
  });

  return signature;
}

async function listSignatures(contractId) {
  return prisma.contractSignature.findMany({
    where: { contractId: Number(contractId) },
    orderBy: { id: 'asc' },
  });
}

async function recordSignature(signatureId, { status }, userId) {
  if (!['signed', 'declined'].includes(status)) {
    throw new Error('Status must be "signed" or "declined"');
  }

  const signature = await prisma.contractSignature.findUnique({ where: { id: Number(signatureId) } });
  if (!signature) throw new Error('Signature request not found');
  if (signature.status !== 'pending') throw new Error('This signature has already been recorded');

  const updated = await prisma.contractSignature.update({
    where: { id: Number(signatureId) },
    data: {
      status,
      signedAt: status === 'signed' ? new Date() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: signature.contractId,
      action: `signature_${status}`,
      performedBy: userId,
      notes: `${signature.signerName} (${signature.signerEmail})`,
    },
  });

  // If every signature on the contract is now signed, mark the contract executed
  const pendingCount = await prisma.contractSignature.count({
    where: { contractId: signature.contractId, status: 'pending' },
  });

  if (pendingCount === 0 && status === 'signed') {
    const anyDeclined = await prisma.contractSignature.count({
      where: { contractId: signature.contractId, status: 'declined' },
    });
    if (anyDeclined === 0) {
      await prisma.contract.update({
        where: { id: signature.contractId },
        data: { status: 'executed' },
      });
    }
  }

  return updated;
}

module.exports = { requestSignature, listSignatures, recordSignature };
