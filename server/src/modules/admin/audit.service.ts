import { Types } from 'mongoose';
import { AuditLog, AuditAction, AuditTargetType } from '../../models/AuditLog.js';

interface LogAuditParams {
  actorId?: string | Types.ObjectId | null;
  actorEmail: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  status?: 'success' | 'failure';
  reason?: string;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await AuditLog.create({
      actorId: params.actorId ? new Types.ObjectId(String(params.actorId)) : null,
      actorEmail: params.actorEmail,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || undefined,
      details: params.details,
      ipAddress: params.ipAddress || '',
      status: params.status || 'success',
      reason: params.reason || '',
    });
  } catch (err) {
    // Audit logging should never crash the main request flow
    console.error('Failed to write audit log:', err);
  }
}
