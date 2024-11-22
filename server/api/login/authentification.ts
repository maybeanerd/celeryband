import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { loginTokenSchema } from '~/server/db/schemas/LoginToken.schema';

export function obfuscateEmail (email: string) {
  // TODO use crypto.scrypt to generate a hash that can be used to obfuscate the email
  // https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
  return Promise.resolve(email.split('@').join(' [at] '));
}

export async function createLoginToken (obfuscatedEmail: string) {
  const token = randomBytes(16).toString('hex');

  const { db } = useDrizzle();

  const dayOffsetInMs = 1000 * 60 * 60 * 24;

  await db.insert(loginTokenSchema).values({
    token,
    emailHash: obfuscatedEmail,
    expirationDate: Date.now() + dayOffsetInMs,
  });
}

export async function validateLoginToken (token: string): Promise<string | null> {
  const { db } = useDrizzle();

  const deletedRows = await db.delete(loginTokenSchema).where(eq(loginTokenSchema.token, token)).returning();

  const loginTokenData = deletedRows.at(0);

  if (!loginTokenData) {
    return null;
  }

  return loginTokenData.emailHash;
}
