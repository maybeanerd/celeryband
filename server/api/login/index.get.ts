import { createLoginToken, obfuscateEmail } from '~/server/api/login/authentification';

export default defineEventHandler(async () => {
  // TODO get email from request body
  const email = ('test@test.com');

  const obfuscatedEmail = await obfuscateEmail(email);

  const token = createLoginToken(obfuscatedEmail);

  // TODO send token to original email
  console.log('token', token);

  // for easier testing, for now we return the token directly
  return { token };
});
