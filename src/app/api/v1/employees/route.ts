import { createEmployeeApiSchema } from '@/lib/validation/employee.schema';
import { parseEmployeeListQuery } from '@/lib/validation/query.schema';
import { getAllDepartments } from '@/server/queries/department.queries';
import { getEmployees } from '@/server/queries/employee.queries';
import { employeeDetailToApi, employeeListItemToApi, departmentsToMap } from '@/server/http/mappers';
import { fromError, errorResponse, successResponse } from '@/server/http/response';
import { getAppContext } from '@/server/context';
import { revalidatePath, revalidateTag } from 'next/cache';
import { resolveDepartmentFilter } from '@/server/utils/department-filter';

export const runtime = 'nodejs';

function objectToRecord(source: URLSearchParams) {
  return Object.fromEntries(source.entries()) as Record<string, string | string[] | undefined>;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseEmployeeListQuery(objectToRecord(url.searchParams));
    const needsDepartmentLookup = Boolean(query.dept) || query.expand === 'department';
    const departments = needsDepartmentLookup ? await getAllDepartments() : [];

    let departmentId = query.department_id;

    if (!departmentId && query.dept) {
      const resolution = resolveDepartmentFilter(query.dept, departments);

      if (resolution.unknownFilter) {
        return errorResponse('Department filter not found', 404, 'NOT_FOUND');
      }

      departmentId = resolution.resolvedDepartmentId;
    }

    const finalQuery = {
      ...query,
      department_id: departmentId,
      dept: undefined,
    };

    const employeesResult = await getEmployees(finalQuery);
    const departmentMap = query.expand === 'department' ? departmentsToMap(departments) : new Map();
    const items = employeesResult.items.map((employee) => {
      const withDepartment = departmentMap.get(employee.departmentId);
      return employeeListItemToApi({
        ...employee,
        department: withDepartment ?? employee.department,
      });
    });

    return successResponse(items, 'Employees fetched successfully', 200, employeesResult.meta);
  } catch (error) {
    return fromError(error);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');

    if (!contentType?.includes('application/json')) {
      return errorResponse('Content-Type must be application/json', 415, 'UNSUPPORTED_MEDIA_TYPE');
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 400, 'VALIDATION_ERROR');
    }

    const parsed = createEmployeeApiSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        parsed.error.flatten(),
      );
    }

    const { employeeService } = await getAppContext();
    const employee = await employeeService.createEmployee(parsed.data);

    revalidatePath('/');
    revalidateTag('employees');
    revalidateTag('departments');

    return successResponse(employeeDetailToApi({
      ...employee,
      department: employee.department ?? null,
    }), 'Employee created successfully', 201);
  } catch (error) {
    return fromError(error);
  }
}
