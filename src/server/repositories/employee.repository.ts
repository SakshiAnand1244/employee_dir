import type { EmployeeDocument, EmployeeDetailDocument } from '@/server/models/employee';
import type { EmployeeListQuery } from '@/lib/validation/query.schema';
import type { PaginatedResult } from '@/server/models/responses';

export interface CreateEmployeeRepositoryInput {
  name: string;
  position: string;
  salary: number;
  departmentId: string;
}

export interface EmployeeRepository {
  list(query: EmployeeListQuery): Promise<PaginatedResult<EmployeeDocument>>;
  findById(id: string): Promise<EmployeeDetailDocument | null>;
  insert(input: CreateEmployeeRepositoryInput): Promise<EmployeeDocument>;
}
