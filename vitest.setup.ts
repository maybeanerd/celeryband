import { vi } from 'vitest';

const validConfig = `
serverUrl: "http://localhost:3000"
acceptedDomain: "example.com"
currency: "€"
disclaimer: null
departments:
  engineering:
    label: "Engineering"
    roles:
      - software_engineer
      - product_manager
      - designer
roles:
  software_engineer:
    label: "Software Engineer"
    seniorityLevels:
      - junior
      - professional
      - senior
      - staff
      - principal
  product_manager:
    label: "Product Manager"
    seniorityLevels:
      - junior
      - professional
      - senior
  designer:
    label: "Designer"
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
