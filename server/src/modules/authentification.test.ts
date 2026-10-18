import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  obfuscateEmail,
  createLoginToken,
  validateLoginToken,
} from './authentification';

beforeEach(() => {
  process.env.OBFUSCATION_SALT = 'test-salt-value';
});

afterEach(() => {
  delete process.env.OBFUSCATION_SALT;
});

describe('obfuscateEmail', () => {
  it('should return a 128-char hex string (64-byte hash)', async () => {
    const result = await obfuscateEmail('user@example.com');
    expect(result).toMatch(/^[0-9a-f]{128}$/);
  });

  it('should produce the same hash for the same email', async () => {
    const result1 = await obfuscateEmail('user@example.com');
    const result2 = await obfuscateEmail('user@example.com');
    expect(result1).toBe(result2);
  });

  it('should produce different hashes for different emails', async () => {
    const result1 = await obfuscateEmail('user1@example.com');
    const result2 = await obfuscateEmail('user2@example.com');
    expect(result1).not.toBe(result2);
  });
});

describe('createLoginToken', () => {
  it('should return a 32-char hex token from real randomBytes', async () => {
    const mockDb = {
      insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const token = await createLoginToken('my-hash');
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('should insert the correct email hash into the DB', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn(() => ({ values: mockValues }));
    const mockDb = { insert: mockInsert };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await createLoginToken('my-obfuscated-hash');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ emailHash: 'my-obfuscated-hash' }),
    );
  });

  it('should set expiration to 24 hours from now', async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn(() => ({ values: mockValues }));
    const mockDb = { insert: mockInsert };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    vi.useFakeTimers();
    vi.setSystemTime(1_000_000);

    await createLoginToken('mocked-hash');

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        expirationDate: 1_000_000 + 1000 * 60 * 60 * 24,
      }),
    );

    vi.useRealTimers();
  });
});

describe('validateLoginToken', () => {
  it('should return null for a non-existent token', async () => {
    const mockDb = {
      delete: vi.fn(() => ({
        where: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })),
      })),
    };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const result = await validateLoginToken('non-existent');
    expect(result).toBeNull();
  });

  it('should return the emailHash for a valid token', async () => {
    const mockDb = {
      delete: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([
            {
              token: 'abc',
              emailHash: 'user-hash',
            },
          ]),
        })),
      })),
    };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    const result = await validateLoginToken('valid-token');
    expect(result).toBe('user-hash');
  });

  it('should delete the token after validation', async () => {
    const mockReturning = vi
      .fn()
      .mockResolvedValue([{ token: 'abc', emailHash: 'user-hash' }]);
    const mockDb = {
      delete: vi.fn(() => ({
        where: vi.fn(() => ({ returning: mockReturning })),
      })),
    };
    vi.stubGlobal('useDrizzle', () => ({ db: mockDb }));

    await validateLoginToken('valid-token');
    expect(mockDb.delete).toHaveBeenCalled();
  });
});
