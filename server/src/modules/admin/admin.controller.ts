import { Request, Response, NextFunction } from 'express';
import * as service from './admin.service.js';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(String(req.query.days || '7'), 10) || 7;
    const data = await service.getDashboardStats(days);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listUsers(req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getUserDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getUserDetails(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateUserRole(
      req.user!.userId,
      req.params.id,
      req.body.role,
      req.ip
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateUserStatus(
      req.user!.userId,
      req.params.id,
      req.body.status,
      req.ip
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.deleteUser(req.user!.userId, req.params.id, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listNotes(req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getNoteDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const reason = String(req.query.reason || req.body.reason || 'Administrative review');
    const data = await service.getNoteDetails(req.user!.userId, req.params.id, reason, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.deleteNote(req.user!.userId, req.params.id, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await service.listAllCategories();
    res.json({ success: true, data: { categories } });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.deleteCategory(req.user!.userId, req.params.id, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listTags(_req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await service.listAllTags();
    res.json({ success: true, data: { tags } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.deleteTag(req.user!.userId, req.params.id, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.listAuditLogs(req.query as any);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSettings();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.updateSettings(req.user!.userId, req.body, req.ip);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getSystemHealth();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
