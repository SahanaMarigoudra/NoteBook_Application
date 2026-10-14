import { Request, Response, NextFunction } from 'express';
import * as service from './trash.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { notes: await service.listTrash(req.user!.userId) } }); }
  catch (err) { next(err); }
}

export async function restore(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { note: await service.restoreFromTrash(req.user!.userId, req.params.id) } }); }
  catch (err) { next(err); }
}

export async function permanentDelete(req: Request, res: Response, next: NextFunction) {
  try { await service.permanentDeleteNote(req.user!.userId, req.params.id); res.json({ success: true }); }
  catch (err) { next(err); }
}

export async function emptyTrash(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await service.emptyTrash(req.user!.userId) }); }
  catch (err) { next(err); }
}
