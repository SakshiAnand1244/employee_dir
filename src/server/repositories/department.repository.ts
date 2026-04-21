import type { DepartmentDocument } from '@/server/models/department';
import type { DepartmentListQuery } from '@/lib/validation/query.schema';
import type { PaginatedResult } from '@/server/models/responses';

export interface DepartmentRepository {
  list(query: DepartmentListQuery): Promise<PaginatedResult<DepartmentDocument & { employeeCount?: number }>>;
  listAll(): Promise<DepartmentDocument[]>;
  findById(id: string): Promise<DepartmentDocument | null>;
}
