import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Note } from '../src/models/Note';
import { Category } from '../src/models/Category';
import { Tag } from '../src/models/Tag';
import { AuditLog } from '../src/models/AuditLog';
import { SystemSetting } from '../src/models/SystemSetting';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/notespace_admin_test';

describe('NoteSpace Admin Dashboard & Security Suite', () => {
  let app: ReturnType<typeof createApp>;
  let adminToken: string;
  let adminUserId: string;
  let regularToken: string;
  let regularUserId: string;
  let testNoteId: string;
  let testCategoryId: string;
  let testTagId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI);

    // Clean test collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    app = createApp();

    // 1. Seed Administrator
    const adminPassHash = await bcrypt.hash('AdminPassword123!', 10);
    const adminUser = await User.create({
      name: 'Root Administrator',
      email: 'admin_test@notespace.io',
      passwordHash: adminPassHash,
      role: 'admin',
      status: 'active',
      lastActiveAt: new Date(),
    });
    adminUserId = String(adminUser._id);

    // 2. Seed Regular User
    const userPassHash = await bcrypt.hash('UserPassword123!', 10);
    const regularUser = await User.create({
      name: 'Regular Customer',
      email: 'user_test@notespace.io',
      passwordHash: userPassHash,
      role: 'user',
      status: 'active',
      lastActiveAt: new Date(),
    });
    regularUserId = String(regularUser._id);

    // 3. Obtain Tokens via Login
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin_test@notespace.io', password: 'AdminPassword123!' });
    adminToken = adminLoginRes.body.data.accessToken;

    const userLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user_test@notespace.io', password: 'UserPassword123!' });
    regularToken = userLoginRes.body.data.accessToken;

    // 4. Seed Test Category & Tag for the regular user
    const cat = await Category.create({
      userId: regularUser._id,
      name: 'Design Systems',
      color: '#3b82f6',
    });
    testCategoryId = String(cat._id);

    const tag = await Tag.create({
      userId: regularUser._id,
      name: 'react',
    });
    testTagId = String(tag._id);

    // 5. Seed Test Note for the regular user
    const note = await Note.create({
      userId: regularUser._id,
      title: 'Top Secret Engineering Roadmap',
      content: 'Confidential client architecture plan and deployment keys.',
      categoryId: cat._id,
      tags: [tag._id],
      isPinned: true,
      isFavorite: false,
    });
    testNoteId = String(note._id);
  });

  afterAll(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await mongoose.disconnect();
  });

  describe('1. Role-Based Authorization & Security Defenses', () => {
    it('blocks unauthenticated requests to /api/v1/admin/*', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects regular users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('allows verified administrators to access /api/v1/admin/*', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('cards');
      expect(res.body.data).toHaveProperty('charts');
    });
  });

  describe('2. Admin Dashboard & Analytics APIs', () => {
    it('returns all 8 real-time MongoDB statistics cards', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard?days=7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { cards } = res.body.data;
      expect(cards.totalUsers).toBeGreaterThanOrEqual(2);
      expect(cards.activeUsers).toBeGreaterThanOrEqual(1);
      expect(cards.totalNotes).toBeGreaterThanOrEqual(1);
      expect(cards.notesToday).toBeGreaterThanOrEqual(1);
      expect(cards.notesInTrash).toBe(0);
      expect(cards.totalCategories).toBeGreaterThanOrEqual(1);
      expect(cards.newRegistrations).toBeGreaterThanOrEqual(2);
      expect(cards).toHaveProperty('recentAlertsCount');
    });

    it('returns chart arrays for analytics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard?days=30')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const { charts } = res.body.data;
      expect(charts.userRegistrations).toBeInstanceOf(Array);
      expect(charts.notesCreated).toBeInstanceOf(Array);
      expect(charts.categoryDistribution).toBeInstanceOf(Array);
      expect(charts.accountStatusBreakdown).toBeInstanceOf(Array);
    });
  });

  describe('3. User Management APIs', () => {
    it('lists users with server-side pagination and note counts', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users).toBeInstanceOf(Array);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(2);

      const target = res.body.data.users.find((u: any) => u._id === regularUserId);
      expect(target).toBeDefined();
      expect(target.noteCount).toBe(1);
    });

    it('retrieves detailed user statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('user_test@notespace.io');
      expect(res.body.data.stats.noteCount).toBe(1);
      expect(res.body.data.stats.categoryCount).toBe(1);
      expect(res.body.data.stats.tagCount).toBe(1);
    });

    it('toggles user account status between active and suspended', async () => {
      // Suspend user
      const suspendRes = await request(app)
        .patch(`/api/v1/admin/users/${regularUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.user.status).toBe('suspended');

      // Verify suspended user cannot log in
      const failedLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user_test@notespace.io', password: 'UserPassword123!' });
      expect(failedLogin.status).toBe(403);

      // Reactivate user
      const activateRes = await request(app)
        .patch(`/api/v1/admin/users/${regularUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });

      expect(activateRes.status).toBe(200);
      expect(activateRes.body.data.user.status).toBe('active');
    });

    it('prevents administrator from demoting or deleting their own account', async () => {
      const demoteSelf = await request(app)
        .patch(`/api/v1/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user' });

      expect(demoteSelf.status).toBe(400);

      const deleteSelf = await request(app)
        .delete(`/api/v1/admin/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteSelf.status).toBe(400);
    });
  });

  describe('4. Notes Oversight & Privacy Auditing', () => {
    it('lists notes with content excluded by default for privacy', async () => {
      const res = await request(app)
        .get('/api/v1/admin/notes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toBeInstanceOf(Array);
      const targetNote = res.body.data.notes.find((n: any) => n._id === testNoteId);
      expect(targetNote).toBeDefined();
      expect(targetNote.content).toBeUndefined(); // Metadata only!
    });

    it('retrieves note content when a valid justification reason is provided', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/notes/${testNoteId}?reason=Authorized+compliance+review`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.note.content).toContain('Confidential client architecture');

      // Verify an audit log entry was written for this content access
      const auditLog = await AuditLog.findOne({
        action: 'note_view_content',
        targetId: testNoteId,
      });
      expect(auditLog).toBeDefined();
      expect(auditLog?.reason).toBe('Authorized compliance review');
    });
  });

  describe('5. Categories & Tags Oversight', () => {
    it('lists all categories with owner attribution and note count', async () => {
      const res = await request(app)
        .get('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories).toBeInstanceOf(Array);
      const cat = res.body.data.categories.find((c: any) => c._id === testCategoryId);
      expect(cat).toBeDefined();
      expect(cat.name).toBe('Design Systems');
      expect(cat.noteCount).toBe(1);
    });

    it('lists all tags with usage counts', async () => {
      const res = await request(app)
        .get('/api/v1/admin/tags')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toBeInstanceOf(Array);
      const tag = res.body.data.tags.find((t: any) => t._id === testTagId);
      expect(tag).toBeDefined();
      expect(tag.name).toBe('react');
    });
  });

  describe('6. Activity Logs & System Settings', () => {
    it('returns paginated audit trail logs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.logs).toBeInstanceOf(Array);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('fetches and updates application system settings', async () => {
      const getRes = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.settings).toHaveProperty('appName');
      expect(getRes.body.data).toHaveProperty('systemInfo');

      const patchRes = await request(app)
        .patch('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ appName: 'NoteSpace Enterprise' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.settings.appName).toBe('NoteSpace Enterprise');
    });

    it('returns system health information', async () => {
      const res = await request(app)
        .get('/api/v1/admin/health')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data).toHaveProperty('memory');
    });
  });
});
