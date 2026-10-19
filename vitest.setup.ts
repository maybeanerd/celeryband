import { readFileSync } from 'fs';
import { resolve } from 'path';
import { vi } from 'vitest';

const exampleConfig = readFileSync(
  resolve(process.cwd(), 'example.config.yaml'),
  'utf-8',
);

vi.doMock('fs', () => ({
  readFileSync: vi.fn(() => exampleConfig),
}));

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => ({
    sendMail: vi.fn().mockResolvedValue({ accepted: ['test@example.com'] }),
  })),
}));

process.env.SMTP_HOST ??= 'localhost';
process.env.SMTP_USERNAME ??= 'test@test.com';
process.env.SMTP_PASSWORD ??= 'test';
process.env.OBFUSCATION_SALT ??= 'test-salt';
