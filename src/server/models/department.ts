import type { ObjectId } from 'mongodb';

export interface DepartmentDocument {
  _id: ObjectId;
  name: string;
  floor: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  floor: number;
  slug: string;
  employeeCount?: number;
}
