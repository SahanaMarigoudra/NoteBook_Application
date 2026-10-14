import { Schema, model, Document, Types } from 'mongoose';

export type AuditAction =
  | 'admin_login'
  | 'user_role_change'
  | 'user_status_change'
  | 'user_delete'
  | 'note_delete'
  | 'note_view_content'
  | 'category_delete'
  | 'tag_delete'
  | 'settings_update'
  | 'system_action';

export type AuditTargetType = 'user' | 'note' | 'category' | 'tag' | 'settings' | 'system';

export interface IAuditLog extends Document {
  actorId: Types.ObjectId | null;
  actorEmail: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  status: 'success' | 'failure';
  reason?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['user', 'note', 'category', 'tag', 'settings', 'system'],
      index: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    details: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
