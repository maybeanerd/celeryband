import { useDrizzle } from '~/server/utils/useDrizzle';

export default defineEventHandler(async () => {
  const { db } = useDrizzle();
  const users = await db.query.user.findMany();

  return {
    users,
  };
});
