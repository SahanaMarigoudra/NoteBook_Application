import { Types, FilterQuery } from 'mongoose';
import { Note, INote } from '../../models/Note.js';
import { Category } from '../../models/Category.js';
import { Tag } from '../../models/Tag.js';
import { ActivityEvent } from '../../models/ActivityEvent.js';
import { createError } from '../../middleware/error-handler.js';
import type { CreateNoteInput, UpdateNoteInput, NoteQuery } from './notes.schema.js';

async function validateOwnership(userId: string, categoryId?: string | null, tagIds?: string[]) {
  if (categoryId) {
    const cat = await Category.findOne({ _id: categoryId, userId });
    if (!cat) throw createError('Category not found or does not belong to you', 403);
  }
  if (tagIds && tagIds.length > 0) {
    const count = await Tag.countDocuments({ _id: { $in: tagIds }, userId });
    if (count !== tagIds.length) throw createError('One or more tags are invalid', 403);
  }
}

export async function listNotes(userId: string, query: NoteQuery) {
  const { page, limit, sort, order, search, categoryId, tag, isFavorite, isArchived } = query;

  const filter: FilterQuery<INote> = {
    userId: new Types.ObjectId(userId),
    deletedAt: null,
    isArchived: isArchived === 'true',
  };

  if (search) {
    // Use MongoDB text search
    filter.$text = { $search: search };
  }
  if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
  if (tag) filter.tags = new Types.ObjectId(tag);
  if (isFavorite !== undefined) filter.isFavorite = isFavorite === 'true';

  const sortField: Record<string, 1 | -1> =
    sort === 'isPinned'
      ? { isPinned: -1, updatedAt: -1 }
      : { [sort]: order === 'asc' ? 1 : -1 };

  const skip = (page - 1) * limit;
  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name color')
      .populate('tags', 'name'),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getNote(userId: string, noteId: string) {
  const note = await Note.findOne({ _id: noteId, userId, deletedAt: null })
    .populate('categoryId', 'name color')
    .populate('tags', 'name');
  if (!note) throw createError('Note not found', 404);
  return note;
}

export async function createNote(userId: string, data: CreateNoteInput) {
  await validateOwnership(userId, data.categoryId ?? null, data.tags);

  const note = await Note.create({
    userId: new Types.ObjectId(userId),
    title: data.title,
    content: data.content,
    categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : null,
    tags: (data.tags ?? []).map((t) => new Types.ObjectId(t)),
    isPinned: data.isPinned,
    isFavorite: data.isFavorite,
  });

  await ActivityEvent.create({ userId, noteId: note._id, eventType: 'note_created' });

  return note.populate([{ path: 'categoryId', select: 'name color' }, { path: 'tags', select: 'name' }]);
}

export async function updateNote(userId: string, noteId: string, data: UpdateNoteInput) {
  await validateOwnership(userId, data.categoryId ?? undefined, data.tags);

  const update: Partial<INote> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.content !== undefined) update.content = data.content;
  if (data.categoryId !== undefined) update.categoryId = data.categoryId ? new Types.ObjectId(data.categoryId) : null;
  if (data.tags !== undefined) update.tags = data.tags.map((t) => new Types.ObjectId(t));
  if (data.isPinned !== undefined) update.isPinned = data.isPinned;
  if (data.isFavorite !== undefined) update.isFavorite = data.isFavorite;

  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: null },
    { $set: update },
    { new: true, runValidators: true }
  )
    .populate('categoryId', 'name color')
    .populate('tags', 'name');

  if (!note) throw createError('Note not found', 404);

  await ActivityEvent.create({ userId, noteId: note._id, eventType: 'note_updated' });
  return note;
}

export async function pinNote(userId: string, noteId: string, isPinned: boolean) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: null },
    { $set: { isPinned } },
    { new: true }
  );
  if (!note) throw createError('Note not found', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: isPinned ? 'note_pinned' : 'note_unpinned' });
  return note;
}

export async function favoriteNote(userId: string, noteId: string, isFavorite: boolean) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: null },
    { $set: { isFavorite } },
    { new: true }
  );
  if (!note) throw createError('Note not found', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: isFavorite ? 'note_favorited' : 'note_unfavorited' });
  return note;
}

export async function archiveNote(userId: string, noteId: string, isArchived: boolean) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: null },
    { $set: { isArchived } },
    { new: true }
  );
  if (!note) throw createError('Note not found', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: isArchived ? 'note_archived' : 'note_restored' });
  return note;
}

export async function softDeleteNote(userId: string, noteId: string) {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId, deletedAt: null },
    { $set: { deletedAt: new Date(), isArchived: false } },
    { new: true }
  );
  if (!note) throw createError('Note not found', 404);
  await ActivityEvent.create({ userId, noteId: note._id, eventType: 'note_trashed' });
  return note;
}
