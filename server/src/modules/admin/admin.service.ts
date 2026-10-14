import { Types } from 'mongoose';
import os from 'os';
import { User } from '../../models/User.js';
import { Note } from '../../models/Note.js';
import { Category } from '../../models/Category.js';
import { Tag } from '../../models/Tag.js';
import { AuditLog } from '../../models/AuditLog.js';
import { SystemSetting } from '../../models/SystemSetting.js';
import { RefreshSession } from '../../models/RefreshSession.js';
import { createError } from '../../middleware/error-handler.js';
import { logAudit } from './audit.service.js';

/**
 * 1. Admin Dashboard Statistics & Analytics
 */
export async function getDashboardStats(days: number = 7) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rangeAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalNotes,
    notesToday,
    notesInTrash,
    totalCategories,
    newRegistrations,
    recentAlertsCount,
    setting,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active', lastActiveAt: { $gte: thirtyDaysAgo } }),
    Note.countDocuments({ deletedAt: null }),
    Note.countDocuments({ deletedAt: null, createdAt: { $gte: startOfDay } }),
    Note.countDocuments({ deletedAt: { $ne: null } }),
    Category.countDocuments(),
    User.countDocuments({ createdAt: { $gte: rangeAgo } }),
    AuditLog.countDocuments({ status: 'failure', createdAt: { $gte: rangeAgo } }),
    SystemSetting.findOne(),
  ]);

  // Daily User Registrations Trend
  const userRegistrationTrend = await User.aggregate([
    { $match: { createdAt: { $gte: rangeAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Daily Notes Created Trend
  const notesCreatedTrend = await Note.aggregate([
    { $match: { createdAt: { $gte: rangeAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Distribution of Notes by Category
  const categoryDistribution = await Note.aggregate([
    { $match: { deletedAt: null, categoryId: { $ne: null } } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
    { $unwind: '$cat' },
    { $project: { name: '$cat.name', color: '$cat.color', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  // Active vs Inactive accounts
  const suspendedUsers = await User.countDocuments({ status: 'suspended' });
  const inactiveUsers = await User.countDocuments({
    status: 'active',
    $or: [{ lastActiveAt: { $lt: thirtyDaysAgo } }, { lastActiveAt: null }],
  });

  const accountStatusBreakdown = [
    { name: 'Active (Past 30d)', count: activeUsers, color: '#10b981' },
    { name: 'Inactive (>30d)', count: inactiveUsers, color: '#f59e0b' },
    { name: 'Suspended', count: suspendedUsers, color: '#ef4444' },
  ];

  // Recent administrative activity
  const recentActivity = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return {
    cards: {
      totalUsers,
      activeUsers,
      totalNotes,
      notesToday,
      notesInTrash,
      totalCategories,
      newRegistrations,
      recentAlertsCount,
      maintenanceMode: setting?.maintenanceMode ?? false,
    },
    charts: {
      userRegistrations: userRegistrationTrend.map((u) => ({ date: u._id, count: u.count })),
      notesCreated: notesCreatedTrend.map((n) => ({ date: n._id, count: n.count })),
      categoryDistribution,
      accountStatusBreakdown,
    },
    recentActivity,
  };
}

/**
 * 2. User Management
 */
export async function listUsers(query: {
  search?: string;
  role?: string;
  status?: string;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}) {
  const filter: Record<string, unknown> = {};

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
    ];
  }

  if (query.role && query.role !== 'all') {
    filter.role = query.role;
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sortObj: Record<string, 1 | -1> = { [query.sort]: sortOrder };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sortObj)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Enrich with note counts
  const userIds = users.map((u) => u._id);
  const noteCounts = await Note.aggregate([
    { $match: { userId: { $in: userIds }, deletedAt: null } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  const noteCountMap = new Map(noteCounts.map((nc) => [String(nc._id), nc.count]));

  const enrichedUsers = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    lastActiveAt: u.lastActiveAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    noteCount: noteCountMap.get(String(u._id)) || 0,
  }));

  return {
    users: enrichedUsers,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getUserDetails(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw createError('Invalid user ID format', 400);

  const uid = new Types.ObjectId(userId);
  const user = await User.findById(uid).lean();
  if (!user) throw createError('User not found', 404);

  const [noteCount, trashedNoteCount, categoryCount, tagCount, recentNotes] = await Promise.all([
    Note.countDocuments({ userId: uid, deletedAt: null }),
    Note.countDocuments({ userId: uid, deletedAt: { $ne: null } }),
    Category.countDocuments({ userId: uid }),
    Tag.countDocuments({ userId: uid }),
    Note.find({ userId: uid, deletedAt: null }).sort({ updatedAt: -1 }).limit(5).select('title updatedAt isPinned isFavorite'),
  ]);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    stats: {
      noteCount,
      trashedNoteCount,
      categoryCount,
      tagCount,
    },
    recentNotes,
  };
}

export async function updateUserRole(adminUserId: string, targetUserId: string, newRole: 'user' | 'admin', ip: string = '') {
  if (!Types.ObjectId.isValid(targetUserId)) throw createError('Invalid user ID', 400);

  const target = await User.findById(targetUserId);
  if (!target) throw createError('Target user not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Security Guard: Prevent demoting oneself if they are the admin
  if (String(adminUserId) === String(targetUserId) && newRole !== 'admin') {
    throw createError('You cannot remove administrative privileges from your own account', 400);
  }

  // Security Guard: Prevent demoting the last active administrator
  if (target.role === 'admin' && newRole === 'user') {
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1) {
      throw createError('Cannot demote the sole active administrator in the system', 400);
    }
  }

  const oldRole = target.role;
  target.role = newRole;
  await target.save();

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'user_role_change',
    targetType: 'user',
    targetId: String(target._id),
    details: { oldRole, newRole, targetEmail: target.email },
    ipAddress: ip,
    status: 'success',
  });

  return { user: target };
}

export async function updateUserStatus(adminUserId: string, targetUserId: string, newStatus: 'active' | 'suspended', ip: string = '') {
  if (!Types.ObjectId.isValid(targetUserId)) throw createError('Invalid user ID', 400);

  // Security Guard: Prevent suspending oneself
  if (String(adminUserId) === String(targetUserId)) {
    throw createError('You cannot suspend your own account', 400);
  }

  const target = await User.findById(targetUserId);
  if (!target) throw createError('Target user not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Security Guard: Prevent suspending the last active administrator
  if (target.role === 'admin' && newStatus === 'suspended') {
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1) {
      throw createError('Cannot suspend the sole active administrator in the system', 400);
    }
  }

  const oldStatus = target.status;
  target.status = newStatus;
  await target.save();

  // If suspended, revoke all active refresh tokens for the user
  if (newStatus === 'suspended') {
    await RefreshSession.updateMany(
      { userId: target._id, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'user_status_change',
    targetType: 'user',
    targetId: String(target._id),
    details: { oldStatus, newStatus, targetEmail: target.email },
    ipAddress: ip,
    status: 'success',
  });

  return { user: target };
}

export async function deleteUser(adminUserId: string, targetUserId: string, ip: string = '') {
  if (!Types.ObjectId.isValid(targetUserId)) throw createError('Invalid user ID', 400);

  // Security Guard: Cannot delete oneself
  if (String(adminUserId) === String(targetUserId)) {
    throw createError('You cannot delete your own account from the admin dashboard', 400);
  }

  const target = await User.findById(targetUserId);
  if (!target) throw createError('User not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Security Guard: Prevent deleting the last active admin
  if (target.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1) {
      throw createError('Cannot delete the sole active administrator', 400);
    }
  }

  const uid = target._id;
  const targetEmail = target.email;

  // Cascade delete all user records
  await Promise.all([
    Note.deleteMany({ userId: uid }),
    Category.deleteMany({ userId: uid }),
    Tag.deleteMany({ userId: uid }),
    RefreshSession.deleteMany({ userId: uid }),
    User.findByIdAndDelete(uid),
  ]);

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'user_delete',
    targetType: 'user',
    targetId: String(uid),
    details: { deletedEmail: targetEmail },
    ipAddress: ip,
    status: 'success',
  });

  return { success: true };
}

/**
 * 3. Notes Management
 */
export async function listNotes(query: {
  search?: string;
  status?: string;
  userId?: string;
  categoryId?: string;
  page: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};

  if (query.status === 'active') {
    filter.deletedAt = null;
    filter.isArchived = false;
  } else if (query.status === 'archived') {
    filter.deletedAt = null;
    filter.isArchived = true;
  } else if (query.status === 'trashed') {
    filter.deletedAt = { $ne: null };
  }

  if (query.userId && Types.ObjectId.isValid(query.userId)) {
    filter.userId = new Types.ObjectId(query.userId);
  }

  if (query.categoryId && Types.ObjectId.isValid(query.categoryId)) {
    filter.categoryId = new Types.ObjectId(query.categoryId);
  }

  if (query.search) {
    const s = query.search.trim();
    filter.title = { $regex: s, $options: 'i' };
  }

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .select('-content') // Privacy by default: do NOT send note content in bulk list
      .populate('userId', 'name email')
      .populate('categoryId', 'name color')
      .sort({ updatedAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Note.countDocuments(filter),
  ]);

  return {
    notes,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getNoteDetails(adminUserId: string, noteId: string, reason: string, ip: string = '') {
  if (!Types.ObjectId.isValid(noteId)) throw createError('Invalid note ID', 400);

  const note = await Note.findById(noteId)
    .populate('userId', 'name email')
    .populate('categoryId', 'name color')
    .populate('tags', 'name')
    .lean();

  if (!note) throw createError('Note not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Audit Log: Record privacy access to note content
  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'note_view_content',
    targetType: 'note',
    targetId: noteId,
    details: { noteTitle: note.title, noteOwnerId: (note.userId as any)?._id },
    ipAddress: ip,
    status: 'success',
    reason,
  });

  return { note };
}

export async function deleteNote(adminUserId: string, noteId: string, ip: string = '') {
  if (!Types.ObjectId.isValid(noteId)) throw createError('Invalid note ID', 400);

  const note = await Note.findById(noteId);
  if (!note) throw createError('Note not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  await Note.findByIdAndDelete(noteId);

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'note_delete',
    targetType: 'note',
    targetId: noteId,
    details: { noteTitle: note.title, ownerId: note.userId },
    ipAddress: ip,
    status: 'success',
    reason: 'Administrative deletion',
  });

  return { success: true };
}

/**
 * 4. Categories & Tags Management
 */
export async function listAllCategories(): Promise<any[]> {
  const categories = await Category.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const catIds = categories.map((c) => c._id);
  const counts = await Note.aggregate([
    { $match: { categoryId: { $in: catIds }, deletedAt: null } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  return categories.map((c) => ({
    ...c,
    noteCount: countMap.get(String(c._id)) || 0,
  }));
}

export async function deleteCategory(adminUserId: string, categoryId: string, ip: string = '') {
  if (!Types.ObjectId.isValid(categoryId)) throw createError('Invalid category ID', 400);

  const category = await Category.findById(categoryId);
  if (!category) throw createError('Category not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Unlink category from all notes referencing it
  await Note.updateMany({ categoryId: category._id }, { $set: { categoryId: null } });
  await Category.findByIdAndDelete(categoryId);

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'category_delete',
    targetType: 'category',
    targetId: categoryId,
    details: { categoryName: category.name, ownerId: category.userId },
    ipAddress: ip,
    status: 'success',
  });

  return { success: true };
}

export async function listAllTags(): Promise<any[]> {
  const tags = await Tag.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const tagIds = tags.map((t) => t._id);
  const counts = await Note.aggregate([
    { $match: { tags: { $in: tagIds }, deletedAt: null } },
    { $unwind: '$tags' },
    { $match: { tags: { $in: tagIds } } },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((t) => [String(t._id), t.count]));

  return tags.map((t) => ({
    ...t,
    noteCount: countMap.get(String(t._id)) || 0,
  }));
}

export async function deleteTag(adminUserId: string, tagId: string, ip: string = '') {
  if (!Types.ObjectId.isValid(tagId)) throw createError('Invalid tag ID', 400);

  const tag = await Tag.findById(tagId);
  if (!tag) throw createError('Tag not found', 404);

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  // Remove tag reference from all notes
  await Note.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
  await Tag.findByIdAndDelete(tagId);

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'tag_delete',
    targetType: 'tag',
    targetId: tagId,
    details: { tagName: tag.name, ownerId: tag.userId },
    ipAddress: ip,
    status: 'success',
  });

  return { success: true };
}

/**
 * 5. Audit Logs
 */
export async function listAuditLogs(query: {
  search?: string;
  action?: string;
  targetType?: string;
  page: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};

  if (query.action) {
    filter.action = query.action;
  }

  if (query.targetType && query.targetType !== 'all') {
    filter.targetType = query.targetType;
  }

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { actorEmail: { $regex: s, $options: 'i' } },
      { action: { $regex: s, $options: 'i' } },
      { reason: { $regex: s, $options: 'i' } },
    ];
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit) || 1,
    },
  };
}

/**
 * 6. System Settings & Health
 */
export async function getSettings() {
  let settings: any = await SystemSetting.findOne().lean();
  if (!settings) {
    const created = await SystemSetting.create({
      appName: 'NoteSpace',
      allowRegistration: true,
      sessionTimeoutMinutes: 10080,
      maintenanceMode: false,
      maxNotesPerUser: 1000,
      passwordMinLength: 8,
    });
    settings = created.toJSON();
  }

  const totalUsers = await User.countDocuments();
  const totalNotes = await Note.countDocuments();

  return {
    settings,
    systemInfo: {
      nodeVersion: process.version,
      platform: `${os.type()} ${os.arch()}`,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      database: 'Connected',
      totalUsers,
      totalNotes,
    },
  };
}

export async function updateSettings(adminUserId: string, data: Partial<any>, ip: string = '') {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = new SystemSetting();
  }

  const admin = await User.findById(adminUserId);
  const adminEmail = admin?.email || 'admin@notespace.io';

  Object.assign(settings, data);
  settings.updatedBy = new Types.ObjectId(adminUserId);
  await settings.save();

  await logAudit({
    actorId: adminUserId,
    actorEmail: adminEmail,
    action: 'settings_update',
    targetType: 'settings',
    details: data,
    ipAddress: ip,
    status: 'success',
  });

  return { settings };
}

export async function getSystemHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    system: {
      loadavg: os.loadavg(),
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
    },
  };
}
