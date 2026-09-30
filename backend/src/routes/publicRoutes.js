import { Router } from 'express';
import { body } from 'express-validator';
import express from 'express';
import rateLimit from 'express-rate-limit';

import { createInquiry, rejectUnknownContactFields, validateContact } from '../controllers/contactController.js';
import { getPortfolio } from '../controllers/publicController.js';
import { originCheck } from '../middleware/csrf.js';

const router = Router();

router.get('/portfolio', getPortfolio);

const contactLimitHandler = (retryAfterSeconds) => (_req, res) => {
	res.set('Retry-After', String(retryAfterSeconds));
	return res.status(429).json({ message: 'Too many messages. Please try again later.' });
};

const hourlyContactLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	handler: contactLimitHandler(60 * 60),
});

const dailyContactLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	handler: contactLimitHandler(24 * 60 * 60),
});

const contactValidation = [
	body('name').isString().withMessage('Please enter your name.').bail().isLength({ max: 100 }).withMessage('Name must be 100 characters or fewer.').bail().custom((value) => value.trim().length >= 2).withMessage('Name must be at least 2 characters.'),
	body('email').isString().withMessage('Please enter a valid email address.').bail().trim().isEmail().withMessage('Please enter a valid email address.').bail().isLength({ max: 254 }).withMessage('Email must be 254 characters or fewer.').bail().customSanitizer((value) => value.toLowerCase()),
	body('subject').optional({ checkFalsy: true }).isString().withMessage('Subject must be text.').bail().isLength({ max: 150 }).withMessage('Subject must be 150 characters or fewer.'),
	body('message').isString().withMessage('Please enter a message.').bail().custom((value) => value.trim().length >= 10 && value.length <= 3000).withMessage('Message must be 10 to 3000 characters.'),
	body('website').optional().isString().withMessage('Website must be text.'),
	body('startedAt').optional().custom((value) => typeof value === 'number' && Number.isFinite(value)).withMessage('Started time must be a number.'),
];

router.post(
	'/contact',
	originCheck,
	hourlyContactLimiter,
	dailyContactLimiter,
	express.json({ limit: '10kb' }),
	rejectUnknownContactFields,
	contactValidation,
	validateContact,
	createInquiry
);

export default router;
