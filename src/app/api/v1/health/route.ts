import { getMongoDatabase } from '@/server/db/mongodb';
import { fromError, successResponse } from '@/server/http/response';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = await getMongoDatabase();
    await db.command({ ping: 1 });

    return successResponse({
      service: 'employee-directory',
      mongodb: 'ok',
    }, 'ok');
  } catch (error) {
    return fromError(error);
  }
}
