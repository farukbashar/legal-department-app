const prisma = require('../../db/prisma');

// Full text-ish search over past opinions by subject or content, optionally
// scoped by status (defaults to only approved opinions, since that's what
// most searches are looking for as precedent).
async function searchOpinions({ q, status }) {
  return prisma.legalOpinion.findMany({
    where: {
      status: status || 'approved',
      ...(q
        ? {
            OR: [
              { content: { contains: q, mode: 'insensitive' } },
              { request: { subject: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: { request: true, draftedBy: true, reviewedBy: true },
    orderBy: { updatedAt: 'desc' },
  });
}

module.exports = { searchOpinions };
