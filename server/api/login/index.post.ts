import { randomUUID } from 'crypto';
import { userSchema } from '~/server/db/schemas/User.schema';
import { useDrizzle } from '~/server/utils/useDrizzle';
import { validateLoginToken } from '~/server/api/login/authentification';

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
  // TODO use zod to validate body/token
  const { token } = await readBody(event);

  const obfuscatedEmail = validateLoginToken(token);

  if (obfuscatedEmail === null) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid token.',
    });
  }

  const user = await ensureUserExists(obfuscatedEmail);
  if (!user) {
    throw new Error('Was not able to ensure user exists');
  }

  await setUserSession(event, {
  // User data
    user: {
      id: user.id,
    },
    // Private data accessible only on server/ routes
    secure: {
      message: 'user is logged in hehe',
    },
  });
});
