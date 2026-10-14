import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export interface AuthPayload {
  userId: string;
  email: string;
  role?: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const user = await User.findById(req.user.userId).select('role status');
    if (!user) {
      res.status(401).json({ success: false, error: 'User no longer exists' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, error: 'Account has been suspended' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied: Administrator privileges required',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}

