import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshSession } from '../models/RefreshSession.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { AuditLog } from '../models/AuditLog.js';
import { Note } from '../models/Note.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { getDashboardSummary, getActivityChart } from '../modules/dashboard/dashboard.service.js';
import { getDashboardStats } from '../modules/admin/admin.service.js';

interface CheckResult {
  category: string;
  condition: string;
  status: 'PASSED' | 'FAILED';
  details?: Record<string, unknown> | string;
  error?: string;
  durationMs: number;
}

const results: CheckResult[] = [];

async function runCheck(
  category: string,
  condition: string,
  fn: () => Promise<Record<string, unknown> | string | void>
) {
  const start = Date.now();
  try {
    const details = await fn();
    results.push({
      category,
      condition,
      status: 'PASSED',
      details: details || 'OK',
      durationMs: Date.now() - start,
    });
  } catch (err: unknown) {
    results.push({
      category,
      condition,
      status: 'FAILED',
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    });
  }
}

async function verifyAll() {
  console.log('='.repeat(70));
  console.log('  NoteSpace Comprehensive Database Connectivity & Conditions Check');
  console.log('='.repeat(70));
  console.log(`Target URI: ${env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***@')}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('-'.repeat(70));

  const testSuffix = `test_${Date.now()}`;
  let testUserId: Types.ObjectId | null = null;
  let testCategoryId: Types.ObjectId | null = null;
  let testNoteId: Types.ObjectId | null = null;
  let testSessionId: Types.ObjectId | null = null;

  try {
    // 1. Connection & Ping Check
    await runCheck('Connection', 'MongoDB Connection & Ping', async () => {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      const db = mongoose.connection.db;
      if (!db) throw new Error('Database object not available');
      const pingResult = await db.command({ ping: 1 });
      const serverInfo = await db.command({ buildInfo: 1 });
      return {
        ping: pingResult.ok === 1 ? 'pong' : 'failed',
        dbName: mongoose.connection.name,
        mongoVersion: serverInfo.version,
        readyState: mongoose.connection.readyState,
      };
    });

    // 2. Schema Indexes Verification
    await runCheck('Schema & Indexes', 'Index synchronization for all models', async () => {
      const models = [User, RefreshSession, ActivityEvent, AuditLog, Note, Category, Tag, SystemSetting];
      const indexSummary: Record<string, string[]> = {};
      for (const m of models) {
        await m.syncIndexes();
        const indexes = await m.collection.indexes();
        indexSummary[m.modelName] = indexes.map((i) => Object.keys(i.key).join(', '));
      }
      return { verifiedModelsCount: models.length, models: Object.keys(indexSummary) };
    });

    // 3. System Settings Check
    await runCheck('Admin / System', 'SystemSetting existence & configuration', async () => {
      let settings = await SystemSetting.findOne();
      if (!settings) {
        settings = await SystemSetting.create({
          appName: 'NoteSpace',
          allowRegistration: true,
          maintenanceMode: false,
        });
      }
      return {
        appName: settings.appName,
        allowRegistration: settings.allowRegistration,
        maintenanceMode: settings.maintenanceMode,
        maxNotesPerUser: settings.maxNotesPerUser,
      };
    });

    // 4. Registration & User Creation Condition
    await runCheck('Auth / Login', 'User registration and password hashing storage', async () => {
      const testEmail = `${testSuffix}@example.com`;
      const passwordHash = await bcrypt.hash('TestPassword123!', 10);
      const user = await User.create({
        name: 'DB Connectivity Tester',
        email: testEmail,
        passwordHash,
        role: 'user',
        status: 'active',
        lastActiveAt: new Date(),
      });
      testUserId = user._id;

      // Ensure passwordHash is not returned by default
      const queriedUser = await User.findById(user._id);
      const userJson = queriedUser?.toJSON() as Record<string, unknown> | undefined;
      const hashHidden = userJson && !userJson['passwordHash'];

      // Query with explicit select to ensure login verification works
      const userWithHash = await User.findById(user._id).select('+passwordHash');
      const canVerifyPassword = userWithHash && (await bcrypt.compare('TestPassword123!', userWithHash.passwordHash));

      return {
        userId: String(user._id),
        email: user.email,
        passwordHashProtected: hashHidden,
        bcryptVerification: canVerifyPassword,
      };
    });

    // 5. Unique constraint enforcement
    await runCheck('Auth / Login', 'Unique email index constraint enforcement', async () => {
      if (!testUserId) throw new Error('Test user not found');
      const testEmail = `${testSuffix}@example.com`;
      try {
        await User.create({
          name: 'Duplicate User',
          email: testEmail,
          passwordHash: 'dummyhash',
        });
        throw new Error('Duplicate email creation was allowed, unique constraint missing!');
      } catch (err: unknown) {
        const error = err as { code?: number; message?: string };
        if (error.code === 11000 || (error.message && error.message.includes('duplicate key'))) {
          return 'Correctly rejected duplicate email (E11000)';
        }
        throw err;
      }
    });

    // 6. Session Management & Login / Logout storage
    await runCheck('Auth / Sessions', 'RefreshSession creation, expiry and revocation on logout', async () => {
      if (!testUserId) throw new Error('Test user not found');
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create login session
      const session = await RefreshSession.create({
        userId: testUserId,
        tokenHash,
        expiresAt,
        userAgent: 'NoteSpace-DB-Diagnostic/1.0 (Windows)',
        ipAddress: '127.0.0.1',
      });
      testSessionId = session._id;

      // Log login activity
      await ActivityEvent.create({
        userId: testUserId,
        eventType: 'user_login',
        meta: { ip: '127.0.0.1' },
      });

      // Simulate logout: revoke session
      await RefreshSession.updateOne({ _id: session._id }, { revokedAt: new Date() });

      // Log logout activity
      await ActivityEvent.create({
        userId: testUserId,
        eventType: 'user_logout',
        meta: { ip: '127.0.0.1' },
      });

      const updated = await RefreshSession.findById(session._id);
      return {
        sessionId: String(session._id),
        isRevoked: !!updated?.revokedAt,
        expiresAt: updated?.expiresAt?.toISOString(),
        userAgentStored: updated?.userAgent,
      };
    });

    // 7. User Dashboard - Category & Note storage conditions
    await runCheck('User Dashboard', 'Category and Note creation with relational links', async () => {
      if (!testUserId) throw new Error('Test user not found');

      // Create Category
      const cat = await Category.create({
        userId: testUserId,
        name: `TestCategory_${testSuffix}`,
        color: '#6366f1',
      });
      testCategoryId = cat._id;

      // Create Notes
      const note = await Note.create({
        userId: testUserId,
        categoryId: cat._id,
        title: 'Diagnostic Test Note',
        content: 'This note validates user dashboard metrics and aggregations.',
        plainText: 'This note validates user dashboard metrics and aggregations.',
        isPinned: true,
        isFavorite: true,
        isArchived: false,
      });
      testNoteId = note._id;

      // Record note activity
      await ActivityEvent.create({
        userId: testUserId,
        noteId: note._id,
        eventType: 'note_created',
      });

      return {
        categoryId: String(cat._id),
        noteId: String(note._id),
        pinned: note.isPinned,
        favorite: note.isFavorite,
      };
    });

    // 8. User Dashboard - Aggregation & Metric queries
    await runCheck('User Dashboard', 'Dashboard summary and activity chart query execution', async () => {
      if (!testUserId) throw new Error('Test user not found');

      const summary = await getDashboardSummary(String(testUserId));
      const chart = await getActivityChart(String(testUserId), 7);

      if (summary.stats.totalActive < 1) {
        throw new Error(`Expected at least 1 active note, got ${summary.stats.totalActive}`);
      }
      if (summary.stats.totalPinned < 1) {
        throw new Error(`Expected at least 1 pinned note, got ${summary.stats.totalPinned}`);
      }

      return {
        stats: summary.stats,
        recentCount: summary.recentlyCreated.length,
        categoryBreakdownCount: summary.byCategory.length,
        chartDaysLength: chart.length,
      };
    });

    // 9. Admin Dashboard - Aggregation & Overview queries
    await runCheck('Admin Dashboard', 'Admin dashboard statistics and trend aggregations', async () => {
      // Record sample audit log
      await AuditLog.create({
        actorId: testUserId,
        actorEmail: `${testSuffix}@example.com`,
        action: 'system_action',
        targetType: 'system',
        details: { diagnostic: true },
        status: 'success',
        ipAddress: '127.0.0.1',
      });

      const stats = await getDashboardStats(7);

      return {
        totalUsers: stats.cards.totalUsers,
        activeUsers: stats.cards.activeUsers,
        totalNotes: stats.cards.totalNotes,
        newRegistrations7d: stats.cards.newRegistrations,
        registrationTrendPoints: stats.charts.userRegistrations.length,
        notesTrendPoints: stats.charts.notesCreated.length,
        categoryDistributionCount: stats.charts.categoryDistribution.length,
        accountStatusBreakdown: stats.charts.accountStatusBreakdown,
        recentActivityCount: stats.recentActivity.length,
      };
    });
  } finally {
    // 10. Clean up test artifacts
    console.log('\nCleaning up diagnostic test entities...');
    try {
      if (testNoteId) await Note.deleteMany({ _id: testNoteId });
      if (testCategoryId) await Category.deleteMany({ _id: testCategoryId });
      if (testUserId) {
        await ActivityEvent.deleteMany({ userId: testUserId });
        await RefreshSession.deleteMany({ userId: testUserId });
        await AuditLog.deleteMany({ actorId: testUserId });
        await User.deleteMany({ _id: testUserId });
      }
      console.log('Cleaned up diagnostic records successfully.');
    } catch (cleanupErr) {
      console.warn('Warning during cleanup:', cleanupErr);
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Database disconnected.');
    }
  }

  // Output Results Table
  console.log('\n' + '='.repeat(70));
  console.log('  DIAGNOSTIC TEST RESULTS');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const symbol = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`${symbol} [${r.category.padEnd(16)}] ${r.condition.padEnd(42)} (${r.durationMs}ms)`);
    if (r.status === 'FAILED') {
      failed++;
      console.log(`     Error: ${r.error}`);
    } else {
      passed++;
      if (typeof r.details === 'object') {
        const compact = JSON.stringify(r.details);
        console.log(`     Details: ${compact.length > 100 ? compact.slice(0, 97) + '...' : compact}`);
      } else {
        console.log(`     Details: ${r.details}`);
      }
    }
  }

  console.log('-'.repeat(70));
  console.log(`Summary: ${passed} passed, ${failed} failed, total ${results.length} conditions tested.`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifyAll();
