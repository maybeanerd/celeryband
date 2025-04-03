const obfuscationSalt = process.env.OBFUSCATION_SALT;

export function getObfuscationSalt () {
  if (obfuscationSalt === undefined) {
    throw new Error('OBFUSCATION_SALT not set');
  }
  return obfuscationSalt;
}
