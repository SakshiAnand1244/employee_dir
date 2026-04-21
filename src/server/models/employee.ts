import type { ObjectId } from 'mongodb';
import type { DepartmentDocument, DepartmentSummary } from './department';

export interface EmployeeDocument {
  _id: ObjectId;
  name: string;
  position: string;
  salary: number;
  departmentId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeDetailDocument extends EmployeeDocument {
  department?: DepartmentDocument | null;
}

export interface EmployeeListItem {
  id: string;
  name: string;
  position: string;
  salary: number;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department?: DepartmentSummary | null;
}

export interface EmployeeDetail extends EmployeeListItem {
  department: DepartmentSummary | null;
}
