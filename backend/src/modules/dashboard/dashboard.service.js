const prisma = require('../../db/prisma');

const HIGH_RISK_THRESHOLD = 50000000; // NGN 50,000,000 — adjust to REA's real risk threshold

async function getActiveContracts() {
  const contracts = await prisma.contract.findMany({
    where: { status: 'active' },
    select: { id: true, title: true, counterparty: true, endDate: true },
  });
  return { count: contracts.length, contracts };
}

async function getExpiringContracts(withinDays = 30) {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + withinDays);

  const contracts = await prisma.contract.findMany({
    where: {
      status: 'active',
      endDate: { gte: now, lte: cutoff },
    },
    select: { id: true, title: true, counterparty: true, endDate: true },
    orderBy: { endDate: 'asc' },
  });
  return { count: contracts.length, withinDays, contracts };
}

async function getPendingLegalOpinions() {
  const pendingStatuses = ['submitted', 'assigned', 'drafting', 'in_review'];
  const requests = await prisma.legalOpinionRequest.findMany({
    where: { status: { in: pendingStatuses } },
    select: { id: true, subject: true, priority: true, status: true },
  });
  return { count: requests.length, requests };
}

async function getCourtCases() {
  const openStatuses = ['open', 'in_progress'];
  const cases = await prisma.litigationCase.findMany({
    where: { status: { in: openStatuses } },
    select: { id: true, caseNumber: true, court: true, status: true, financialExposure: true },
  });
  const totalExposure = cases.reduce((sum, c) => sum + Number(c.financialExposure || 0), 0);
  return { openCount: cases.length, totalExposure, cases };
}

async function getHighRiskLitigation() {
  const cases = await prisma.litigationCase.findMany({
    where: {
      status: { in: ['open', 'in_progress'] },
      financialExposure: { gte: HIGH_RISK_THRESHOLD },
    },
    select: { id: true, caseNumber: true, opposingParty: true, financialExposure: true, status: true },
    orderBy: { financialExposure: 'desc' },
  });
  return { threshold: HIGH_RISK_THRESHOLD, count: cases.length, cases };
}

async function getComplianceScore() {
  const total = await prisma.complianceObligation.count();
  const compliant = await prisma.complianceObligation.count({ where: { status: 'compliant' } });
  const overdue = await prisma.complianceObligation.count({ where: { status: { in: ['overdue', 'non_compliant'] } } });
  const score = total === 0 ? null : Math.round((compliant / total) * 100);
  return { score, total, compliant, overdue };
}

async function getMonthlyPerformance() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    contractsCreated,
    contractsExecuted,
    opinionsCompleted,
    casesResolved,
    mousApproved,
    paymentsThisMonth,
  ] = await Promise.all([
    prisma.contract.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.contract.count({ where: { status: 'executed', updatedAt: { gte: startOfMonth } } }),
    prisma.legalOpinion.count({ where: { status: 'approved', updatedAt: { gte: startOfMonth } } }),
    prisma.litigationCase.count({ where: { status: 'judgment_entered', updatedAt: { gte: startOfMonth } } }),
    prisma.mou.count({ where: { status: 'approved', updatedAt: { gte: startOfMonth } } }),
    prisma.debtPayment.aggregate({
      where: { paymentDate: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  return {
    month: startOfMonth.toISOString().slice(0, 7),
    contractsCreated,
    contractsExecuted,
    opinionsCompleted,
    casesResolved,
    mousApproved,
    debtRecoveredThisMonth: Number(paymentsThisMonth._sum.amount || 0),
  };
}

async function getDashboardSummary() {
  const [
    activeContracts,
    expiringContracts,
    pendingOpinions,
    courtCases,
    highRiskLitigation,
    complianceScore,
    monthlyPerformance,
  ] = await Promise.all([
    getActiveContracts(),
    getExpiringContracts(),
    getPendingLegalOpinions(),
    getCourtCases(),
    getHighRiskLitigation(),
    getComplianceScore(),
    getMonthlyPerformance(),
  ]);

  return {
    activeContracts,
    expiringContracts,
    pendingOpinions,
    courtCases,
    highRiskLitigation,
    complianceScore,
    monthlyPerformance,
  };
}

module.exports = {
  getActiveContracts,
  getExpiringContracts,
  getPendingLegalOpinions,
  getCourtCases,
  getHighRiskLitigation,
  getComplianceScore,
  getMonthlyPerformance,
  getDashboardSummary,
};
