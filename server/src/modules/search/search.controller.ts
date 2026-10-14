import { Request, Response, NextFunction } from 'express';
import { searchNotes } from './search.service.js';

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? '').slice(0, 200);
    const limit = Math.min(Number(req.query.limit ?? 20), 50);
    const notes = await searchNotes(req.user!.userId, q, limit);
    res.json({ success: true, data: { notes, query: q } });
  } catch (err) { next(err); }
}
