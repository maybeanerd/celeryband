import { randomBytes, scrypt } from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { getObfuscationSalt } from '~/server/config/obfuscationSalt';
import { loginTokenSchema } from '~/server/db/schemas/LoginToken.schema';
import { normalizeEmail } from '~/server/src/modules/email';

export function obfuscateEmail (email: string): Promise<string> {
  const salt = getObfuscationSalt();

  const normalizedEmail = normalizeEmail(email);

  return new Promise<string>((resolve, reject) => {
    scrypt(normalizedEmail, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey.toString('hex'));
    });
  });
}

export async function createLoginToken (obfuscatedEmail: string) {
  const token = randomBytes(16).toString('hex');

  const { db } = useDrizzle();

  // TODO write cronjob to remove outdated login tokens
  const dayOffsetInMs = 1000 * 60 * 60 * 24;

  await db.insert(loginTokenSchema).values({
    token,
    emailHash: obfuscatedEmail,
    expirationDate: Date.now() + dayOffsetInMs,
  });

  return token;
}

export async function validateLoginToken (token: string): Promise<string | null> {
  const { db } = useDrizzle();

  const deletedRows = await db.delete(loginTokenSchema).where(
    and(
      eq(loginTokenSchema.token, token),
      gt(loginTokenSchema.expirationDate, Date.now()),
    ),
  ).returning();

  const loginTokenData = deletedRows.at(0);

  if (!loginTokenData) {
    return null;
  }

  return loginTokenData.emailHash;
}
