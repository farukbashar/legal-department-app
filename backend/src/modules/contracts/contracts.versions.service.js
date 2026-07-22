const prisma = require('../../db/prisma');

// Uploads a new version of a contract document. `fileUrl` is wherever the
// actual file was stored (S3, local disk, etc.) — this just tracks the record.
async function uploadVersion(contractId, { fileName, fileUrl }, userId) {
  const contract = await prisma.contract.findUnique({ where: { id: Number(contractId) } });
  if (!contract) throw new Error('Contract not found');

  const latest = await prisma.document.findFirst({
    where: { entityType: 'contract', entityId: Number(contractId) },
    orderBy: { version: 'desc' },
  });

  const nextVersion = latest ? latest.version + 1 : 1;

  const doc = await prisma.document.create({
    data: {
      entityType: 'contract',
      entityId: Number(contractId),
      fileName,
      fileUrl,
      version: nextVersion,
      uploadedBy: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: Number(contractId),
      action: 'document_version_uploaded',
      performedBy: userId,
      notes: `${fileName} (v${nextVersion})`,
    },
  });

  return doc;
}

async function listVersions(contractId) {
  return prisma.document.findMany({
    where: { entityType: 'contract', entityId: Number(contractId) },
    include: { uploader: true },
    orderBy: { version: 'desc' },
  });
}

module.exports = { uploadVersion, listVersions };
