import { Schema, model, Document, Types } from 'mongoose';

export interface ISystemSetting extends Document {
  appName: string;
  allowRegistration: boolean;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  maxNotesPerUser: number;
  passwordMinLength: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    appName: {
      type: String,
      default: 'NoteSpace',
      trim: true,
      maxlength: 100,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 10080, // 7 days in minutes
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxNotesPerUser: {
      type: Number,
      default: 1000,
    },
    passwordMinLength: {
      type: Number,
      default: 8,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSetting = model<ISystemSetting>('SystemSetting', systemSettingSchema);
