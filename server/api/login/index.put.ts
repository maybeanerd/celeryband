import { createLoginToken, obfuscateEmail } from '~/server/src/modules/authentification';
import { sendLoginEmail } from '~/server/src/modules/email';

export default defineEventHandler(async (event) => {
  // TODO add ratelimit

  const userSession = await getUserSession(event);
  if (userSession.user) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Already logged in, can\'t generate a new login token.',
    });
  }

  const { email } = await readBody(event);

  // TODO use zod to validate body/email
  if (!email || typeof email !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'missing email',
    });
  }

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
