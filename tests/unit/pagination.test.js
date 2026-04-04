const { getPagination } = require('../../src/shared/pagination');

describe('getPagination', () => {
  test('returns defaults when query is empty', () => {
    expect(getPagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  test('caps limit at 100', () => {
    expect(getPagination({ page: 2, limit: 500 })).toEqual({ page: 2, limit: 100, skip: 100 });
  });
});