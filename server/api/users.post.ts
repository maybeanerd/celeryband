import { randomUUID } from 'crypto';
import { userSchema } from '~/server/db/schemas/User.schema';
import { useDrizzle } from '~/server/utils/useDrizzle';

export default defineEventHandler(async () => {
  const { db } = useDrizzle();

  await db.insert(userSchema).values({ emailHash: randomUUID(), id: randomUUID() });
});
