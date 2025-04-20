import { z } from 'zod';
import { serverConfiguration } from '~/server/config/server';
import { createLoginToken, obfuscateEmail } from '~/server/src/modules/authentification';
import { sendLoginEmail } from '~/server/src/modules/email';

const emailBodyValidator = z.object({
  email: z.string().email().min(1).endsWith(`@${serverConfiguration.acceptedDomain}`),
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

  const { email } = data;

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
