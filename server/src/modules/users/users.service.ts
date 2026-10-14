import bcrypt from 'bcryptjs';
import { User } from '../../models/User.js';
import { Note } from '../../models/Note.js';
import { Category } from '../../models/Category.js';
import { Tag } from '../../models/Tag.js';
import { RefreshSession } from '../../models/RefreshSession.js';
import { ActivityEvent } from '../../models/ActivityEvent.js';
import { createError } from '../../middleware/error-handler.js';

export async function updateProfile(userId: string, data: { name?: string }) {
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
  if (!user) throw createError('User not found', 404);
  return user;
}

export async function deleteAccount(userId: string, password: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw createError('User not found', 404);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError('Incorrect password', 403);

  // Delete all user data
  await Promise.all([
    Note.deleteMany({ userId }),
    Category.deleteMany({ userId }),
    Tag.deleteMany({ userId }),
    RefreshSession.deleteMany({ userId }),
    ActivityEvent.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
}
