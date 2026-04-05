const { buildRecordWhereClause } = require('../../src/modules/records/record.service');
const { UserRole } = require('../../src/config/roles');

describe('buildRecordWhereClause', () => {
  test('hides deleted records for analyst even if includeDeleted is true', () => {
    const where = buildRecordWhereClause({ includeDeleted: true }, UserRole.ANALYST);
    expect(where.deletedAt).toBeNull();
  });

  test('builds search and date filters correctly', () => {
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-01-31');
    const where = buildRecordWhereClause({
      search: 'rent',
      type: 'EXPENSE',
      category: 'housing',
      startDate,
      endDate
    }, UserRole.ADMIN);

    expect(where.type).toBe('EXPENSE');
    expect(where.category).toEqual({ contains: 'housing', mode: 'insensitive' });
    expect(where.date).toEqual({ gte: startDate, lte: endDate });
    expect(where.OR).toHaveLength(2);
    expect(where.deletedAt).toBeNull();
  });

  test('allows admins to include deleted records explicitly', () => {
    const where = buildRecordWhereClause({ includeDeleted: true }, UserRole.ADMIN);
    expect(where.deletedAt).toBeUndefined();
  });
});
