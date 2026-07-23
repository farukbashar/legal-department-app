const prisma = require('../../db/prisma');

// Runs the same keyword across every module's obvious "title-like" fields
// and returns a flat, uniformly-shaped result list the frontend can render
// without knowing the specifics of each module.
async function globalSearch(q) {
  if (!q || !q.trim()) return [];
  const query = q.trim();
  const ci = { contains: query, mode: 'insensitive' };

  const [contracts, opinionRequests, cases, mous, resolutions, debtCases, knowledgeItems] =
    await Promise.all([
      prisma.contract.findMany({
        where: { OR: [{ title: ci }, { counterparty: ci }] },
        select: { id: true, title: true, counterparty: true, status: true },
        take: 8,
      }),
      prisma.legalOpinionRequest.findMany({
        where: { subject: ci },
        select: { id: true, subject: true, status: true },
        take: 8,
      }),
      prisma.litigationCase.findMany({
        where: { OR: [{ caseNumber: ci }, { opposingParty: ci }] },
        select: { id: true, caseNumber: true, opposingParty: true, status: true },
        take: 8,
      }),
      prisma.mou.findMany({
        where: { OR: [{ title: ci }, { parties: ci }] },
        select: { id: true, title: true, status: true },
        take: 8,
      }),
      prisma.boardResolution.findMany({
        where: { OR: [{ title: ci }, { resolutionNumber: ci }] },
        select: { id: true, title: true, resolutionNumber: true },
        take: 8,
      }),
      prisma.debtCase.findMany({
        where: { debtor: ci },
        select: { id: true, debtor: true, status: true },
        take: 8,
      }),
      prisma.knowledgeItem.findMany({
        where: { title: ci },
        select: { id: true, title: true, type: true },
        take: 8,
      }),
    ]);

  return [
    ...contracts.map((c) => ({
      module: 'contracts',
      moduleLabel: 'Contract management',
      id: c.id,
      title: c.title,
      subtitle: c.counterparty,
      status: c.status,
    })),
    ...opinionRequests.map((o) => ({
      module: 'legal-opinions',
      moduleLabel: 'Legal opinions',
      id: o.id,
      title: o.subject,
      subtitle: null,
      status: o.status,
    })),
    ...cases.map((c) => ({
      module: 'litigation',
      moduleLabel: 'Litigation',
      id: c.id,
      title: c.caseNumber,
      subtitle: c.opposingParty,
      status: c.status,
    })),
    ...mous.map((m) => ({
      module: 'mous',
      moduleLabel: 'MoUs',
      id: m.id,
      title: m.title,
      subtitle: null,
      status: m.status,
    })),
    ...resolutions.map((r) => ({
      module: 'board-resolutions',
      moduleLabel: 'Board resolutions',
      id: r.id,
      title: r.title,
      subtitle: r.resolutionNumber,
      status: null,
    })),
    ...debtCases.map((d) => ({
      module: 'recovery',
      moduleLabel: 'Recovery & debt',
      id: d.id,
      title: d.debtor,
      subtitle: null,
      status: d.status,
    })),
    ...knowledgeItems.map((k) => ({
      module: 'knowledge-base',
      moduleLabel: 'Knowledge base',
      id: k.id,
      title: k.title,
      subtitle: k.type,
      status: null,
    })),
  ];
}

module.exports = { globalSearch };
