import type { Db, Filter, Sort } from 'mongodb';
import { COLLECTIONS } from '@/server/db/collections';
import type { DepartmentDocument } from '@/server/models/department';
import type { DepartmentRepository } from './department.repository';
import type { DepartmentListQuery } from '@/lib/validation/query.schema';
import { toObjectId } from '@/server/utils/ids';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sortForDepartments(sortBy: DepartmentListQuery['sort_by'], sortOrder: DepartmentListQuery['sort_order']): Sort {
  const direction: 1 | -1 = sortOrder === 'asc' ? 1 : -1;

  switch (sortBy) {
    case 'floor':
      return { floor: direction, name: 1 };
    case 'created_at':
      return { createdAt: direction };
    case 'name':
    default:
      return { name: direction };
  }
}

function buildMatch(query: DepartmentListQuery): Filter<DepartmentDocument> {
  const match: Filter<DepartmentDocument> = {};

  if (query.search) {
    match.name = { $regex: escapeRegex(query.search), $options: 'i' };
  }

  if (query.floor !== undefined) {
    match.floor = query.floor;
  }

  return match;
}

export function createMongoDepartmentRepository(db: Db): DepartmentRepository {
  const collection = db.collection<DepartmentDocument>(COLLECTIONS.departments);

  return {
    async list(query) {
      const match = buildMatch(query);
      const total = await collection.countDocuments(match);
      const sort = sortForDepartments(query.sort_by, query.sort_order);
      const skip = (query.page - 1) * query.size;

      const pipeline: object[] = [{ $match: match }];

      if (query.include_employee_count) {
        pipeline.push(
          {
            $lookup: {
              from: COLLECTIONS.employees,
              localField: '_id',
              foreignField: 'departmentId',
              as: 'employees',
            },
          },
          {
            $addFields: {
              employeeCount: { $size: '$employees' },
            },
          },
          {
            $project: {
              employees: 0,
            },
          },
        );
      }

      pipeline.push(
        { $sort: sort },
        { $skip: skip },
        { $limit: query.size },
      );

      const items = await collection.aggregate<DepartmentDocument & { employeeCount?: number }>(pipeline).toArray();

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

    async listAll() {
      return collection.find({}).sort({ name: 1 }).toArray();
    },

    async findById(id) {
      return collection.findOne({ _id: toObjectId(id) });
    },
  };
}
