import { eq } from 'drizzle-orm';
import { userSchema } from '~/server/db/schemas/User.schema';

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);

  const { db } = useDrizzle();

  const existingUser = await db.delete(userSchema).where(
    eq(userSchema.id, user.id),
  );

  if (existingUser.changes < 1) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Was not able to delete user.',
    });
  }

  await clearUserSession(event);
});
