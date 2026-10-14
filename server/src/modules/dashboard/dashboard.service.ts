import { Types } from 'mongoose';
import { Note } from '../../models/Note.js';
import { ActivityEvent } from '../../models/ActivityEvent.js';

export async function getDashboardSummary(userId: string) {
  const uid = new Types.ObjectId(userId);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalActive,
    totalArchived,
    totalTrashed,
    totalPinned,
    totalFavorite,
    createdThisWeek,
    recentlyUpdated,
    recentlyCreated,
    byCategory,
  ] = await Promise.all([
    Note.countDocuments({ userId: uid, deletedAt: null, isArchived: false }),
    Note.countDocuments({ userId: uid, deletedAt: null, isArchived: true }),
    Note.countDocuments({ userId: uid, deletedAt: { $ne: null } }),
    Note.countDocuments({ userId: uid, deletedAt: null, isPinned: true }),
    Note.countDocuments({ userId: uid, deletedAt: null, isFavorite: true }),
    Note.countDocuments({ userId: uid, deletedAt: null, createdAt: { $gte: weekAgo } }),
    Note.find({ userId: uid, deletedAt: null })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title updatedAt isArchived')
      .populate('categoryId', 'name color'),
    Note.find({ userId: uid, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .populate('categoryId', 'name color'),
    Note.aggregate([
      { $match: { userId: uid, deletedAt: null, categoryId: { $ne: null } } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', color: '$category.color', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    stats: { totalActive, totalArchived, totalTrashed, totalPinned, totalFavorite, createdThisWeek },
    recentlyUpdated,
    recentlyCreated,
    byCategory,
  };
}

export async function getActivityChart(userId: string, days: number = 7) {
  const uid = new Types.ObjectId(userId);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await ActivityEvent.aggregate([
    {
      $match: {
        userId: uid,
        createdAt: { $gte: since },
        eventType: { $in: ['note_created', 'note_updated', 'note_archived', 'note_deleted'] },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          eventType: '$eventType',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Fill all dates in range
  const dateMap: Record<string, Record<string, number>> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dateMap[key] = { note_created: 0, note_updated: 0, note_archived: 0, note_deleted: 0 };
  }

  for (const event of events) {
    const { date, eventType } = event._id;
    if (dateMap[date]) {
      dateMap[date][eventType] = event.count;
    }
  }

  return Object.entries(dateMap).map(([date, counts]) => ({ date, ...counts }));
}
