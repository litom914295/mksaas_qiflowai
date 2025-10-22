import type { NextRequest } from 'next/server';
import { createMocks } from 'node-mocks-http';

// Mock the database module
jest.mock('@/lib/database', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  },
  users: {},
}));

// Mock the auth module
jest.mock('@/lib/auth/session', () => ({
  getCurrentSession: jest.fn(),
  hasPermission: jest.fn(),
}));

describe('/api/admin/users', () => {
  const mockDb = require('@/lib/database').db;
  const { getCurrentSession, hasPermission } = require('@/lib/auth/session');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    it('should return 403 if user is not authenticated', async () => {
      getCurrentSession.mockResolvedValueOnce(null);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/users',
      });

      const handler = (await import('@/app/api/admin/users/route')).GET;
      const response = await handler(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });

    it('should return 403 if user lacks permissions', async () => {
      getCurrentSession.mockResolvedValueOnce({ user: { id: '1' } });
      hasPermission.mockReturnValueOnce(false);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/users',
      });

      const handler = (await import('@/app/api/admin/users/route')).GET;
      const response = await handler(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('权限');
    });

    it('should return users list with pagination', async () => {
      getCurrentSession.mockResolvedValueOnce({ user: { id: '1' } });
      hasPermission.mockReturnValueOnce(true);

      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];

      mockDb.select.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.select.mockReturnThis();
      mockDb.from.mockReturnThis();
      mockDb.limit.mockReturnThis();
      mockDb.offset.mockReturnThis();
      mockDb.orderBy.mockResolvedValueOnce(mockUsers);

      const { req } = createMocks({
        method: 'GET',
        url: '/api/admin/users?page=1&limit=10',
      });

      const handler = (await import('@/app/api/admin/users/route')).GET;
      const response = await handler(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(2);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(2);
    });
  });

  describe('POST /api/admin/users', () => {
    it('should create a new user', async () => {
      getCurrentSession.mockResolvedValueOnce({ user: { id: '1' } });
      hasPermission.mockReturnValueOnce(true);

      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
      };

      const createdUser = {
        id: '3',
        ...newUser,
        createdAt: new Date().toISOString(),
      };

      mockDb.insert.mockReturnThis();
      mockDb.values.mockReturnThis();
      mockDb.returning.mockResolvedValueOnce([createdUser]);

      const { req } = createMocks({
        method: 'POST',
        url: '/api/admin/users',
        headers: { 'Content-Type': 'application/json' },
        body: newUser,
      });

      const handler = (await import('@/app/api/admin/users/route')).POST;
      const response = await handler(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(newUser.email);
      expect(data.message).toContain('创建成功');
    });

    it('should validate required fields', async () => {
      getCurrentSession.mockResolvedValueOnce({ user: { id: '1' } });
      hasPermission.mockReturnValueOnce(true);

      const invalidUser = {
        name: 'New User',
        // missing email
      };

      const { req } = createMocks({
        method: 'POST',
        url: '/api/admin/users',
        headers: { 'Content-Type': 'application/json' },
        body: invalidUser,
      });

      const handler = (await import('@/app/api/admin/users/route')).POST;
      const response = await handler(req as unknown as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.details).toBeDefined();
    });
  });
});
