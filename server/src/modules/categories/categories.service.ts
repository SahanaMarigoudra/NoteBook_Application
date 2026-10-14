import { Category } from '../../models/Category.js';
import { Note } from '../../models/Note.js';
import { createError } from '../../middleware/error-handler.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export async function listCategories(userId: string) {
  return Category.find({ userId }).sort({ name: 1 });
}

export async function createCategory(userId: string, data: CreateCategoryInput) {
  try {
    return await Category.create({ userId, ...data });
  } catch (err: any) {
    if (err.code === 11000) throw createError('A category with this name already exists', 409);
    throw err;
  }
}

export async function updateCategory(userId: string, id: string, data: UpdateCategoryInput) {
  const cat = await Category.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!cat) throw createError('Category not found', 404);
  return cat;
}

export async function deleteCategory(userId: string, id: string) {
  const cat = await Category.findOneAndDelete({ _id: id, userId });
  if (!cat) throw createError('Category not found', 404);
  // Remove category reference from notes — do NOT delete the notes
  await Note.updateMany({ userId, categoryId: cat._id }, { $set: { categoryId: null } });
  return cat;
}
