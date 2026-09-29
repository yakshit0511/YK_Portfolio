import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).lean();

    if (!admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (Number(admin.tokenVersion) !== Number(decoded.tokenVersion)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
