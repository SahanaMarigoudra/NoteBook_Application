import { Schema, model, Document, Types } from 'mongoose';

export type ActivityEventType =
  | 'note_created'
  | 'note_updated'
  | 'note_archived'
  | 'note_restored'
  | 'note_trashed'
  | 'note_deleted'
  | 'note_pinned'
  | 'note_unpinned'
  | 'note_favorited'
  | 'note_unfavorited'
  | 'user_registered'
  | 'user_login'
  | 'user_logout';

export interface IActivityEvent extends Document {
  userId: Types.ObjectId;
  noteId: Types.ObjectId | null;
  eventType: ActivityEventType;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const activityEventSchema = new Schema<IActivityEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: 'Note',
      default: null,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'note_created',
        'note_updated',
        'note_archived',
        'note_restored',
        'note_trashed',
        'note_deleted',
        'note_pinned',
        'note_unpinned',
        'note_favorited',
        'note_unfavorited',
        'user_registered',
        'user_login',
        'user_logout',
      ],
    },
    meta: {
      type: Schema.Types.Mixed,
      default: undefined,
      // meta never contains note content
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activityEventSchema.index({ userId: 1, createdAt: -1 });
activityEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });
// TTL: keep activity logs for 90 days
activityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const ActivityEvent = model<IActivityEvent>('ActivityEvent', activityEventSchema);
