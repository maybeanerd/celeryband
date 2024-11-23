import { createLoginToken, obfuscateEmail } from '~/server/api/login/authentification';

export default defineEventHandler(async (event) => {
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
