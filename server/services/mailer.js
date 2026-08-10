import nodemailer from 'nodemailer';

const HTTP_TIMEOUT_MS = 15000;

let transport;

// Render's free tier blocks outbound SMTP ports, so HTTP providers are tried first
export function mailProvider() {
  if (process.env.BREVO_API_KEY) return 'brevo';
  if (process.env.RESEND_API_KEY) return 'resend';
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return 'smtp';
  return null;
}

export function isMailConfigured() {
  return mailProvider() !== null;
}

function parseFrom() {
  const raw = (process.env.MAIL_FROM || process.env.SMTP_USER || '').trim();
  const named = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (named) {
    return { name: named[1].trim() || 'What to Cook', email: named[2].trim() };
  }
  return { name: 'What to Cook', email: raw };
}

async function postJson(url, headers, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`${response.status} ${detail}`);
  }
}

async function sendViaBrevo({ to, subject, text }) {
  const from = parseFrom();
  await postJson(
    'https://api.brevo.com/v3/smtp/email',
    { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json' },
    {
      sender: { name: from.name, email: from.email },
      to: [{ email: to }],
      subject,
      textContent: text,
    }
  );
}

async function sendViaResend({ to, subject, text }) {
  const from = parseFrom();
  await postJson(
    'https://api.resend.com/emails',
    { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    { from: `${from.name} <${from.email}>`, to: [to], subject, text }
  );
}

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // Fail fast instead of hanging when the host blocks SMTP ports
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return transport;
}

async function sendViaSmtp({ to, subject, text, html }) {
  const from = parseFrom();
  await getTransport().sendMail({
    from: process.env.MAIL_FROM || from.email,
    to,
    subject,
    text,
    html,
  });
}

export async function sendMail({ to, subject, text, html }) {
  const provider = mailProvider();

  if (!provider) {
    console.warn('No email provider configured — email not sent.');
    console.warn(`Would send to ${to}: ${subject}`);
    console.warn(text);
    return { delivered: false, provider: null };
  }

  if (provider === 'brevo') await sendViaBrevo({ to, subject, text });
  else if (provider === 'resend') await sendViaResend({ to, subject, text });
  else await sendViaSmtp({ to, subject, text, html });

  return { delivered: true, provider };
}
