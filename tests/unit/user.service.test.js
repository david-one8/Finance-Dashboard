describe('userService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('buildUserWhereClause combines role, status, and search filters', () => {
    const { buildUserWhereClause } = require('../../src/modules/users/user.service');

    expect(buildUserWhereClause({
      role: 'ADMIN',
      status: 'ACTIVE',
      search: 'sam'
    })).toEqual({
      role: 'ADMIN',
      status: 'ACTIVE',
      OR: [
        { name: { contains: 'sam', mode: 'insensitive' } },
        { email: { contains: 'sam', mode: 'insensitive' } }
      ]
    });
  });

  test('updateUser hashes a new password before saving', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce({
        id: 'user-1',
        name: 'Existing User',
        email: 'old@example.com'
      })
      .mockResolvedValueOnce(null);
    const update = jest.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Updated User',
      email: 'new@example.com',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    const hash = jest.fn().mockResolvedValue('hashed-password');

    jest.doMock('../../src/lib/prisma', () => ({
      user: {
        findUnique,
        update
      }
    }));
    jest.doMock('../../src/config/env', () => ({
      BCRYPT_ROUNDS: 12
    }));
    jest.doMock('bcryptjs', () => ({
      hash
    }));
    jest.doMock('../../src/modules/auth/auth.service', () => ({
      sanitizeUser: jest.fn((user) => user)
    }));

    const userService = require('../../src/modules/users/user.service');

    const result = await userService.updateUser('user-1', {
      email: 'new@example.com',
      password: 'Password@123',
      name: 'Updated User'
    });

    expect(hash).toHaveBeenCalledWith('Password@123', 12);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'new@example.com',
        name: 'Updated User',
        passwordHash: 'hashed-password'
      }
    });
    expect(result).toEqual({
      id: 'user-1',
      name: 'Updated User',
      email: 'new@example.com',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
  });
});
