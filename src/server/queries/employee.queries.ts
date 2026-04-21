import { unstable_cache } from 'next/cache';
import { getAppContext } from '@/server/context';
import type { EmployeeListQuery } from '@/lib/validation/query.schema';

const cachedListEmployees = unstable_cache(
  async (query: EmployeeListQuery) => {
    const { employeeService } = await getAppContext();
    return employeeService.listEmployees(query);
  },
  ['employees:list'],
  {
    revalidate: 60,
    tags: ['employees'],
  },
);

const cachedGetEmployeeById = unstable_cache(
  async (id: string) => {
    const { employeeService } = await getAppContext();
    return employeeService.getEmployeeById(id);
  },
  ['employees:detail'],
  {
    revalidate: 60,
    tags: ['employees'],
  },
);

export function getEmployees(query: EmployeeListQuery) {
  return cachedListEmployees(query);
}

export function getEmployeeById(id: string) {
  return cachedGetEmployeeById(id);
}
