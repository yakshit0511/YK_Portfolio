import { Resend } from 'resend';

import { env } from '../config/env.js';
import { escapeHtml } from './escapeHtml.js';
import { sanitizeHeader } from './sanitizeHeader.js';

let resendClient;

const getResendClient = () => {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
};

if (!env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set; inquiry email notifications are disabled.');
}

const from = `Yakshit Portfolio <${sanitizeHeader(env.RESEND_FROM)}>`;

const sendWithTimeout = async (message) => {
  const resend = getResendClient();
  if (!resend) return { ok: false, error: 'Email service is not configured.' };

  let timeoutId;
  try {
    const timeoutResult = Symbol('email-timeout');
    const timeout = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => resolve(timeoutResult), 10_000);
    });
    const result = await Promise.race([resend.emails.send(message), timeout]);

    if (result === timeoutResult) return { ok: false, error: 'Email request timed out.' };
    if (result?.error) {
      return { ok: false, error: String(result.error.message || 'Email provider rejected the request.') };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error?.message || 'Email delivery failed.') };
  } finally {
    clearTimeout(timeoutId);
  }
};

const formatTime = (value) =>
  new Date(value || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

export const sendInquiryNotification = async (inquiry) => {
  try {
    const name = sanitizeHeader(inquiry.name);
    const subject = sanitizeHeader(inquiry.subject || 'No subject');
    const email = String(inquiry.email || '');
    const message = String(inquiry.message || '');
    const createdAt = formatTime(inquiry.createdAt);
    const inquiryId = String(inquiry._id || '');
    const escapedMessage = escapeHtml(message).replace(/\r\n|\r|\n/g, '<br>');
    const text = [
      'New portfolio inquiry',
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      `Message: ${message}`,
      `Time (Asia/Kolkata): ${createdAt}`,
      `Inquiry ID: ${inquiryId}`,
    ].join('\n');
    const html = `
      <table role="presentation" style="width:100%;border-collapse:collapse;background:#07112c;color:#e8efff;font-family:Arial,sans-serif">
        <tr><td style="padding:32px 20px">
          <table role="presentation" style="width:100%;max-width:640px;margin:0 auto;border:1px solid #263a68;border-radius:12px;background:#0a1330">
            <tr><td style="padding:28px">
              <p style="margin:0 0 8px;color:#54e3ff;font-size:12px">YAKSHIT PORTFOLIO</p>
              <h1 style="margin:0 0 24px;color:#ffffff;font-size:22px">New inquiry</h1>
              <p style="margin:0 0 10px"><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p style="margin:0 0 10px"><strong>Email:</strong> <a style="color:#7ddcff" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
              <p style="margin:0 0 18px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
              <div style="padding:18px;border:1px solid #263a68;border-radius:8px;background:#07112c;line-height:1.7">${escapedMessage}</div>
              <p style="margin:20px 0 6px;color:#a8b8dd;font-size:12px">${escapeHtml(createdAt)} (Asia/Kolkata)</p>
              <p style="margin:0;color:#8298c2;font-size:11px">Inquiry ID: ${escapeHtml(inquiryId)}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>`;

    return await sendWithTimeout({
      from,
      to: env.INQUIRY_TO_EMAIL,
      replyTo: email,
      subject: `New portfolio inquiry from ${name}`,
      html,
      text,
    });
  } catch (error) {
    return { ok: false, error: String(error?.message || 'Email delivery failed.') };
  }
};

export const sendAutoReply = async (inquiry) => {
  if (env.AUTO_REPLY_ENABLED !== 'true') return { ok: true, skipped: true };

  try {
    const name = escapeHtml(sanitizeHeader(inquiry.name));
    const html = `<div style="background:#07112c;color:#e8efff;padding:28px;font-family:Arial,sans-serif"><h1 style="color:#54e3ff">Thanks for reaching out</h1><p>Hi ${name},</p><p>Your message has reached Yakshit. He will get back to you soon.</p></div>`;
    const text = `Hi ${sanitizeHeader(inquiry.name)},\n\nYour message has reached Yakshit. He will get back to you soon.`;
    return await sendWithTimeout({
      from,
      to: inquiry.email,
      subject: 'Thanks for your message',
      html,
      text,
    });
  } catch (error) {
    return { ok: false, error: String(error?.message || 'Auto-reply delivery failed.') };
  }
};