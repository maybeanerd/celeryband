import { randomBytes } from 'crypto';

export function obfuscateEmail (email: string) {
  // TODO use crypto.scrypt to generate a hash that can be used to obfuscate the email
  // https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback
  return Promise.resolve(email.split('@').join(' [at] '));
}

export function createLoginToken (obfuscatedEmail: string) {
  const token = randomBytes(16).toString('hex');

  // TODO store token for the user in the database
  console.log(`Token for ${obfuscatedEmail}: ${token}`);

  return token;
}

export function validateLoginToken (token: string) {
  // TODO validate token for the user in the database, get the obfuscatedEmail
  console.log(`Validating token : ${token}`);

  return 'storedObfuscatedEmail';
}
