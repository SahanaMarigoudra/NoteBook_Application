import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../../models/User.js';
import { RefreshSession } from '../../models/RefreshSession.js';
import { ActivityEvent } from '../../models/ActivityEvent.js';
import { env } from '../../config/env.js';
import { createError } from '../../middleware/error-handler.js';
import type { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schema.js';

import { SystemSetting } from '../../models/SystemSetting.js';

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function signAccessToken(userId: string, email: string, role: string = 'user'): string {
  return jwt.sign({ userId, email, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function parseExpiresIn(str: string): number {
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86400 * 1000;
  return parseInt(match[1], 10) * (map[match[2]] ?? 86400) * 1000;
}

export async function registerUser(data: RegisterInput, meta?: { ip?: string; userAgent?: string }) {
  const setting = await SystemSetting.findOne();
  if (setting && !setting.allowRegistration) {
    throw createError('User registration is currently disabled by administrator', 403);
  }

  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw createError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: 'user',
    status: 'active',
    lastActiveAt: new Date(),
  });

  await ActivityEvent.create({ userId: user._id, eventType: 'user_registered' });

  const accessToken = signAccessToken(String(user._id), user.email, user.role);
  const rawRefresh = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.REFRESH_TOKEN_EXPIRES_IN));

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(rawRefresh),
    expiresAt,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ip,
  });

  return { user, accessToken, refreshToken: rawRefresh };
}

export async function loginUser(data: LoginInput, meta?: { ip?: string; userAgent?: string }) {
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    throw createError('Your account has been suspended. Please contact support.', 403);
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw createError('Invalid email or password', 401);
  }

  await user.updateOne({ lastActiveAt: new Date() });
  await ActivityEvent.create({ userId: user._id, eventType: 'user_login' });

  const accessToken = signAccessToken(String(user._id), user.email, user.role);
  const rawRefresh = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.REFRESH_TOKEN_EXPIRES_IN));

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(rawRefresh),
    expiresAt,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ip,
  });

  // Remove passwordHash from the returned user object
  const userObj = user.toJSON();
  return { user: userObj, accessToken, refreshToken: rawRefresh };
}

export async function refreshTokens(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  const session = await RefreshSession.findOne({ tokenHash }).select('+tokenHash');

  if (!session) throw createError('Invalid refresh token', 401);
  if (session.revokedAt) throw createError('Refresh token has been revoked', 401);
  if (session.expiresAt < new Date()) throw createError('Refresh token has expired', 401);

  const user = await User.findById(session.userId);
  if (!user) throw createError('User not found', 401);
  if (user.status === 'suspended') throw createError('Account has been suspended', 403);

  // Rotate: revoke old, issue new
  await session.updateOne({ revokedAt: new Date() });
  await user.updateOne({ lastActiveAt: new Date() });

  const accessToken = signAccessToken(String(user._id), user.email, user.role);
  const rawRefresh = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseExpiresIn(env.REFRESH_TOKEN_EXPIRES_IN));

  await RefreshSession.create({
    userId: user._id,
    tokenHash: hashToken(rawRefresh),
    expiresAt,
  });

  return { accessToken, refreshToken: rawRefresh };
}

export async function logoutUser(rawRefreshToken: string, userId: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshSession.updateOne({ tokenHash, userId }, { revokedAt: new Date() });
  await ActivityEvent.create({ userId, eventType: 'user_logout' });
}

export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw createError('User not found', 404);

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw createError('Current password is incorrect', 400);

  const newHash = await bcrypt.hash(data.newPassword, env.BCRYPT_ROUNDS);
  await user.updateOne({ passwordHash: newHash });

  // Revoke all existing refresh sessions on password change
  await RefreshSession.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
}
