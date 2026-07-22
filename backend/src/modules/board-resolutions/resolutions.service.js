const prisma = require('../../db/prisma');

// listResolutions doubles as the search endpoint: an optional `q` does a
// keyword search across title, resolution number, and summary.
async function listResolutions({ q } = {}) {
  return prisma.boardResolution.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { resolutionNumber: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    include: { createdBy: true },
    orderBy: { resolutionDate: 'desc' },
  });
}

async function getResolution(id) {
  const r = await prisma.boardResolution.findUnique({
    where: { id: Number(id) },
    include: { createdBy: true },
  });
  if (!r) throw new Error('Resolution not found');
  return r;
}

async function createResolution(data, userId) {
  const r = await prisma.boardResolution.create({
    data: {
      resolutionNumber: data.resolutionNumber,
      title: data.title,
      summary: data.summary,
      resolutionDate: new Date(data.resolutionDate),
      createdById: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'board_resolution',
      entityId: r.id,
      action: 'created',
      performedBy: userId,
    },
  });

  return r;
}

async function updateResolution(id, data, userId) {
  const r = await prisma.boardResolution.update({
    where: { id: Number(id) },
    data: {
      ...(data.resolutionNumber && { resolutionNumber: data.resolutionNumber }),
      ...(data.title && { title: data.title }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.resolutionDate && { resolutionDate: new Date(data.resolutionDate) }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'board_resolution',
      entityId: r.id,
      action: 'updated',
      performedBy: userId,
    },
  });

  return r;
}

async function deleteResolution(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'board_resolution',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.boardResolution.delete({ where: { id: Number(id) } });
}

// ---------- Linked supporting documents ----------
// Reuses the shared documents table (entityType = 'board_resolution').

async function linkDocument(resolutionId, { fileName, fileUrl }, userId) {
  const r = await prisma.boardResolution.findUnique({ where: { id: Number(resolutionId) } });
  if (!r) throw new Error('Resolution not found');

  const doc = await prisma.document.create({
    data: {
      entityType: 'board_resolution',
      entityId: Number(resolutionId),
      fileName,
      fileUrl,
      uploadedBy: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'board_resolution',
      entityId: Number(resolutionId),
      action: 'document_linked',
      performedBy: userId,
      notes: fileName,
    },
  });

  return doc;
}

async function listLinkedDocuments(resolutionId) {
  return prisma.document.findMany({
    where: { entityType: 'board_resolution', entityId: Number(resolutionId) },
    include: { uploader: true },
    orderBy: { uploadedAt: 'desc' },
  });
}

module.exports = {
  listResolutions,
  getResolution,
  createResolution,
  updateResolution,
  deleteResolution,
  linkDocument,
  listLinkedDocuments,
};
