import { Schema, model, Document, Types } from 'mongoose';

export interface ITag extends Document {
  userId: Types.ObjectId;
  name: string;
  createdAt: Date;
}

const tagSchema = new Schema<ITag>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      lowercase: true,
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret['__v'];
        return ret;
      },
    },
  }
);

// Prevent duplicate tag names per user (normalized lowercase)
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Tag = model<ITag>('Tag', tagSchema);
