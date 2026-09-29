import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';

const runCreateAdmin = async () => {
  try {
    const email = String(env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = String(env.ADMIN_PASSWORD || '');

    if (!email) {
      throw new Error('ADMIN_EMAIL is missing from the environment.');
    }

    if (password.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
    }

    await connectDB();

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await Admin.findOneAndUpdate(
      { email },
      {
        email,
        passwordHash,
        failedAttempts: 0,
        lockUntil: null,
        tokenVersion: 0,
        lastLoginAt: null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(`Admin user ready: ${admin.email}`);
  } catch (error) {
    console.error('create-admin failed:', error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = await import('mongoose');
    await mongoose.default.disconnect();
  }
};

runCreateAdmin();
