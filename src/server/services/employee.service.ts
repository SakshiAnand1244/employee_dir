import type { DepartmentRepository } from '@/server/repositories/department.repository';
import type { EmployeeRepository, CreateEmployeeRepositoryInput } from '@/server/repositories/employee.repository';
import type { EmployeeDetail, EmployeeListItem } from '@/server/models/employee';
import type { EmployeeListQuery } from '@/lib/validation/query.schema';
import type { PaginatedResult } from '@/server/models/responses';
import {
  attachDepartmentToEmployee,
  departmentDocumentToSummary,
  employeeDetailDocumentToSummary,
  employeeDocumentToSummary,
} from '@/server/http/mappers';
import { NotFoundError } from '@/server/models/errors';

export interface EmployeeService {
  listEmployees(query: EmployeeListQuery): Promise<PaginatedResult<EmployeeListItem>>;
  getEmployeeById(id: string): Promise<EmployeeDetail>;
  createEmployee(input: CreateEmployeeRepositoryInput): Promise<EmployeeListItem>;
}

export function createEmployeeService(
  employeeRepository: EmployeeRepository,
  departmentRepository: DepartmentRepository,
): EmployeeService {
  return {
    async listEmployees(query) {
      const result = await employeeRepository.list(query);
      const items = result.items.map((employee) => employeeDocumentToSummary(employee));

      return {
        items,
        meta: result.meta,
      };
    },

    async getEmployeeById(id) {
      const employee = await employeeRepository.findById(id);
      if (!employee) {
        throw new NotFoundError(`Employee not found: ${id}`);
      }

      return employeeDetailDocumentToSummary(employee);
    },

    async createEmployee(input) {
      const department = await departmentRepository.findById(input.departmentId);
      if (!department) {
        throw new NotFoundError(`Department not found: ${input.departmentId}`);
      }

      const created = await employeeRepository.insert(input);
      const summary = employeeDocumentToSummary(created);

      return attachDepartmentToEmployee(summary, departmentDocumentToSummary(department));
    },
  };
}
