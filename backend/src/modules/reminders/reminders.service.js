const prisma = require('../../db/prisma');

// `scope` controls which reminders come back:
//   'due'      -> remindAt has passed and not yet marked sent (needs attention now)
//   'upcoming' -> remindAt is in the future, within `withinDays`
//   'all'      -> everything, most recent first
async function listReminders({ scope = 'due', withinDays = 30 } = {}) {
  const now = new Date();

  if (scope === 'due') {
    return prisma.reminder.findMany({
      where: { remindAt: { lte: now }, isSent: false },
      orderBy: { remindAt: 'asc' },
    });
  }

  if (scope === 'upcoming') {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + Number(withinDays));
    return prisma.reminder.findMany({
      where: { remindAt: { gt: now, lte: cutoff }, isSent: false },
      orderBy: { remindAt: 'asc' },
    });
  }

  return prisma.reminder.findMany({ orderBy: { remindAt: 'desc' }, take: 200 });
}

async function markSent(id) {
  return prisma.reminder.update({ where: { id: Number(id) }, data: { isSent: true } });
}

module.exports = { listReminders, markSent };
