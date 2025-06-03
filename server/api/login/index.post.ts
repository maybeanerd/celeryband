import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { userSchema } from '~/server/db/schemas/User.schema';
import { validateLoginToken } from '~/server/src/modules/authentification';

async function ensureUserExists (hashedEmail: string) {
  const { db } = useDrizzle();

  const existingUser = await db.query.user.findFirst(
    { where: eq(userSchema.emailHash, hashedEmail) },
  );

  if (existingUser) {
    return existingUser;
  }

  const createdUser = await db.insert(userSchema).values({ emailHash: hashedEmail, id: randomUUID() }).returning();

  return createdUser.at(0);
}

const tokenBodyValidator = z.object({
  token: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token } = tokenBodyValidator.parse(body);

  const obfuscatedEmail = await validateLoginToken(token);

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
    // Private data accessible only on server/routes
    secure: {
    },
  }, {
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
});
