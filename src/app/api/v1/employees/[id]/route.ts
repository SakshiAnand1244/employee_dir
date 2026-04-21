import { getEmployeeById } from '@/server/queries/employee.queries';
import { employeeDetailToApi } from '@/server/http/mappers';
import { fromError, successResponse } from '@/server/http/response';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const employee = await getEmployeeById(resolvedParams.id);

    return successResponse(employeeDetailToApi(employee), 'Employee fetched successfully');
  } catch (error) {
    return fromError(error);
  }
}
