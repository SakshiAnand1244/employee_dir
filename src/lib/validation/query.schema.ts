import { z } from 'zod';
import { OBJECT_ID_PATTERN } from '@/lib/validation/object-id';

const employeeSortFields = ['name', 'position', 'salary', 'created_at'] as const;
const departmentSortFields = ['name', 'floor', 'created_at'] as const;

function pickFirst(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function cleanString(value: string | string[] | undefined) {
  const picked = pickFirst(value)?.trim();
  return picked && picked.length > 0 ? picked : undefined;
}

function cleanBoolean(value: string | string[] | undefined) {
  const picked = pickFirst(value)?.trim().toLowerCase();
  return picked === '1' || picked === 'true' || picked === 'yes' || picked === 'on';
}

function cleanNumber(value: string | string[] | undefined) {
  const picked = cleanString(value);
  return picked === undefined ? undefined : picked;
}

function normalizeEmployeeQuery(source: Record<string, string | string[] | undefined>) {
  return {
    page: cleanNumber(source.page),
    size: cleanNumber(source.size),
    search: cleanString(source.search),
    department_id: cleanString(source.department_id),
    dept: cleanString(source.dept),
    salary_min: cleanNumber(source.salary_min),
    salary_max: cleanNumber(source.salary_max),
    sort_by: cleanString(source.sort_by),
    sort_order: cleanString(source.sort_order),
    expand: cleanString(source.expand),
  };
}

function normalizeDepartmentQuery(source: Record<string, string | string[] | undefined>) {
  return {
    page: cleanNumber(source.page),
    size: cleanNumber(source.size),
    search: cleanString(source.search),
    floor: cleanNumber(source.floor),
    sort_by: cleanString(source.sort_by),
    sort_order: cleanString(source.sort_order),
    include_employee_count: cleanBoolean(source.include_employee_count),
  };
}

const employeeListQueryUiSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  size: z.coerce.number().int().min(1).max(100).catch(12),
  search: z.string().trim().min(1).max(120).optional().catch(undefined),
  department_id: z.string().trim().regex(OBJECT_ID_PATTERN, 'department_id must be a valid MongoDB ObjectId').optional().catch(undefined),
  dept: z.string().trim().min(1).max(120).optional().catch(undefined),
  salary_min: z.coerce.number().min(0).optional().catch(undefined),
  salary_max: z.coerce.number().min(0).optional().catch(undefined),
  sort_by: z.enum(employeeSortFields).catch('name'),
  sort_order: z.enum(['asc', 'desc']).catch('asc'),
  expand: z.enum(['department']).optional().catch(undefined),
});

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().trim().min(1).max(120).optional(),
  department_id: z.string().trim().regex(OBJECT_ID_PATTERN, 'department_id must be a valid MongoDB ObjectId').optional(),
  dept: z.string().trim().min(1).max(120).optional(),
  salary_min: z.coerce.number().min(0).optional(),
  salary_max: z.coerce.number().min(0).optional(),
  sort_by: z.enum(employeeSortFields).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  expand: z.enum(['department']).optional(),
}).superRefine((value, context) => {
  if (value.salary_min !== undefined && value.salary_max !== undefined && value.salary_min > value.salary_max) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'salary_min cannot be greater than salary_max',
      path: ['salary_min'],
    });
  }
});

export const departmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(120).optional(),
  floor: z.coerce.number().int().min(0).optional(),
  sort_by: z.enum(departmentSortFields).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  include_employee_count: z.boolean().default(false),
});

export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
export type DepartmentListQuery = z.infer<typeof departmentListQuerySchema>;

export function parseEmployeeListQuery(source: Record<string, string | string[] | undefined>) {
  return employeeListQuerySchema.parse(normalizeEmployeeQuery(source));
}

export function parseDepartmentListQuery(source: Record<string, string | string[] | undefined>) {
  return departmentListQuerySchema.parse(normalizeDepartmentQuery(source));
}

export function coerceEmployeeListQueryForUi(source: Record<string, string | string[] | undefined>) {
  const normalized = normalizeEmployeeQuery(source);
  const strictResult = employeeListQuerySchema.safeParse(normalized);
  const query = employeeListQueryUiSchema.parse(normalized);
  const hasInvalidSalaryRange = (
    query.salary_min !== undefined &&
    query.salary_max !== undefined &&
    query.salary_min > query.salary_max
  );

  return {
    query: hasInvalidSalaryRange
      ? {
          ...query,
          salary_min: undefined,
          salary_max: undefined,
        }
      : query,
    hadInvalidParams: !strictResult.success || hasInvalidSalaryRange,
  };
}
