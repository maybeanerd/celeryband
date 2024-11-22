import { randomBytes, scrypt } from 'crypto';
import { eq } from 'drizzle-orm';
import { loginTokenSchema } from '~/server/db/schemas/LoginToken.schema';
import { obfuscationSaltSchema } from '~/server/db/schemas/ObfuscationSalt.schema';

// Creates and reuses a single shared salt.
// This is necessary because emails need to always be obfuscated the same way to allow re-log-ins
async function ensureObfuscationSalt (): Promise<string> {
  const { db } = useDrizzle();
  const existingSalt = await db.query.obfuscationSalt.findFirst();
  if (existingSalt) {
    return existingSalt.salt;
  }

  const salt = randomBytes(64).toString('hex');
  const insertedRows = await db.insert(obfuscationSaltSchema).values({ salt }).returning();
  const createdSalt = insertedRows.at(0);
  if (!createdSalt) {
    throw new Error('Was not able to create salt');
  }
  return createdSalt.salt;
}

export async function obfuscateEmail (email: string): Promise<string> {
  const salt = await ensureObfuscationSalt();

  const obfuscatedEmail = new Promise<string>((resolve, reject) => {
    scrypt(email, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey.toString('hex'));
    });
  });

  return obfuscatedEmail;
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

  return token;
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
