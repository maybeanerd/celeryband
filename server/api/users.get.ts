import { useOgDrizzle } from '~/server/utils/useOgDrizzle';

export default defineEventHandler(async () => {
  const { db } = useOgDrizzle();
  const users = await db.query.user.findMany();

  return {
    users,
  };
});
