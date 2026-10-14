import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service.js';
import { User } from '../../models/User.js';
import { createError } from '../../middleware/error-handler.js';
import { env } from '../../config/env.js';

const COOKIE_NAME = 'ns_refresh';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, accessToken, refreshToken } = await authService.loginUser(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawRefresh = req.cookies?.[COOKIE_NAME];
    if (!rawRefresh) {
      res.status(401).json({ success: false, error: 'No refresh token' });
      return;
    }
    const { accessToken, refreshToken } = await authService.refreshTokens(rawRefresh);
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawRefresh = req.cookies?.[COOKIE_NAME];
    if (rawRefresh && req.user) {
      await authService.logoutUser(rawRefresh, req.user.userId);
    }
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw createError('User not found', 404);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.changePassword(req.user!.userId, req.body);
    // Clear session cookies to force re-login
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}
