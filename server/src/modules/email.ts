import { createTransport } from 'nodemailer';
import { serverConfiguration } from '~/server/config/server';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;

if (!smtpHost || !smtpUsername || !smtpPassword) {
  throw new Error('Missing SMTP config from environment variables');
}

const emailTransporter = createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUsername,
    pass: smtpPassword,
  },
});

const { serverUrl, developmentMode } = serverConfiguration;

function getLoginLink (token: string) {
  const urlWithToken = new URL(serverUrl);
  urlWithToken.searchParams.set('token', token);
  urlWithToken.pathname = '/login';

  return urlWithToken.toString();
}

function generateLoginEmailContent (loginToken: string, emailAddress: string) {
  return `Hi there ${emailAddress}!
You're getting this email because someone tried to sign into ${serverUrl} using your email.
    
If this wasn't you, you can simply ignore this email.
    
If this was you, please click the following link to log in:
${getLoginLink(loginToken)}
    
This link is only valid once.`;
}

export function normalizeEmail (email: string) {
  return email.toLowerCase().trim();
}

export async function sendLoginEmail (loginToken: string, emailAddress: string) {
  const emailContent = generateLoginEmailContent(loginToken, emailAddress);

  if (developmentMode) {
    console.debug('--------- EMAIL CONTENT START ---------');
    console.debug(emailContent);
    console.debug('---------- EMAIL CONTENT END ----------');
  }

  const response = await emailTransporter.sendMail({
    from: '"celeryband" <noreply@celery.band>',
    to: emailAddress,
    subject: 'celeryband login',
    text: emailContent,
    // TODO could also create a HTML version of the content
  });

  if (response.accepted.length < 1) {
    throw new Error('Failed to send email.');
  }
  console.info('Sent login email.');
}
