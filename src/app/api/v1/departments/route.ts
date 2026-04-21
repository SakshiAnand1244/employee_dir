import { parseDepartmentListQuery } from '@/lib/validation/query.schema';
import { getDepartments } from '@/server/queries/department.queries';
import { departmentSummaryToApi } from '@/server/http/mappers';
import { fromError, successResponse } from '@/server/http/response';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const query = parseDepartmentListQuery(
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    const result = await getDepartments(query);

    return successResponse(
      result.items.map((department) => departmentSummaryToApi(department)),
      'Departments fetched successfully',
      200,
      result.meta,
    );
  } catch (error) {
    return fromError(error);
  }
}
