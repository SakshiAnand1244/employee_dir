import { z } from 'zod';
import { OBJECT_ID_PATTERN } from '@/lib/validation/object-id';

export const employeeFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(120),
  position: z.string().trim().min(2, 'Position must be at least 2 characters long').max(120),
  salary: z.coerce.number().positive('Salary must be greater than 0').max(100000000),
  departmentId: z
    .string()
    .trim()
    .min(1, 'Please select a department')
    .regex(OBJECT_ID_PATTERN, 'Please select a valid department'),
});

export const createEmployeeApiSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(120),
  position: z.string().trim().min(2, 'Position must be at least 2 characters long').max(120),
  salary: z.coerce.number().positive('Salary must be greater than 0').max(100000000),
  department_id: z
    .string()
    .trim()
    .min(1, 'department_id is required')
    .regex(OBJECT_ID_PATTERN, 'department_id must be a valid MongoDB ObjectId'),
}).transform((value) => ({
  name: value.name,
  position: value.position,
  salary: value.salary,
  departmentId: value.department_id,
}));

export interface EmployeeActionState {
  success: boolean;
  message: string | null;
  fieldErrors: Partial<Record<'name' | 'position' | 'salary' | 'departmentId' | 'form', string>>;
}

export const initialEmployeeActionState: EmployeeActionState = {
  success: false,
  message: null,
  fieldErrors: {},
};

export type EmployeeFormInput = z.infer<typeof employeeFormSchema>;
export type CreateEmployeeApiInput = z.infer<typeof createEmployeeApiSchema>;
