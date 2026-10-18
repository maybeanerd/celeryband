import { describe, it, expect } from 'vitest';
import { normalizeEmail } from './email';

describe('normalizeEmail', () => {
  it('should lowercase the email', () => {
    expect(normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com');
  });

  it('should handle mixed case with spaces', () => {
    expect(normalizeEmail('  Test.User@Example.COM  ')).toBe('test.user@example.com');
  });

  it('should handle already normalized email', () => {
    expect(normalizeEmail('user@example.com')).toBe('user@example.com');
  });

  it('should handle emails with multiple spaces', () => {
    expect(normalizeEmail('  user@test.com  ')).toBe('user@test.com');
  });
});
