const prisma = require('../../db/prisma');

function archivedFilter(archived) {
  if (archived === 'true') return { archivedAt: { not: null } };
  if (archived === 'all') return {};
  return { archivedAt: null }; // default: active only
}

async function listContracts({ status, department, archived } = {}) {
  return prisma.contract.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(department ? { department } : {}),
      ...archivedFilter(archived),
    },
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getContract(id) {
  const contract = await prisma.contract.findUnique({
    where: { id: Number(id) },
    include: { owner: true, approvals: true, signatures: true },
  });
  if (!contract) throw new Error('Contract not found');
  return contract;
}

async function createContract(data, userId) {
  const contract = await prisma.contract.create({
    data: {
      title: data.title,
      counterparty: data.counterparty,
      department: data.department,
      value: data.value,
      currency: data.currency || 'NGN',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'draft',
      ownerId: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: contract.id,
      action: 'created',
      performedBy: userId,
    },
  });

  // Auto-create an expiry reminder 30 days before the contract's end date
  const remindAt = new Date(contract.endDate);
  remindAt.setDate(remindAt.getDate() - 30);

  await prisma.reminder.create({
    data: {
      entityType: 'contract',
      entityId: contract.id,
      remindAt,
      message: `Contract "${contract.title}" expires on ${contract.endDate.toDateString()}`,
    },
  });

  return contract;
}

async function updateContract(id, data, userId) {
  const contract = await prisma.contract.update({
    where: { id: Number(id) },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.counterparty && { counterparty: data.counterparty }),
      ...(data.department && { department: data.department }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.currency && { currency: data.currency }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.status && { status: data.status }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: contract.id,
      action: 'updated',
      performedBy: userId,
      notes: JSON.stringify(data),
    },
  });

  return contract;
}

async function archiveContract(id, userId) {
  const contract = await prisma.contract.update({
    where: { id: Number(id) },
    data: { archivedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: { entityType: 'contract', entityId: contract.id, action: 'archived', performedBy: userId },
  });
  return contract;
}

async function unarchiveContract(id, userId) {
  const contract = await prisma.contract.update({
    where: { id: Number(id) },
    data: { archivedAt: null },
  });
  await prisma.auditLog.create({
    data: { entityType: 'contract', entityId: contract.id, action: 'unarchived', performedBy: userId },
  });
  return contract;
}

async function deleteContract(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'contract',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });

  return prisma.contract.delete({ where: { id: Number(id) } });
}

module.exports = {
  listContracts,
  getContract,
  createContract,
  updateContract,
  archiveContract,
  unarchiveContract,
  deleteContract,
};
