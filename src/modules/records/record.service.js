const prisma = require('../../lib/prisma');
const ApiError = require('../../shared/ApiError');
const { getPagination } = require('../../shared/pagination');
const { toNumber } = require('../../shared/number');
const { UserRole } = require('../../config/roles');

function buildRecordWhereClause(query = {}, currentUserRole = UserRole.ADMIN) {
  const where = {};

  if (!query.includeDeleted || currentUserRole !== UserRole.ADMIN) {
    where.deletedAt = null;
  }

  if (query.type) where.type = query.type;
  if (query.category) {
    where.category = { contains: query.category, mode: 'insensitive' };
  }
  if (query.search) {
    where.OR = [
      { category: { contains: query.search, mode: 'insensitive' } },
      { notes: { contains: query.search, mode: 'insensitive' } }
    ];
  }
  if (query.startDate || query.endDate) {
    where.date = {};
    if (query.startDate) where.date.gte = query.startDate;
    if (query.endDate) where.date.lte = query.endDate;
  }

  return where;
}

function toRecordDTO(record) {
  return {
    id: record.id,
    amount: toNumber(record.amount),
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy ? {
      id: record.createdBy.id,
      name: record.createdBy.name,
      email: record.createdBy.email
    } : undefined,
    updatedBy: record.updatedBy ? {
      id: record.updatedBy.id,
      name: record.updatedBy.name,
      email: record.updatedBy.email
    } : undefined,
    deletedBy: record.deletedBy ? {
      id: record.deletedBy.id,
      name: record.deletedBy.name,
      email: record.deletedBy.email
    } : undefined
  };
}

async function createRecord(payload, currentUser) {
  const record = await prisma.financeRecord.create({
    data: {
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      date: payload.date,
      notes: payload.notes,
      createdById: currentUser.id,
      updatedById: currentUser.id
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
      deletedBy: { select: { id: true, name: true, email: true } }
    }
  });

  return toRecordDTO(record);
}

async function listRecords(query, currentUser) {
  const { page, limit, skip } = getPagination(query);
  const where = buildRecordWhereClause(query, currentUser.role);

  const [items, total] = await prisma.$transaction([
    prisma.financeRecord.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        deletedBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    }),
    prisma.financeRecord.count({ where })
  ]);

  return {
    items: items.map(toRecordDTO),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

async function getRecordById(id, currentUser) {
  const record = await prisma.financeRecord.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
      deletedBy: { select: { id: true, name: true, email: true } }
    }
  });

  if (!record) {
    throw new ApiError(404, 'Record not found');
  }

  if (record.deletedAt && currentUser.role !== UserRole.ADMIN) {
    throw new ApiError(404, 'Record not found');
  }

  return toRecordDTO(record);
}

async function updateRecord(id, payload, currentUser) {
  const existing = await prisma.financeRecord.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new ApiError(404, 'Active record not found');
  }

  const record = await prisma.financeRecord.update({
    where: { id },
    data: {
      ...payload,
      updatedById: currentUser.id
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
      deletedBy: { select: { id: true, name: true, email: true } }
    }
  });

  return toRecordDTO(record);
}

async function softDeleteRecord(id, currentUser) {
  const existing = await prisma.financeRecord.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Record not found');
  }
  if (existing.deletedAt) {
    throw new ApiError(409, 'Record is already deleted');
  }

  const record = await prisma.financeRecord.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedById: currentUser.id,
      updatedById: currentUser.id
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      updatedBy: { select: { id: true, name: true, email: true } },
      deletedBy: { select: { id: true, name: true, email: true } }
    }
  });

  return toRecordDTO(record);
}

module.exports = {
  buildRecordWhereClause,
  toRecordDTO,
  createRecord,
  listRecords,
  getRecordById,
  updateRecord,
  softDeleteRecord
};