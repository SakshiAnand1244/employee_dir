export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ApiPaginationMeta {
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiPaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

export interface ApiDepartmentSummary {
  id: string;
  name: string;
  floor: number;
  slug: string;
  employee_count?: number;
}

export interface ApiEmployeeListItem {
  id: string;
  name: string;
  position: string;
  salary: number;
  department_id: string;
  created_at: string;
  updated_at: string;
  department?: ApiDepartmentSummary | null;
}

export interface ApiEmployeeDetail extends ApiEmployeeListItem {
  department: ApiDepartmentSummary | null;
}
