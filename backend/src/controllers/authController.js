import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

const dummyHash = bcrypt.hashSync('this-is-a-dummy-password-for-timing-equality', 12);

const getExpiresInMs = () => {
  const match = /^([0-9]+)([smhd])$/i.exec(String(env.JWT_EXPIRES_IN || '7d').trim());

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (multipliers[unit] || multipliers.d);
};

const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: getExpiresInMs(),
    path: '/',
  };
};

const signAdminToken = (admin) =>
  jwt.sign(
    {
      id: admin._id.toString(),
      tokenVersion: admin.tokenVersion,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
    }
  );

export const login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const admin = await Admin.findOne({ email });

    if (admin && admin.lockUntil && new Date(admin.lockUntil).getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Too many attempts, please try again later.',
      });
    }

    const storedHash = admin ? admin.passwordHash : dummyHash;
    const isPasswordMatch = await bcrypt.compare(password, storedHash);

    if (!admin || !isPasswordMatch) {
      if (admin) {
        admin.failedAttempts += 1;

        if (admin.failedAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }

        await admin.save();
      }

      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    if (admin.lockUntil && new Date(admin.lockUntil).getTime() > Date.now()) {
      return res.status(429).json({
        message: 'Too many attempts, please try again later.',
      });
    }

    admin.failedAttempts = 0;
    admin.lockUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken(admin);

    res.cookie('admin_token', token, getCookieOptions());

    return res.status(200).json({
      admin: {
        email: admin.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).lean();

    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
      email: admin.email,
      lastLoginAt: admin.lastLoginAt,
    });
  } catch (error) {
    return res.status(500).json({
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required.' });
    }

    if (String(newPassword).length < 12) {
      return res.status(400).json({ message: 'New password must be at least 12 characters long.' });
    }

    if (String(newPassword) === String(currentPassword)) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }

    const admin = await Admin.findById(req.admin._id);

    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const passwordMatches = await bcrypt.compare(String(currentPassword), admin.passwordHash);

    if (!passwordMatches) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 12);
    admin.passwordHash = passwordHash;
    admin.tokenVersion += 1;
    admin.failedAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    const token = signAdminToken(admin);
    res.cookie('admin_token', token, getCookieOptions());

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    });
  }
};
