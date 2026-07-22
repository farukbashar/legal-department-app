const prisma = require('../../db/prisma');

const VALID_TYPES = ['act', 'regulation', 'policy', 'precedent', 'template'];

// listItems doubles as search: filter by `type` (act/regulation/policy/
// precedent/template) and/or a keyword `q` across title and content.
async function listItems({ type, q } = {}) {
  return prisma.knowledgeItem.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { createdBy: true },
    orderBy: { updatedAt: 'desc' },
  });
}

async function getItem(id) {
  const item = await prisma.knowledgeItem.findUnique({
    where: { id: Number(id) },
    include: { createdBy: true },
  });
  if (!item) throw new Error('Knowledge base item not found');
  return item;
}

async function createItem(data, userId) {
  if (!VALID_TYPES.includes(data.type)) {
    throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const item = await prisma.knowledgeItem.create({
    data: {
      type: data.type,
      title: data.title,
      content: data.content,
      fileUrl: data.fileUrl,
      createdById: userId,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'knowledge_item',
      entityId: item.id,
      action: 'created',
      performedBy: userId,
      notes: `${data.type}: ${data.title}`,
    },
  });

  return item;
}

async function updateItem(id, data, userId) {
  if (data.type && !VALID_TYPES.includes(data.type)) {
    throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const item = await prisma.knowledgeItem.update({
    where: { id: Number(id) },
    data: {
      ...(data.type && { type: data.type }),
      ...(data.title && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'knowledge_item',
      entityId: item.id,
      action: 'updated',
      performedBy: userId,
    },
  });

  return item;
}

async function deleteItem(id, userId) {
  await prisma.auditLog.create({
    data: {
      entityType: 'knowledge_item',
      entityId: Number(id),
      action: 'deleted',
      performedBy: userId,
    },
  });
  return prisma.knowledgeItem.delete({ where: { id: Number(id) } });
}

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
