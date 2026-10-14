import { Tag } from '../../models/Tag.js';
import { Note } from '../../models/Note.js';
import { createError } from '../../middleware/error-handler.js';
import type { CreateTagInput, UpdateTagInput } from './tags.schema.js';

export async function listTags(userId: string) {
  return Tag.find({ userId }).sort({ name: 1 });
}

export async function createTag(userId: string, data: CreateTagInput) {
  try {
    return await Tag.create({ userId, name: data.name });
  } catch (err: any) {
    if (err.code === 11000) throw createError('A tag with this name already exists', 409);
    throw err;
  }
}

export async function updateTag(userId: string, id: string, data: UpdateTagInput) {
  const tag = await Tag.findOneAndUpdate(
    { _id: id, userId },
    { $set: { name: data.name } },
    { new: true, runValidators: true }
  );
  if (!tag) throw createError('Tag not found', 404);
  return tag;
}

export async function deleteTag(userId: string, id: string) {
  const tag = await Tag.findOneAndDelete({ _id: id, userId });
  if (!tag) throw createError('Tag not found', 404);
  // Remove tag from all notes that reference it
  await Note.updateMany({ userId, tags: tag._id }, { $pull: { tags: tag._id } });
  return tag;
}
