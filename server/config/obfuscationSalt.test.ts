import { describe, it, expect } from 'vitest';

describe('getObfuscationSalt', () => {
  let getObfuscationSalt: () => string;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should throw if OBFUSCATION_SALT is not set', async () => {
    // Clear the env var before requiring the module
    delete process.env.OBFUSCATION_SALT;

    const mod = await import('./obfuscationSalt');
    getObfuscationSalt = mod.getObfuscationSalt;

    expect(() => getObfuscationSalt()).toThrow('OBFUSCATION_SALT not set');
  });

  it('should return the salt when OBFUSCATION_SALT is set', async () => {
    process.env.OBFUSCATION_SALT = 'my-secret-salt';

    const mod = await import('./obfuscationSalt');
    getObfuscationSalt = mod.getObfuscationSalt;

    expect(getObfuscationSalt()).toBe('my-secret-salt');
  });
});
