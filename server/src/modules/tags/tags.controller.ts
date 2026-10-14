import { Request, Response, NextFunction } from 'express';
import * as service from './tags.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { tags: await service.listTags(req.user!.userId) } }); }
  catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: { tag: await service.createTag(req.user!.userId, req.body) } }); }
  catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { tag: await service.updateTag(req.user!.userId, req.params.id, req.body) } }); }
  catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await service.deleteTag(req.user!.userId, req.params.id); res.json({ success: true }); }
  catch (err) { next(err); }
}
