import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';

import { changePassword, getMe, login, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { originCheck } from '../middleware/csrf.js';
import { rejectUnknownFields, validate } from '../middleware/validate.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many attempts, please try again later.',
  },
});

router.use(originCheck);

router.post(
  '/login',
  loginLimiter,
  rejectUnknownFields(['email', 'password']),
  [
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validate,
  login
);

router.post('/logout', logout);

router.get('/me', protect, getMe);

router.put(
  '/change-password',
  protect,
  rejectUnknownFields(['currentPassword', 'newPassword']),
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 12 }).withMessage('New password must be at least 12 characters long.'),
    body('newPassword').custom((value, { req }) => value !== req.body.currentPassword).withMessage('New password must differ from the current password.'),
  ],
  validate,
  changePassword
);

export default router;
