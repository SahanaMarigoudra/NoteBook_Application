import { Note } from '../../models/Note.js';

export async function searchNotes(userId: string, q: string, limit = 20) {
  if (!q || q.trim().length === 0) return [];

  const results = await Note.find(
    {
      userId,
      deletedAt: null,
      $text: { $search: q.trim() },
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(Math.min(limit, 50))
    .populate('categoryId', 'name color')
    .populate('tags', 'name');

  return results;
}
