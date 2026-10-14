import { Request, Response, NextFunction } from 'express';
import * as notesService from './notes.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notesService.listNotes(req.user!.userId, req.query as any);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await notesService.getNote(req.user!.userId, req.params.id);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await notesService.createNote(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: { note } });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await notesService.updateNote(req.user!.userId, req.params.id, req.body);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await notesService.softDeleteNote(req.user!.userId, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function pin(req: Request, res: Response, next: NextFunction) {
  try {
    const { isPinned } = req.body;
    const note = await notesService.pinNote(req.user!.userId, req.params.id, isPinned ?? true);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
}

export async function favorite(req: Request, res: Response, next: NextFunction) {
  try {
    const { isFavorite } = req.body;
    const note = await notesService.favoriteNote(req.user!.userId, req.params.id, isFavorite ?? true);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
}

export async function archive(req: Request, res: Response, next: NextFunction) {
  try {
    const { isArchived } = req.body;
    const note = await notesService.archiveNote(req.user!.userId, req.params.id, isArchived ?? true);
    res.json({ success: true, data: { note } });
  } catch (err) { next(err); }
}
