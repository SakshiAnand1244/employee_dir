import type { EmployeeListItem } from '@/server/models/employee';
import { Card } from '@/components/ui/card';
import { EmployeeCard } from './employee-card';

export function EmployeeGrid({ employees }: { employees: EmployeeListItem[] }) {
  if (employees.length === 0) {
    return (
      <Card className="p-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">No results</p>
          <h3 className="text-2xl font-semibold text-slate-50">No employees match this filter</h3>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Try clearing the department filter or add a new employee to grow the directory.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
}
