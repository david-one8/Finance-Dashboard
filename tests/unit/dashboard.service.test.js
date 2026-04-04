const { fillMonthlyGaps, getTrendRange, buildDashboardWhereClause } = require('../../src/modules/dashboard/dashboard.service');

describe('dashboard service helpers', () => {
  test('buildDashboardWhereClause sets soft-delete filter by default', () => {
    const where = buildDashboardWhereClause({});
    expect(where).toEqual({ deletedAt: null });
  });

  test('fillMonthlyGaps fills missing months and calculates net', () => {
    const rows = [
      { month: new Date('2026-01-01T00:00:00Z'), income: '1000', expense: '300' },
      { month: new Date('2026-03-01T00:00:00Z'), income: '200', expense: '500' }
    ];

    const result = fillMonthlyGaps(rows, new Date('2026-01-02'), new Date('2026-03-20'));
    expect(result).toEqual([
      { month: '2026-01', income: 1000, expense: 300, net: 700 },
      { month: '2026-02', income: 0, expense: 0, net: 0 },
      { month: '2026-03', income: 200, expense: 500, net: -300 }
    ]);
  });

  test('getTrendRange defaults to a six-month window when no dates are provided', () => {
    const { rangeStart, rangeEnd } = getTrendRange();
    expect(rangeStart.getUTCDate()).toBe(1);
    expect(rangeEnd.getUTCDate()).toBe(1);
  });
});