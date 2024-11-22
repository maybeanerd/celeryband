import { createLoginToken, obfuscateEmail } from '~/server/api/login/authentification';

export default defineEventHandler(async (event) => {
  // TODO validate email using zod
  const email = getRouterParam(event, 'email');
  if (!email) {
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
