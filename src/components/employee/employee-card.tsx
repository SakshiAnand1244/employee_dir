import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { formatCurrency } from '@/lib/formatting/currency';
import type { EmployeeListItem } from '@/server/models/employee';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function EmployeeCard({ employee }: { employee: EmployeeListItem }) {
  const departmentName = employee.department?.name ?? 'Unassigned';
  const departmentFloor = employee.department?.floor ?? '—';

  return (
    <Card className="group h-full overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Employee</p>
            <CardTitle className="mt-2 text-2xl truncate">{employee.name}</CardTitle>
            <CardDescription className="truncate">{employee.position}</CardDescription>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Salary</p>
            <p className="mt-2 text-lg font-semibold text-slate-50">{formatCurrency(employee.salary)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
            {departmentName}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200">
            Floor {departmentFloor}
          </span>
        </div>
        <p className="text-sm leading-6 text-slate-400">
          Added {new Date(employee.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500 truncate max-w-[100%] sm:max-w-[45%]">
          {employee.department?.slug.toUpperCase() ?? 'UNASSIGNED'}
        </span>
        <Link
          href={ROUTES.employeeDetail(employee.id)}
          className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 w-full sm:w-auto justify-center"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
