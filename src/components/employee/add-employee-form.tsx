"use client";

import { useActionState, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { ZodError } from 'zod';
import type { DepartmentSummary } from '@/server/models/department';
import { createEmployeeAction } from '@/server/actions/employee.actions';
import {
  employeeFormSchema,
  initialEmployeeActionState,
  type EmployeeActionState,
} from '@/lib/validation/employee.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

function flattenClientErrors(error: ZodError) {
  const next: EmployeeActionState['fieldErrors'] = {};

  for (const issue of error.issues) {
    const key = issue.path[0] as keyof EmployeeActionState['fieldErrors'] | undefined;
    if (key === 'name' || key === 'position' || key === 'salary' || key === 'departmentId') {
      next[key] = issue.message;
    } else {
      next.form = issue.message;
    }
  }

  return next;
}

export function AddEmployeeForm({ departments }: { departments: DepartmentSummary[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createEmployeeAction, initialEmployeeActionState);
  const [clientErrors, setClientErrors] = useState<EmployeeActionState['fieldErrors']>({});

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setClientErrors({});
    }
  }, [state.success]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const parsed = employeeFormSchema.safeParse({
      name: formData.get('name'),
      position: formData.get('position'),
      salary: formData.get('salary'),
      departmentId: formData.get('departmentId'),
    });

    if (!parsed.success) {
      event.preventDefault();
      setClientErrors(flattenClientErrors(parsed.error));
      return;
    }

    setClientErrors({});
  };

  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const fieldErrors = hasClientErrors ? clientErrors : state.fieldErrors;
  const bannerMessage = hasClientErrors ? 'Please correct the highlighted fields.' : state.message;
  const bannerIsSuccess = state.success && !hasClientErrors;
  const canSubmit = departments.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Add employee</p>
        <CardTitle className="mt-2 text-2xl">Insert a new team member</CardTitle>
        <CardDescription>
          Schema-validated on the client for UX and again in the server action for safety.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {bannerMessage ? (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              bannerIsSuccess
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
            }`}
            aria-live="polite"
          >
            {bannerMessage}
          </div>
        ) : null}

        <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={fieldErrors.name} htmlFor="employee-name" errorId="employee-name-error">
              <Input
                id="employee-name"
                name="name"
                autoComplete="name"
                placeholder="Ananya Sharma"
                required
                minLength={2}
                maxLength={120}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'employee-name-error' : undefined}
              />
            </Field>

            <Field
              label="Position"
              error={fieldErrors.position}
              htmlFor="employee-position"
              errorId="employee-position-error"
            >
              <Input
                id="employee-position"
                name="position"
                autoComplete="organization-title"
                placeholder="Senior Engineer"
                required
                minLength={2}
                maxLength={120}
                aria-invalid={Boolean(fieldErrors.position)}
                aria-describedby={fieldErrors.position ? 'employee-position-error' : undefined}
              />
            </Field>

            <Field label="Salary" error={fieldErrors.salary} htmlFor="employee-salary" errorId="employee-salary-error">
              <Input
                id="employee-salary"
                name="salary"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="125000"
                required
                aria-invalid={Boolean(fieldErrors.salary)}
                aria-describedby={fieldErrors.salary ? 'employee-salary-error' : undefined}
              />
            </Field>

            <Field
              label="Department"
              error={fieldErrors.departmentId}
              htmlFor="employee-department"
              errorId="employee-department-error"
            >
              <Select
                id="employee-department"
                name="departmentId"
                defaultValue=""
                disabled={!canSubmit}
                required
                aria-invalid={Boolean(fieldErrors.departmentId)}
                aria-describedby={fieldErrors.departmentId ? 'employee-department-error' : undefined}
              >
                <option value="" disabled>
                  {departments.length > 0 ? 'Select a department' : 'No departments available'}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} · Floor {department.floor}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {fieldErrors.form ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {fieldErrors.form}
            </div>
          ) : null}

          {!canSubmit ? (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Seed at least one department before creating employees.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="primary" disabled={isPending || !canSubmit}>
              {isPending ? 'Adding employee...' : 'Add employee'}
            </Button>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Server action + revalidatePath(&quot;/&quot;)
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  htmlFor,
  errorId,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  errorId: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="space-y-2">
      <span className="block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {error ? (
        <span id={errorId} className="block text-xs text-rose-300">
          {error}
        </span>
      ) : null}
    </label>
  );
}
