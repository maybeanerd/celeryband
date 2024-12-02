import { z } from 'zod';
import { createLoginToken, obfuscateEmail } from '~/server/src/modules/authentification';
import { sendLoginEmail } from '~/server/src/modules/email';

const emailBodyValidator = z.object({
  // TODO create email ending validation based on env/config
  email: z.string().email().min(1).endsWith('@diluz.io'),
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
  const { email } = emailBodyValidator.parse(body);

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
