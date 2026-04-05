const { listRecordsQuerySchema } = require('../../src/modules/records/record.validation');

describe('listRecordsQuerySchema', () => {
  test('treats includeDeleted=false as false', () => {
    const result = listRecordsQuerySchema.parse({ includeDeleted: 'false' });
    expect(result.includeDeleted).toBe(false);
  });

  test('treats includeDeleted=true as true', () => {
    const result = listRecordsQuerySchema.parse({ includeDeleted: 'true' });
    expect(result.includeDeleted).toBe(true);
  });
});
