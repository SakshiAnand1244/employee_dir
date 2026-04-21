import type { Db } from 'mongodb';
import { getMongoDatabase } from '@/server/db/mongodb';
import { createMongoDepartmentRepository } from '@/server/repositories/department.repository.mongo';
import { createMongoEmployeeRepository } from '@/server/repositories/employee.repository.mongo';
import { createDepartmentService, type DepartmentService } from '@/server/services/department.service';
import { createEmployeeService, type EmployeeService } from '@/server/services/employee.service';
import type { DepartmentRepository } from '@/server/repositories/department.repository';
import type { EmployeeRepository } from '@/server/repositories/employee.repository';

export interface AppContext {
  db: Db;
  departmentRepository: DepartmentRepository;
  employeeRepository: EmployeeRepository;
  departmentService: DepartmentService;
  employeeService: EmployeeService;
}

let contextPromise: Promise<AppContext> | null = null;

export function getAppContext() {
  if (!contextPromise) {
    contextPromise = (async () => {
      const db = await getMongoDatabase();
      const departmentRepository = createMongoDepartmentRepository(db);
      const employeeRepository = createMongoEmployeeRepository(db);
      const departmentService = createDepartmentService(departmentRepository);
      const employeeService = createEmployeeService(employeeRepository, departmentRepository);

      return {
        db,
        departmentRepository,
        employeeRepository,
        departmentService,
        employeeService,
      };
    })();
  }

  return contextPromise;
}
