import { Request, Response, NextFunction } from 'express';
import * as service from './dashboard.service.js';

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getDashboardSummary(req.user!.userId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function activity(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Math.min(Number(req.query.days ?? 7), 30);
    const data = await service.getActivityChart(req.user!.userId, days);
    res.json({ success: true, data: { chart: data, days } });
  } catch (err) { next(err); }
}
