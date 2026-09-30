import { validationResult } from 'express-validator';

import Inquiry from '../models/Inquiry.js';
import { sendAutoReply, sendInquiryNotification } from '../utils/mailer.js';

const successResponse = (res) =>
  res.status(201).json({ success: true, message: 'Thanks! Your message has been sent.' });

export const rejectUnknownContactFields = (req, res, next) => {
  const allowedFields = new Set(['name', 'email', 'subject', 'message', 'website', 'startedAt']);
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: { body: 'A JSON object is required.' },
    });
  }

  const errors = Object.fromEntries(
    Object.keys(body)
      .filter((field) => !allowedFields.has(field))
      .map((field) => [field, 'Unexpected field.'])
  );

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  return next();
};

export const validateContact = (req, res, next) => {
  const errors = {};

  for (const error of validationResult(req).array()) {
    const field = error.path || 'body';
    errors[field] ||= error.msg;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  return next();
};

export const createInquiry = async (req, res) => {
  const { name, email, subject, message, website, startedAt } = req.body;

  if (String(website || '').trim()) return successResponse(res);
  if (typeof startedAt === 'number' && Date.now() - startedAt < 3000) return successResponse(res);

  try {
    const duplicate = await Inquiry.exists({
      email,
      message,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (duplicate) return successResponse(res);
  } catch {
    console.error('Inquiry duplicate check failed.');
    return res.status(500).json({ message: 'Unable to send your message right now.' });
  }

  const inquiry = new Inquiry({
    name,
    email,
    subject,
    message,
    status: 'new',
    emailSent: false,
    ip: req.ip,
  });

  try {
    await inquiry.save();
  } catch {
    console.error('Inquiry could not be saved.');
    return res.status(500).json({ message: 'Unable to send your message right now.' });
  }

  const notification = await sendInquiryNotification(inquiry);

  if (notification.ok) {
    inquiry.emailSent = true;
    inquiry.emailedAt = new Date();
    inquiry.emailError = undefined;
  } else {
    inquiry.emailSent = false;
    inquiry.emailError = String(notification.error || 'Email delivery failed.').slice(0, 300);
    console.error('Inquiry email notification failed.');
  }

  try {
    await inquiry.save();
  } catch {
    console.error('Inquiry email status could not be saved.');
  }

  void sendAutoReply(inquiry).then((result) => {
    if (!result.ok) console.error('Inquiry auto-reply email failed.');
  });

  return successResponse(res);
};