import { slugify } from '@/lib/formatting/slug';
import type { DepartmentSummary } from '@/server/models/department';
import { isObjectIdLike } from '@/server/utils/ids';

export interface DepartmentFilterResolution {
  matchedDepartment: DepartmentSummary | null;
  resolvedDepartmentId?: string;
  unknownFilter: boolean;
}

export function resolveDepartmentFilter(
  rawValue: string | undefined,
  departments: DepartmentSummary[],
): DepartmentFilterResolution {
  if (!rawValue) {
    return {
      matchedDepartment: null,
      resolvedDepartmentId: undefined,
      unknownFilter: false,
    };
  }

  const normalizedSlug = slugify(rawValue);
  const matchedDepartment = departments.find(
    (department) => department.id === rawValue || department.slug === normalizedSlug,
  ) ?? null;

  if (matchedDepartment) {
    return {
      matchedDepartment,
      resolvedDepartmentId: matchedDepartment.id,
      unknownFilter: false,
    };
  }

  if (isObjectIdLike(rawValue)) {
    return {
      matchedDepartment: null,
      resolvedDepartmentId: rawValue,
      unknownFilter: false,
    };
  }

  return {
    matchedDepartment: null,
    resolvedDepartmentId: undefined,
    unknownFilter: true,
  };
}
