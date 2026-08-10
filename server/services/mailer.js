import nodemailer from 'nodemailer';

let transport;

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

export async function sendMail({ to, subject, text, html }) {
  if (!isMailConfigured()) {
    console.warn('SMTP not configured — email not sent.');
    console.warn(`Would send to ${to}: ${subject}`);
    console.warn(text);
    return { delivered: false };
  }

  await getTransport().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true };
}
