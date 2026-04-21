import { z } from 'zod';

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().trim().min(1),
  MONGODB_DB: z.string().trim().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = serverEnvSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  });

  if (!parsed.success) {
    throw new Error('Missing MongoDB configuration. Set MONGODB_URI and MONGODB_DB before starting the app.');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
