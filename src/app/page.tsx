import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DepartmentFilter } from '@/components/employee/department-filter';
import { AddEmployeeForm } from '@/components/employee/add-employee-form';
import { EmployeeGrid } from '@/components/employee/employee-grid';
import { getAllDepartments } from '@/server/queries/department.queries';
import { getEmployees } from '@/server/queries/employee.queries';
import { attachDepartmentToEmployee, departmentsToMap } from '@/server/http/mappers';
import { coerceEmployeeListQueryForUi } from '@/lib/validation/query.schema';
import type { DepartmentSummary } from '@/server/models/department';
import type { PaginatedResult } from '@/server/models/responses';
import type { EmployeeListItem } from '@/server/models/employee';
import { resolveDepartmentFilter } from '@/server/utils/department-filter';

function formatFilterLabel(department: DepartmentSummary | null, rawValue?: string, resolvedDepartmentId?: string) {
  if (department) {
    return department.name;
  }

  if (rawValue && resolvedDepartmentId) {
    return 'Filtered by department ID';
  }

  if (rawValue) {
    return `Unknown filter: ${rawValue}`;
  }

  return 'All employees';
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { query: parsedQuery, hadInvalidParams } = coerceEmployeeListQueryForUi(resolvedSearchParams);
  const departments = await getAllDepartments();
  const departmentsById = departmentsToMap(departments);
  const rawDepartmentFilter = parsedQuery.department_id ?? parsedQuery.dept;
  const {
    matchedDepartment,
    resolvedDepartmentId,
    unknownFilter,
  } = resolveDepartmentFilter(rawDepartmentFilter, departments);

  const employeesResult: PaginatedResult<EmployeeListItem> = unknownFilter
    ? {
        items: [],
        meta: {
          page: parsedQuery.page,
          size: parsedQuery.size,
          total: 0,
          totalPages: 1,
        },
      }
    : await getEmployees({
        ...parsedQuery,
        department_id: resolvedDepartmentId,
        dept: undefined,
      });

  const employees = employeesResult.items.map((employee) =>
    attachDepartmentToEmployee(employee, departmentsById.get(employee.departmentId)),
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-accent">
              Live directory
            </div>
            <div className="space-y-4">
              <CardTitle className="max-w-2xl text-4xl leading-tight sm:text-5xl">
                High-performance employee directory for the internal operations team.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7">
                Server components render straight from MongoDB, while client interactions stay URL-driven and
                accessible.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Employees" value={employeesResult.meta.total.toString()} />
            <MetricCard label="Departments" value={departments.length.toString()} />
            <MetricCard label="Filter" value={formatFilterLabel(matchedDepartment, rawDepartmentFilter, resolvedDepartmentId)} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Architecture</p>
            <CardTitle className="text-2xl">The page never calls its own API to render the list.</CardTitle>
            <CardDescription>
              The UI reads directly from the backend service layer. APIs exist for integration and testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <Pill>Server Components</Pill>
            <Pill>Server Actions</Pill>
            <Pill>Mongo singleton</Pill>
            <Pill>URL filters</Pill>
            <Pill>Route handlers for API testing</Pill>
          </CardContent>
        </Card>
      </section>

      {hadInvalidParams ? (
        <Card className="border-amber-400/30 bg-amber-400/10">
          <CardContent className="pt-6 text-sm text-amber-100">
            Some URL parameters were invalid, so the page fell back to safe defaults for the unsupported values.
          </CardContent>
        </Card>
      ) : null}

      {unknownFilter ? (
        <Card className="border-amber-400/30 bg-amber-400/10">
          <CardContent className="pt-6 text-sm text-amber-100">
            The filter value <span className="font-semibold">{rawDepartmentFilter}</span> does not match a known
            department, so no employees are shown for that filter.
          </CardContent>
        </Card>
      ) : null}

      <DepartmentFilter departments={departments} />

      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
        <AddEmployeeForm departments={departments} />

        <Card className="overflow-hidden">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Directory</p>
            <CardTitle className="mt-2 text-2xl">Employee cards</CardTitle>
            <CardDescription>
              Basic list data is rendered here, while the detail page uses a `$lookup` to join the department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeGrid employees={employees} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="mr-2 mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
      {children}
    </span>
  );
}
