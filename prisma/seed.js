const bcrypt = require('bcryptjs');
const { PrismaClient, UserRole, UserStatus, FinanceType } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();
const prisma = new PrismaClient();

async function upsertUser({ email, name, password, role }) {
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role, status: UserStatus.ACTIVE },
    create: { name, email, passwordHash, role, status: UserStatus.ACTIVE }
  });
}

async function main() {
  const admin = await upsertUser({
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    name: 'System Admin',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    role: UserRole.ADMIN
  });

  const analyst = await upsertUser({
    email: process.env.SEED_ANALYST_EMAIL || 'analyst@example.com',
    name: 'Finance Analyst',
    password: process.env.SEED_ANALYST_PASSWORD || 'Analyst@12345',
    role: UserRole.ANALYST
  });

  await upsertUser({
    email: process.env.SEED_VIEWER_EMAIL || 'viewer@example.com',
    name: 'Dashboard Viewer',
    password: process.env.SEED_VIEWER_PASSWORD || 'Viewer@12345',
    role: UserRole.VIEWER
  });

  await prisma.financeRecord.deleteMany({});

  const seedRecords = [
    [125000, FinanceType.INCOME, 'Salary', '2026-01-03', 'January salary'],
    [5400, FinanceType.EXPENSE, 'Rent', '2026-01-04', 'Office rent'],
    [1800, FinanceType.EXPENSE, 'Software', '2026-01-07', 'Productivity tools'],
    [8800, FinanceType.INCOME, 'Consulting', '2026-02-10', 'Advisory engagement'],
    [2100, FinanceType.EXPENSE, 'Travel', '2026-02-18', 'Client meeting travel'],
    [6400, FinanceType.EXPENSE, 'Marketing', '2026-03-05', 'Campaign spend'],
    [9500, FinanceType.INCOME, 'Freelance', '2026-03-11', 'Freelance payout'],
    [2600, FinanceType.EXPENSE, 'Utilities', '2026-03-13', 'Internet and power'],
    [143000, FinanceType.INCOME, 'Salary', '2026-04-01', 'April salary'],
    [3100, FinanceType.EXPENSE, 'Operations', '2026-04-02', 'Operational costs']
  ];

  for (const [amount, type, category, date, notes] of seedRecords) {
    await prisma.financeRecord.create({
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        notes,
        createdById: admin.id,
        updatedById: analyst.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });