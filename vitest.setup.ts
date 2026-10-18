import { vi } from 'vitest';

const validConfig = `
serverUrl: "http://localhost:3000"
acceptedDomain: "example.com"
currency: "€"
disclaimer: null
departments:
  engineering:
    roles:
      "software engineer":
        seniorityLevels:
          - junior
          - professional
          - senior
          - staff
          - principal
      "product manager":
        seniorityLevels:
          - junior
          - professional
          - senior
      "designer":
        seniorityLevels:
          - junior
          - professional
          - senior
`;

vi.mock('fs', () => ({
  readFileSync: vi.fn(() => validConfig),
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
