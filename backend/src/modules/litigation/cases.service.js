const prisma = require('../../db/prisma');

async function listCases({ status, court } = {}) {
  return prisma.litigationCase.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(court ? { court } : {}),
    },
    include: { owner: true, judgment: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getCase(id) {
  const c = await prisma.litigationCase.findUnique({
    where: { id: Number(id) },
    include: { owner: true, hearings: true, counsel: true, judgment: true },
  });
  if (!c) throw new Error('Case not found');
  return c;
}

async function createCase(data, userId) {
  const c = await prisma.litigationCase.create({
    data: {
      caseNumber: data.caseNumber,
      court: data.court,
      opposingParty: data.opposingParty,
      subjectMatter: data.subjectMatter,
      financialExposure: data.financialExposure ?? null,
      currency: data.currency || 'NGN',
      status: 'open',
      ownerId: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: c.id,
      action: 'created',
      performedBy: userId,
    },
  });

  return c;
}

// Covers general edits as well as dedicated status / financial exposure updates,
// since both are just fields on the case.
async function updateCase(id, data, userId) {
  const c = await prisma.litigationCase.update({
    where: { id: Number(id) },
    data: {
      ...(data.caseNumber && { caseNumber: data.caseNumber }),
      ...(data.court && { court: data.court }),
      ...(data.opposingParty && { opposingParty: data.opposingParty }),
      ...(data.subjectMatter !== undefined && { subjectMatter: data.subjectMatter }),
      ...(data.status && { status: data.status }),
      ...(data.financialExposure !== undefined && { financialExposure: data.financialExposure }),
      ...(data.currency && { currency: data.currency }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: c.id,
      action: 'updated',
      performedBy: userId,
      notes: JSON.stringify(data),
    },
  });

  return c;
}

async function deleteCase(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'litigation_case',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.litigationCase.delete({ where: { id: Number(id) } });
}

module.exports = { listCases, getCase, createCase, updateCase, deleteCase };
