"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { DepartmentSummary } from '@/server/models/department';
import { Button } from '@/components/ui/button';

export function DepartmentFilter({ departments }: { departments: DepartmentSummary[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get('dept') ?? '';

  const updateFilter = (nextDept?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDept) {
      params.set('dept', nextDept);
    } else {
      params.delete('dept');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <section className="rounded-[28px] border border-white/10 bg-[color:var(--panel)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">Department filter</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-50">Refine the directory by team</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => updateFilter(undefined)} aria-pressed={selected === ''}>
          Show all
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={selected === '' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => updateFilter(undefined)}
          aria-pressed={selected === ''}
        >
          All departments
        </Button>

        {departments.map((department) => {
          const isSelected = selected === department.slug;

          return (
            <Button
              key={department.id}
              variant={isSelected ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => updateFilter(department.slug)}
              aria-pressed={isSelected}
            >
              <span>{department.name}</span>
              <span className="text-[11px] opacity-70">Floor {department.floor}</span>
              {typeof department.employeeCount === 'number' ? (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-semibold">
                  {department.employeeCount}
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
