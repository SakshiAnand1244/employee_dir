import type { Db } from 'mongodb';
import { COLLECTIONS } from './collections';

let indexPromise: Promise<void> | null = null;

export function ensureIndexes(db: Db) {
  if (!indexPromise) {
    indexPromise = (async () => {
      await Promise.all([
        db.collection(COLLECTIONS.departments).createIndex({ name: 1 }, { unique: true }),
        db.collection(COLLECTIONS.departments).createIndex({ floor: 1 }),
        db.collection(COLLECTIONS.employees).createIndex({ departmentId: 1 }),
        db.collection(COLLECTIONS.employees).createIndex({ departmentId: 1, name: 1 }),
        db.collection(COLLECTIONS.employees).createIndex({ salary: 1 }),
        db.collection(COLLECTIONS.employees).createIndex({ createdAt: -1 }),
        db.collection(COLLECTIONS.employees).createIndex(
          { name: 'text', position: 'text' },
          { name: 'employees_text_search' },
        ),
      ]);
    })();
  }

  return indexPromise;
}
