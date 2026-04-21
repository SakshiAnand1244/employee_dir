import type { Db, Filter, OptionalUnlessRequiredId, Sort } from 'mongodb';
import { COLLECTIONS } from '@/server/db/collections';
import type { EmployeeDocument, EmployeeDetailDocument } from '@/server/models/employee';
import type { EmployeeRepository, CreateEmployeeRepositoryInput } from './employee.repository';
import type { EmployeeListQuery } from '@/lib/validation/query.schema';
import { toObjectId } from '@/server/utils/ids';
import { BadRequestError } from '@/server/models/errors';

function sortForEmployees(sortBy: EmployeeListQuery['sort_by'], sortOrder: EmployeeListQuery['sort_order']): Sort {
  const direction: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'position':
      return { position: direction, name: 1 };
    case 'salary':
      return { salary: direction, name: 1 };
    case 'created_at':
      return { createdAt: direction };
    case 'name':
    default:
      return { name: direction };
  }
}

function buildMatch(query: EmployeeListQuery): Filter<EmployeeDocument> {
  const match: Filter<EmployeeDocument> = {};

  if (query.department_id) {
    match.departmentId = toObjectId(query.department_id);
  }

  if (query.search) {
    match.$text = { $search: query.search };
  }

  if (query.salary_min !== undefined || query.salary_max !== undefined) {
    const salaryFilter: Record<string, number> = {};

    if (query.salary_min !== undefined) {
      salaryFilter.$gte = query.salary_min;
    }

    if (query.salary_max !== undefined) {
      salaryFilter.$lte = query.salary_max;
    }

    if (Object.keys(salaryFilter).length > 0) {
      match.salary = salaryFilter as never;
    }
  }

  return match;
}

export function createMongoEmployeeRepository(db: Db): EmployeeRepository {
  const collection = db.collection<EmployeeDocument>(COLLECTIONS.employees);

  return {
    async list(query) {
      const match = buildMatch(query);
      const total = await collection.countDocuments(match);
      const sort = sortForEmployees(query.sort_by, query.sort_order);
      const skip = (query.page - 1) * query.size;

      const items = await collection
        .find(match)
        .sort(sort)
        .skip(skip)
        .limit(query.size)
        .toArray();

      return {
        items,
        meta: {
          page: query.page,
          size: query.size,
          total,
          totalPages: Math.max(1, Math.ceil(total / query.size)),
        },
      };
    },

    async findById(id) {
      const employeeId = toObjectId(id);
      const document = await collection
        .aggregate<EmployeeDetailDocument>([
          { $match: { _id: employeeId } },
          {
            $lookup: {
              from: COLLECTIONS.departments,
              localField: 'departmentId',
              foreignField: '_id',
              as: 'department',
            },
          },
          {
            $unwind: {
              path: '$department',
              preserveNullAndEmptyArrays: true,
            },
          },
        ])
        .next();

      return document ?? null;
    },

    async insert(input: CreateEmployeeRepositoryInput) {
      if (!input.name || !input.position) {
        throw new BadRequestError('Employee name and position are required');
      }

      const now = new Date();
      const departmentId = toObjectId(input.departmentId);
      const result = await collection.insertOne({
        name: input.name,
        position: input.position,
        salary: input.salary,
        departmentId,
        createdAt: now,
        updatedAt: now,
      } as OptionalUnlessRequiredId<EmployeeDocument>);

      const inserted = await collection.findOne({ _id: result.insertedId });
      if (!inserted) {
        throw new Error('Employee insert succeeded but the record could not be read back');
      }

      return inserted;
    },
  };
}
