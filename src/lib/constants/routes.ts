export const ROUTES = {
  home: '/',
  employeeDetail: (id: string) => `/employee/${id}`,
} as const;
