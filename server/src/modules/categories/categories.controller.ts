import { Request, Response, NextFunction } from 'express';
import * as service from './categories.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { categories: await service.listCategories(req.user!.userId) } }); }
  catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: { category: await service.createCategory(req.user!.userId, req.body) } }); }
  catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: { category: await service.updateCategory(req.user!.userId, req.params.id, req.body) } }); }
  catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await service.deleteCategory(req.user!.userId, req.params.id); res.json({ success: true }); }
  catch (err) { next(err); }
}
