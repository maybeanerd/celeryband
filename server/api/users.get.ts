import { useDrizzle } from '~/server/utils/useDrizzle';

export default defineEventHandler(async (event) => {
  await requireUserSession(event);

  const { db } = useDrizzle();
  const users = await db.query.user.findMany();

  return {
    users,
  };
});
