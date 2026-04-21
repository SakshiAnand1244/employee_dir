import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { formatCurrency } from '@/lib/formatting/currency';
import { getEmployeeById } from '@/server/queries/employee.queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { NotFoundError } from '@/server/models/errors';
import { isObjectIdLike } from '@/server/utils/ids';

export default async function EmployeeDetailPage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const resolvedParams = (await params) ?? { id: '' };

  if (!isObjectIdLike(resolvedParams.id)) {
    notFound();
  }

  try {
    const employee = await getEmployeeById(resolvedParams.id);

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link href={ROUTES.home} className="text-sm text-sky-300 underline-offset-4 hover:underline">
            ← Back to directory
          </Link>
          <span className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">
            Employee detail
          </span>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Profile</p>
            <CardTitle className="text-4xl">{employee.name}</CardTitle>
            <CardDescription className="text-base">
              {employee.position} · Added on{' '}
              {new Date(employee.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-5 md:grid-cols-2">
            <DetailPanel label="Salary" value={formatCurrency(employee.salary)} />
            <DetailPanel label="Department" value={employee.department?.name ?? 'Department unavailable'} />
            <DetailPanel label="Floor" value={employee.department ? `Floor ${employee.department.floor}` : '—'} />
            <DetailPanel label="Department ID" value={employee.departmentId} mono />
            <DetailPanel label="Record ID" value={employee.id} mono />
            <DetailPanel
              label="Last updated"
              value={new Date(employee.updatedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}

function DetailPanel({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
      <p className={`mt-3 text-lg text-slate-50 ${mono ? 'font-mono text-sm break-all' : 'font-semibold'}`}>
        {value}
      </p>
    </div>
  );
}
