import { Types } from 'mongoose';
import { Note } from '../../models/Note.js';
import { ActivityEvent } from '../../models/ActivityEvent.js';
import { createError } from '../../middleware/error-handler.js';

export async function listTrash(userId: string) {
  return Note.find({ userId, deletedAt: { $ne: null } })
    .sort({ deletedAt: -1 })
    .populate('categoryId', 'name color')
    .populate('tags', 'name');
}

export async function restoreFromTrash(userId: string, noteId: string) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: { $ne: null } },
    { $set: { deletedAt: null } },
    { new: true }
  );
  if (!note) throw createError('Note not found in trash', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: 'note_restored' });
  return note;
}

export async function permanentDeleteNote(userId: string, noteId: string) {
  const note = await Note.findOneAndDelete({ _id: noteId, userId, deletedAt: { $ne: null } });
  if (!note) throw createError('Note not found in trash', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: 'note_deleted' });
}

export async function emptyTrash(userId: string) {
  const notes = await Note.find({ userId, deletedAt: { $ne: null } }, { _id: 1 });
  const ids = notes.map((n) => n._id);
  await Note.deleteMany({ userId, deletedAt: { $ne: null } });
  if (ids.length > 0) {
    await ActivityEvent.insertMany(
      ids.map((noteId) => ({ userId: new Types.ObjectId(userId), noteId, eventType: 'note_deleted' }))
    );
  }
  return { deletedCount: ids.length };
}
