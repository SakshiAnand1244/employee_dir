import { unstable_cache } from 'next/cache';
import { getAppContext } from '@/server/context';
import type { DepartmentListQuery } from '@/lib/validation/query.schema';

const cachedListDepartments = unstable_cache(
  async (query: DepartmentListQuery) => {
    const { departmentService } = await getAppContext();
    return departmentService.listDepartments(query);
  },
  ['departments:list'],
  {
    revalidate: 60,
    tags: ['departments'],
  },
);

const cachedListAllDepartments = unstable_cache(
  async () => {
    const { departmentService } = await getAppContext();
    return departmentService.listAllDepartments();
  },
  ['departments:all'],
  {
    revalidate: 60,
    tags: ['departments'],
  },
);

export function getDepartments(query: DepartmentListQuery) {
  return cachedListDepartments(query);
}

export function getAllDepartments() {
  return cachedListAllDepartments();
}
