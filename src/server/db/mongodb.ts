import { MongoClient, type Db } from 'mongodb';
import { ensureIndexes } from './indexes';
import { getServerEnv } from '@/server/config/env';

type MongoCache = {
  clientPromise?: Promise<MongoClient>;
  dbPromise?: Promise<Db>;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoCache: MongoCache | undefined;
}

const globalForMongo = globalThis as typeof globalThis & {
  __mongoCache?: MongoCache;
};

function getClientPromise() {
  if (!globalForMongo.__mongoCache) {
    globalForMongo.__mongoCache = {};
  }

  if (!globalForMongo.__mongoCache.clientPromise) {
    const { MONGODB_URI } = getServerEnv();
    const client = new MongoClient(MONGODB_URI);
    globalForMongo.__mongoCache.clientPromise = client.connect();
  }

  return globalForMongo.__mongoCache.clientPromise;
}

export async function getMongoDatabase(): Promise<Db> {
  if (!globalForMongo.__mongoCache) {
    globalForMongo.__mongoCache = {};
  }

  if (!globalForMongo.__mongoCache.dbPromise) {
    globalForMongo.__mongoCache.dbPromise = (async () => {
      const client = await getClientPromise();
      const { MONGODB_DB } = getServerEnv();
      const db = client.db(MONGODB_DB);
      await ensureIndexes(db);
      return db;
    })();
  }

  return globalForMongo.__mongoCache.dbPromise;
}
