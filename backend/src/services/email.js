import crypto from 'crypto';
import nodemailer from 'nodemailer';

const STATUS_LABELS = {
  pending: 'Pending — La sugayo',
  'in-progress': 'Active Repair — Waa la dayactirayaa',
  completed: 'Ready for Pickup — Diyaar u ah in la qaado',
  hold: 'On Hold — La joojiyay',
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function deliverMail({ to, subject, html, logLabel }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n[email] SMTP not configured — ${logLabel} for ${to}:`);
    console.log(subject);
    console.log('');
    return { delivered: false, logged: true };
  }

  await transporter.sendMail({ from, to, subject, html });
  return { delivered: true, logged: false };
}

function repairEmailLayout({ title, bodyHtml, ref, trackUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc">
      <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
        <h2 style="color:#2563eb;margin:0 0 8px">${title}</h2>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px">Ref #${ref}</p>
        ${bodyHtml}
        ${
          trackUrl
            ? `<p style="margin:28px 0">
          <a href="${trackUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
            Eeg heerka dayactirka
          </a>
        </p>`
            : ''
        }
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">FixFlow Device Repair</p>
      </div>
    </div>
  `;
}

export async function sendRepairUpdateEmail({
  to,
  customerName,
  deviceType,
  ref,
  status,
  notes,
  updatedBy,
  updatedByRole,
}) {
  const statusLabel = STATUS_LABELS[status] || status;
  const roleLabel = updatedByRole === 'technician' ? 'Technician' : 'Admin';
  const trackUrl = process.env.APP_URL ? `${process.env.APP_URL}/` : null;
  const subject = `FixFlow — Update: ${deviceType} (#${ref})`;

  const bodyHtml = `
    <p>Hi ${customerName || 'there'},</p>
    <p>Qalabkaaga <strong>${deviceType}</strong> waa la cusboonaysiiyay.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 0;color:#64748b">Heerka cusub</td><td style="padding:8px 0;font-weight:bold">${statusLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Waxaa cusboonaysiiyay</td><td style="padding:8px 0">${roleLabel}: ${updatedBy}</td></tr>
      ${notes ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">Xog</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
    </table>
  `;

  return deliverMail({
    to,
    subject,
    html: repairEmailLayout({ title: 'Dayactirka waa la cusboonaysiiyay', bodyHtml, ref, trackUrl }),
    logLabel: 'repair update',
  });
}

export async function sendStaffUpdateEmail({
  to,
  name,
  deviceType,
  customerName,
  ref,
  status,
  notes,
  updatedBy,
  updatedByRole,
}) {
  const statusLabel = STATUS_LABELS[status] || status;
  const roleLabel = updatedByRole === 'technician' ? 'Technician' : 'Admin';
  const subject = `FixFlow — ${roleLabel} update: ${deviceType} (#${ref})`;

  const bodyHtml = `
    <p>Hi ${name || 'there'},</p>
    <p><strong>${updatedBy}</strong> (${roleLabel}) wuxuu cusboonaysiiyay dayactirkan:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px 0;color:#64748b">Macmiil</td><td style="padding:8px 0;font-weight:bold">${customerName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Qalab</td><td style="padding:8px 0">${deviceType}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Heerka</td><td style="padding:8px 0;font-weight:bold">${statusLabel}</td></tr>
      ${notes ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">Notes</td><td style="padding:8px 0">${notes}</td></tr>` : ''}
    </table>
  `;

  return deliverMail({
    to,
    subject,
    html: repairEmailLayout({ title: 'Repair Update Notification', bodyHtml, ref, trackUrl: null }),
    logLabel: 'staff update',
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = 'FixFlow — Reset your password';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#2563eb;margin:0 0 12px">FixFlow Password Reset</h2>
      <p>Hi ${name || 'there'},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
      <p style="margin:28px 0">
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset password
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">If you did not request this, you can ignore this email.</p>
      <p style="color:#94a3b8;font-size:12px;word-break:break-all">${resetUrl}</p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    console.log('\n[email] SMTP not configured — password reset link:');
    console.log(resetUrl);
    console.log('');
    return { delivered: false, logged: true };
  }

  await transporter.sendMail({ from, to, subject, html });
  return { delivered: true, logged: false };
}

export function createResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
