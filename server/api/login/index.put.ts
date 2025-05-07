import { z } from 'zod';
import { serverConfiguration } from '~/server/config/server';
import { createLoginToken, obfuscateEmail } from '~/server/src/modules/authentification';
import { sendLoginEmail, normalizeEmail } from '~/server/src/modules/email';

const emailBodyValidator = z.object({
  // We cant use .email() because it has an issue that would not allow umlauts.
  // It should be enough to expect the end (which we need to in any case) for us, though.
  // https://github.com/colinhacks/zod/issues/3073
  email: z.string().min(1).endsWith(`@${serverConfiguration.acceptedDomain}`),
});

export default defineEventHandler(async (event) => {
  // TODO add ratelimit

  const userSession = await getUserSession(event);
  if (userSession.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Already logged in, can\'t generate a new login token.',
    });
  }

  const body = await readBody(event);
  const { error, data } = emailBodyValidator.safeParse(body);

  if (error) {
    throw createError({
      statusCode: 403,
      statusMessage: error.errors[0].message,
    });
  }

  const email = normalizeEmail(data.email);

  const obfuscatedEmail = await obfuscateEmail(email);

  const token = await createLoginToken(obfuscatedEmail);
  try {
    await sendLoginEmail(token, email);
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to send login verification email.',
    });
  }
});
