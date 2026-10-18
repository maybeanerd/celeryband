import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('crypto', () => ({
  randomBytes: vi.fn(),
  scrypt: vi.fn(),
}));

vi.mock('~/server/config/obfuscationSalt', () => ({
  getObfuscationSalt: vi.fn(() => 'test-salt'),
}));

vi.mock('~/server/src/modules/email', () => ({
  normalizeEmail: vi.fn((email: string) => email.toLowerCase().trim()),
}));

import { scrypt, randomBytes } from 'crypto';
import { obfuscateEmail, createLoginToken, validateLoginToken } from './authentification';

describe('obfuscateEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a hex string hash for a valid email', async () => {
    vi.mocked(scrypt).mockImplementation((_password, _salt, _digest, callback) => {
      callback(null, Buffer.from('derived-key-data'));
    });

    const result = await obfuscateEmail('user@example.com');

    expect(typeof result).toBe('string');
    expect(result).toMatch(/^[0-9a-f]+$/);
    expect(scrypt).toHaveBeenCalled();
  });

  it('should produce the same hash for the same email (deterministic)', async () => {
    vi.mocked(scrypt).mockImplementation((_password, _salt, _digest, callback) => {
      callback(null, Buffer.from('derived-key-data'));
    });

    const result1 = await obfuscateEmail('user@example.com');
    const result2 = await obfuscateEmail('user@example.com');

    expect(result1).toBe(result2);
  });

  it('should produce different hashes for different emails', async () => {
    vi.mocked(scrypt).mockImplementation((_password, _salt, _digest, callback) => {
      const mockHash = Buffer.from(`hash-for-${_password}`);
      callback(null, mockHash);
    });

    const result1 = await obfuscateEmail('user1@example.com');
    const result2 = await obfuscateEmail('user2@example.com');

    expect(result1).not.toBe(result2);
  });

  it('should pass the normalized (lowercase, trimmed) email to scrypt', async () => {
    vi.mocked(scrypt).mockImplementation((_password, _salt, _digest, callback) => {
      callback(null, Buffer.from('hash'));
    });

    await obfuscateEmail('  USER@EXAMPLE.COM  ');

    expect(scrypt).toHaveBeenCalledWith(
      'user@example.com',
      'test-salt',
      64,
      expect.any(Function),
    );
  });
});

describe('createLoginToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a 32-character hex token', async () => {
    vi.mocked(randomBytes).mockReturnValue(Buffer.from('1234567890123456'));

    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn(() => ({ values: mockValues }));
    const mockDb = { insert: mockInsert };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await createLoginToken('mocked-hash');

    expect(randomBytes).toHaveBeenCalledWith(16);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('should set expiration to 24 hours from now', async () => {
    vi.mocked(randomBytes).mockReturnValue(Buffer.from('1234567890123456'));

    const now = Date.now();
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn(() => ({ values: mockValues }));
    const mockDb = { insert: mockInsert };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await createLoginToken('mocked-hash');

    expect(mockValues).toHaveBeenCalledWith({
      token: expect.any(String),
      emailHash: 'mocked-hash',
      expirationDate: now + 1000 * 60 * 60 * 24,
    });

    vi.useRealTimers();
  });

  it('should include the obfuscated email in the token record', async () => {
    vi.mocked(randomBytes).mockReturnValue(Buffer.from('1234567890123456'));

    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn(() => ({ values: mockValues }));
    const mockDb = { insert: mockInsert };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await createLoginToken('my-obfuscated-hash');

    expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
      emailHash: 'my-obfuscated-hash',
    }));
  });
});

describe('validateLoginToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for a non-existent token', async () => {
    const mockReturning = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });
    const mockDb = { delete: mockDelete };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const result = await validateLoginToken('non-existent-token');
    expect(result).toBeNull();
  });

  it('should return emailHash for a valid token', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{
      token: 'abc123def456',
      emailHash: 'user-hash-value',
    }]);
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });
    const mockDb = { delete: mockDelete };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const result = await validateLoginToken('valid-token');
    expect(result).toBe('user-hash-value');
  });

  it('should delete the token after successful validation (one-time use)', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{
      token: 'abc123def456',
      emailHash: 'user-hash-value',
    }]);
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });
    const mockDb = { delete: mockDelete };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await validateLoginToken('valid-token');

    expect(mockDelete).toHaveBeenCalled();
    expect(mockReturning).toHaveBeenCalled();
  });

  it('should return null when token has expired', async () => {
    const mockReturning = vi.fn().mockResolvedValue([]);
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
    const mockDelete = vi.fn().mockReturnValue({ where: mockWhere });
    const mockDb = { delete: mockDelete };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const result = await validateLoginToken('expired-token');
    expect(result).toBeNull();
    expect(mockDelete).toHaveBeenCalled();
  });
});
