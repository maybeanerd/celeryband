import { createLoginToken, obfuscateEmail } from '~/server/src/modules/authentification';

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

  // TODO send token to original email
  console.log('token', token);

  // for easier testing, for now we return the token directly
  return { token };
});
