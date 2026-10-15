import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { Note } from '../models/Note.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { SystemSetting } from '../models/SystemSetting.js';

async function viewDatabase() {
  console.log('='.repeat(70));
  console.log('  NoteSpace MongoDB Live Data Viewer');
  console.log('='.repeat(70));
  console.log(`Connecting to: ${env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***@')}`);

  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database instance');
    process.exit(1);
  }

  const collections = await db.listCollections().toArray();
  console.log(`\n📁 Database: "${mongoose.connection.name}" (${collections.length} Collections Found)`);
  console.log('-'.repeat(70));

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  • ${c.name.padEnd(20)} : ${count} documents`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('  RECENT DOCUMENTS SUMMARY');
  console.log('='.repeat(70));

  // 1. Users
  const users = await User.find().select('name email role status lastActiveAt createdAt').limit(5).lean();
  console.log(`\n👤 Users (Showing first ${users.length}):`);
  console.table(
    users.map((u) => ({
      ID: String(u._id),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      LastActive: u.lastActiveAt?.toISOString().slice(0, 19).replace('T', ' '),
    }))
  );

  // 2. Refresh Sessions
  const sessions = await RefreshSession.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log(`\n🔑 Active / Recent Sessions (Showing first ${sessions.length}):`);
  console.table(
    sessions.map((s) => ({
      ID: String(s._id),
      UserId: String(s.userId),
      ExpiresAt: s.expiresAt?.toISOString().slice(0, 19).replace('T', ' '),
      Revoked: s.revokedAt ? 'Yes' : 'No (Active)',
      IP: s.ipAddress || '127.0.0.1',
    }))
  );

  // 3. Notes
  const notes = await Note.find().sort({ updatedAt: -1 }).limit(5).lean();
  console.log(`\n📝 Notes (Showing first ${notes.length}):`);
  console.table(
    notes.map((n) => ({
      ID: String(n._id),
      Title: n.title,
      Pinned: n.isPinned ? 'Yes' : 'No',
      Favorite: n.isFavorite ? 'Yes' : 'No',
      Archived: n.isArchived ? 'Yes' : 'No',
      Updated: n.updatedAt?.toISOString().slice(0, 19).replace('T', ' '),
    }))
  );

  // 4. Categories & Tags
  const [cats, tags] = await Promise.all([Category.find().limit(5).lean(), Tag.find().limit(5).lean()]);
  console.log(`\n🏷️ Categories (${cats.length}) & Tags (${tags.length}):`);
  if (cats.length > 0) {
    console.log('Categories:', cats.map((c) => `${c.name} (${c.color})`).join(', '));
  }
  if (tags.length > 0) {
    console.log('Tags:', tags.map((t) => t.name).join(', '));
  }

  // 5. Activity Events
  const events = await ActivityEvent.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log(`\n⚡ Recent Activity Events (Showing first ${events.length}):`);
  console.table(
    events.map((e) => ({
      ID: String(e._id),
      UserId: String(e.userId),
      Type: e.eventType,
      Timestamp: e.createdAt?.toISOString().slice(0, 19).replace('T', ' '),
    }))
  );

  // 6. Audit Logs
  const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log(`\n🛡️ Admin Audit Logs (Showing first ${auditLogs.length}):`);
  console.table(
    auditLogs.map((a) => ({
      Actor: a.actorEmail,
      Action: a.action,
      Target: a.targetType,
      Status: a.status,
      Timestamp: a.createdAt?.toISOString().slice(0, 19).replace('T', ' '),
    }))
  );

  // 7. System Settings
  const settings = await SystemSetting.findOne().lean();
  if (settings) {
    console.log('\n⚙️ System Setting:');
    console.log(
      `  App: ${settings.appName} | Registration: ${settings.allowRegistration} | Maintenance: ${settings.maintenanceMode} | MaxNotes: ${settings.maxNotesPerUser}`
    );
  }

  console.log('\n' + '='.repeat(70));
  await mongoose.disconnect();
  console.log('Database disconnected.');
}

viewDatabase().catch((err) => {
  console.error('Error viewing database:', err);
  process.exit(1);
});
