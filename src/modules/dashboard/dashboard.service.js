const prisma = require('../../lib/prisma');
const { toNumber } = require('../../shared/number');
const { toRecordDTO } = require('../records/record.service');

function buildDashboardWhereClause(query = {}) {
  const where = { deletedAt: null };
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = query.startDate;
    if (query.endDate) where.date.lte = query.endDate;
  }
  return where;
}

function monthStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getTrendRange(startDate, endDate) {
  const now = new Date();
  const rangeEnd = endDate ? monthStart(endDate) : monthStart(now);
  const rangeStart = startDate ? monthStart(startDate) : new Date(Date.UTC(rangeEnd.getUTCFullYear(), rangeEnd.getUTCMonth() - 5, 1));
  return { rangeStart, rangeEnd };
}

function fillMonthlyGaps(rows, startDate, endDate) {
  const { rangeStart, rangeEnd } = getTrendRange(startDate, endDate);
  const bucket = new Map();

  rows.forEach((row) => {
    const month = monthStart(new Date(row.month)).toISOString().slice(0, 7);
    const income = toNumber(row.income);
    const expense = toNumber(row.expense);
    bucket.set(month, {
      month,
      income,
      expense,
      net: income - expense
    });
  });

  const filled = [];
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    const key = cursor.toISOString().slice(0, 7);
    filled.push(bucket.get(key) || { month: key, income: 0, expense: 0, net: 0 });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return filled;
}

async function getDashboardSummary(query = {}) {
  const where = buildDashboardWhereClause(query);

  const [incomeAgg, expenseAgg, recordsCount, categoryTotals, recentActivity] = await Promise.all([
    prisma.financeRecord.aggregate({ where: { ...where, type: 'INCOME' }, _sum: { amount: true } }),
    prisma.financeRecord.aggregate({ where: { ...where, type: 'EXPENSE' }, _sum: { amount: true } }),
    prisma.financeRecord.count({ where }),
    prisma.financeRecord.groupBy({
      by: ['category', 'type'],
      where,
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.financeRecord.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        deletedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: query.recentLimit || 10
    })
  ]);

  const sqlConditions = ['"deletedAt" IS NULL'];
  const values = [];
  if (query.startDate) {
    values.push(query.startDate);
    sqlConditions.push(`"date" >= $${values.length}`);
  }
  if (query.endDate) {
    values.push(query.endDate);
    sqlConditions.push(`"date" <= $${values.length}`);
  }

  const trendQuery = `
    SELECT DATE_TRUNC('month', "date") AS month,
           COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expense
    FROM "FinanceRecord"
    WHERE ${sqlConditions.join(' AND ')}
    GROUP BY 1
    ORDER BY 1 ASC;
  `;

  const rawTrends = await prisma.$queryRawUnsafe(trendQuery, ...values);

  const totalIncome = toNumber(incomeAgg._sum.amount);
  const totalExpense = toNumber(expenseAgg._sum.amount);

  return {
    filters: {
      startDate: query.startDate || null,
      endDate: query.endDate || null,
      recentLimit: query.recentLimit || 10
    },
    totals: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      recordsCount
    },
    categoryTotals: categoryTotals
      .map((item) => ({
        category: item.category,
        type: item.type,
        total: toNumber(item._sum.amount),
        count: item._count._all
      }))
      .sort((a, b) => b.total - a.total),
    monthlyTrends: fillMonthlyGaps(rawTrends, query.startDate, query.endDate),
    recentActivity: recentActivity.map(toRecordDTO)
  };
}

module.exports = {
  buildDashboardWhereClause,
  getTrendRange,
  fillMonthlyGaps,
  getDashboardSummary
};