"use server";

import { revalidatePath, revalidateTag } from 'next/cache';
import type { ZodError } from 'zod';
import { employeeFormSchema, initialEmployeeActionState, type EmployeeActionState } from '@/lib/validation/employee.schema';
import { getAppContext } from '@/server/context';
import { isAppError } from '@/server/models/errors';

function flattenZodError(error: ZodError) {
  const fieldErrors: EmployeeActionState['fieldErrors'] = {};

  for (const issue of error.issues) {
    const key = issue.path[0] as keyof EmployeeActionState['fieldErrors'] | undefined;
    if (key === 'name' || key === 'position' || key === 'salary' || key === 'departmentId') {
      fieldErrors[key] = issue.message;
    } else {
      fieldErrors.form = issue.message;
    }
  }

  return fieldErrors;
}

export async function createEmployeeAction(
  _previousState: EmployeeActionState = initialEmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  const raw = {
    name: formData.get('name'),
    position: formData.get('position'),
    salary: formData.get('salary'),
    departmentId: formData.get('departmentId'),
  };

  const parsed = employeeFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the highlighted fields.',
      fieldErrors: flattenZodError(parsed.error),
    };
  }

  try {
    const { employeeService } = await getAppContext();
    await employeeService.createEmployee(parsed.data);
    revalidatePath('/');
    revalidateTag('employees');
    revalidateTag('departments');

    return {
      success: true,
      message: 'Employee added successfully.',
      fieldErrors: {},
    };
  } catch (error) {
    if (isAppError(error)) {
      const message = error.statusCode >= 500
        ? 'Unable to create employee right now. Please try again.'
        : error.message;

      return {
        success: false,
        message,
        fieldErrors: { form: message },
      };
    }

    console.error('Unexpected createEmployeeAction failure', error);

    return {
      success: false,
      message: 'Unable to create employee right now. Please try again.',
      fieldErrors: {
        form: 'Unable to create employee right now. Please try again.',
      },
    };
  }
}
