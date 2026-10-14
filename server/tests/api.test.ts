import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app';

const TEST_DB_URI = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/notespace_test';

describe('NoteSpace Full API Suite', () => {
  let app: ReturnType<typeof createApp>;
  let accessToken: string;
  let userId: string;
  let categoryId: string;
  let tagId: string;
  let noteId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI);
    // Clean test database collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    app = createApp();
  });

  afterAll(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await mongoose.disconnect();
  });

  describe('Health API', () => {
    it('returns health status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication Module', () => {
    const testUser = {
      name: 'Test Engineer',
      email: `test_${Date.now()}@notespace.io`,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    };

    it('registers a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.accessToken).toBeDefined();
      userId = res.body.data.user._id;
    });

    it('rejects duplicate user registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects invalid password login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('logs in successfully and returns JWT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      accessToken = res.body.data.accessToken;
    });

    it('gets current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it('rejects unauthenticated requests to protected routes', async () => {
      const res = await request(app).get('/api/v1/notes');
      expect(res.status).toBe(401);
    });
  });

  describe('Categories & Tags Module', () => {
    it('creates a new category', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Architecture',
          color: '#3b82f6',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category.name).toBe('Architecture');
      categoryId = res.body.data.category._id;
    });

    it('lists categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories).toBeInstanceOf(Array);
      expect(res.body.data.categories.length).toBeGreaterThanOrEqual(1);
    });

    it('creates a new tag', async () => {
      const res = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'mongodb',
          color: '#10b981',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tag.name).toBe('mongodb');
      tagId = res.body.data.tag._id;
    });

    it('lists tags', async () => {
      const res = await request(app)
        .get('/api/v1/tags')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tags).toBeInstanceOf(Array);
      expect(res.body.data.tags.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Notes CRUD & Lifecycle Module', () => {
    it('creates a new note', async () => {
      const res = await request(app)
        .post('/api/v1/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'System Architecture Guidelines',
          content: 'Detailed specifications for microservices and event queues.',
          categoryId: categoryId,
          tags: [tagId],
          isPinned: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.title).toBe('System Architecture Guidelines');
      expect(res.body.data.note.isPinned).toBe(true);
      noteId = res.body.data.note._id;
    });

    it('retrieves note by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note._id).toBe(noteId);
      expect(res.body.data.note.title).toBe('System Architecture Guidelines');
    });

    it('updates note content and flags', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'System Architecture Guidelines v2',
          isFavorite: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.title).toBe('System Architecture Guidelines v2');
      expect(res.body.data.note.isFavorite).toBe(true);
    });

    it('archives the note', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${noteId}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isArchived: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.isArchived).toBe(true);
    });

    it('unarchives the note', async () => {
      const res = await request(app)
        .patch(`/api/v1/notes/${noteId}/archive`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isArchived: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.isArchived).toBe(false);
    });

    it('moves note to trash', async () => {
      const res = await request(app)
        .delete(`/api/v1/notes/${noteId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('lists note in trash', async () => {
      const res = await request(app)
        .get('/api/v1/trash')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notes).toBeInstanceOf(Array);
      expect(res.body.data.notes.some((n: any) => n._id === noteId)).toBe(true);
    });

    it('restores note from trash', async () => {
      const res = await request(app)
        .post(`/api/v1/trash/${noteId}/restore`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note.deletedAt).toBeNull();
    });
  });

  describe('Search & Dashboard Module', () => {
    it('performs search on notes', async () => {
      const res = await request(app)
        .get('/api/v1/search?q=Architecture')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notes).toBeInstanceOf(Array);
    });

    it('returns dashboard summary statistics', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('stats');
      expect(res.body.data.stats).toHaveProperty('totalActive');
      expect(res.body.data.stats).toHaveProperty('totalPinned');
      expect(res.body.data.stats).toHaveProperty('totalFavorite');
      expect(res.body.data.stats).toHaveProperty('totalArchived');
      expect(res.body.data.stats).toHaveProperty('totalTrashed');
    });

    it('returns dashboard activity trends', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/activity?days=7')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chart).toBeInstanceOf(Array);
    });
  });
});
