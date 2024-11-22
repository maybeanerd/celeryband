import { createLoginToken, obfuscateEmail } from '~/server/api/login/authentification';

export default defineEventHandler(async (event) => {
  // TODO get email from request body
  const email = ('test@test.com');

  const obfuscatedEmail = await obfuscateEmail(email);

  const token = createLoginToken(obfuscatedEmail);

  return { token };
});
