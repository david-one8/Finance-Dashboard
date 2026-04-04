const { UserRole, UserStatus, FinanceType } = require('@prisma/client');

module.exports = {
  UserRole,
  UserStatus,
  FinanceType,
  ROLE_HIERARCHY: {
    VIEWER: 1,
    ANALYST: 2,
    ADMIN: 3
  }
};