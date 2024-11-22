import { randomUUID } from 'crypto';
import { userSchema } from '~/server/db/schemas/User.schema';
import { useDrizzle } from '~/server/utils/useDrizzle';

async function ensureUserExists (hashedEmail: string) {
  const { db } = useDrizzle();

  const existingUser = await db.query.user.findFirst(
    // searching by hash won't work because of the way the hash is generated atm - it needs to always be the same, for that to work
    /* { where: eq(userSchema.emailHash, hashedEmail) } */
  );

  if (existingUser) {
    return existingUser;
  }

  const createdUser = await db.insert(userSchema).values({ emailHash: hashedEmail, id: randomUUID() }).returning();

  return createdUser.at(0);
}

export default defineEventHandler(async (event) => {
  // TODO get email from request body
  const hashedEmail = await hashPassword('test@test.com');

  const user = await ensureUserExists(hashedEmail);
  if (!user) {
    throw new Error('Was not able to ensure user exists');
  }

  // Pretend to validate password/hash

  const validCredentials = await verifyPassword(hashedEmail, 'test@test.com');

  await setUserSession(event, {
  // User data
    user: {
      id: user.id,
    },
    // Private data accessible only on server/ routes
    secure: {
      message: 'user is logged in hehe',
    },
    // Any extra fields for the session data
    validCredentials,
  });
});
