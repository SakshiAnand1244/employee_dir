import type { DepartmentRepository } from '@/server/repositories/department.repository';
import type { DepartmentDocument, DepartmentSummary } from '@/server/models/department';
import type { DepartmentListQuery } from '@/lib/validation/query.schema';
import { departmentDocumentToSummary } from '@/server/http/mappers';
import type { PaginatedResult } from '@/server/models/responses';

export interface DepartmentService {
  listDepartments(query: DepartmentListQuery): Promise<PaginatedResult<DepartmentSummary>>;
  listAllDepartments(): Promise<DepartmentSummary[]>;
}

export function createDepartmentService(repository: DepartmentRepository): DepartmentService {
  function map(document: DepartmentDocument & { employeeCount?: number }) {
    return departmentDocumentToSummary(document, document.employeeCount);
  }

  return {
    async listDepartments(query) {
      const result = await repository.list(query);

      return {
        items: result.items.map((item) => map(item)),
        meta: result.meta,
      };
    },

    async listAllDepartments() {
      const departments = await repository.listAll();
      return departments.map((department) => map(department));
    },
  };
}
