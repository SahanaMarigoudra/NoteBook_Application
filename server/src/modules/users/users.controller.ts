import { Request, Response, NextFunction } from 'express';
import * as service from './users.service.js';

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function deleteMe(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteAccount(req.user!.userId, req.body.password);
    res.clearCookie('ns_refresh', { httpOnly: true, path: '/api/v1/auth' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) { next(err); }
}
