import type { DepartmentDocument, DepartmentSummary } from '@/server/models/department';
import type { EmployeeDetailDocument, EmployeeDocument, EmployeeDetail, EmployeeListItem } from '@/server/models/employee';
import { slugify } from '@/lib/formatting/slug';
import type {
  ApiDepartmentSummary,
  ApiEmployeeDetail,
  ApiEmployeeListItem,
} from '@/server/models/responses';

export function departmentDocumentToSummary(
  document: DepartmentDocument,
  employeeCount?: number,
): DepartmentSummary {
  return {
    id: document._id.toHexString(),
    name: document.name,
    floor: document.floor,
    slug: slugify(document.name),
    ...(typeof employeeCount === 'number' ? { employeeCount } : {}),
  };
}

export function employeeDocumentToSummary(document: EmployeeDocument): EmployeeListItem {
  return {
    id: document._id.toHexString(),
    name: document.name,
    position: document.position,
    salary: document.salary,
    departmentId: document.departmentId.toHexString(),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export function employeeDetailDocumentToSummary(document: EmployeeDetailDocument): EmployeeDetail {
  const base = employeeDocumentToSummary(document);

  return {
    ...base,
    department: document.department ? departmentDocumentToSummary(document.department) : null,
  };
}

export function attachDepartmentToEmployee(
  employee: EmployeeListItem,
  department?: DepartmentSummary | null,
): EmployeeListItem {
  if (!department) {
    return employee;
  }

  return {
    ...employee,
    department,
  };
}

export function departmentsToMap(departments: DepartmentSummary[]) {
  return new Map(departments.map((department) => [department.id, department] as const));
}

export function departmentSummaryToApi(department: DepartmentSummary): ApiDepartmentSummary {
  return {
    id: department.id,
    name: department.name,
    floor: department.floor,
    slug: department.slug,
    ...(department.employeeCount !== undefined ? { employee_count: department.employeeCount } : {}),
  };
}

export function employeeListItemToApi(employee: EmployeeListItem): ApiEmployeeListItem {
  return {
    id: employee.id,
    name: employee.name,
    position: employee.position,
    salary: employee.salary,
    department_id: employee.departmentId,
    created_at: employee.createdAt,
    updated_at: employee.updatedAt,
    ...(employee.department ? { department: departmentSummaryToApi(employee.department) } : {}),
  };
}

export function employeeDetailToApi(employee: EmployeeDetail): ApiEmployeeDetail {
  return {
    ...employeeListItemToApi(employee),
    department: employee.department ? departmentSummaryToApi(employee.department) : null,
  };
}
