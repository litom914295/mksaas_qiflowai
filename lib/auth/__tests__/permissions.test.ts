import {
  PERMISSIONS,
  ROLES,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from '../permissions';

describe('Permission Utils', () => {
  describe('hasPermission', () => {
    it('should return true when user has the exact permission', () => {
      const user = {
        permissions: ['users:read', 'users:write'],
      };
      expect(hasPermission(user, 'users:read')).toBe(true);
      expect(hasPermission(user, 'users:write')).toBe(true);
    });

    it('should return false when user lacks the permission', () => {
      const user = {
        permissions: ['users:read'],
      };
      expect(hasPermission(user, 'users:write')).toBe(false);
    });

    it('should handle wildcard permissions', () => {
      const user = {
        permissions: ['users:*'],
      };
      expect(hasPermission(user, 'users:read')).toBe(true);
      expect(hasPermission(user, 'users:write')).toBe(true);
      expect(hasPermission(user, 'users:delete')).toBe(true);
    });

    it('should handle admin wildcard', () => {
      const user = {
        permissions: ['*'],
      };
      expect(hasPermission(user, 'users:read')).toBe(true);
      expect(hasPermission(user, 'orders:write')).toBe(true);
      expect(hasPermission(user, 'system:admin')).toBe(true);
    });

    it('should return false for empty permissions', () => {
      const user = {
        permissions: [],
      };
      expect(hasPermission(user, 'users:read')).toBe(false);
    });

    it('should handle undefined user', () => {
      expect(hasPermission(undefined, 'users:read')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the required permissions', () => {
      const user = {
        permissions: ['users:read', 'orders:read'],
      };
      expect(hasAnyPermission(user, ['users:write', 'users:read'])).toBe(true);
      expect(hasAnyPermission(user, ['orders:read', 'products:read'])).toBe(
        true
      );
    });

    it('should return false if user has none of the required permissions', () => {
      const user = {
        permissions: ['users:read'],
      };
      expect(hasAnyPermission(user, ['users:write', 'orders:read'])).toBe(
        false
      );
    });

    it('should handle empty required permissions', () => {
      const user = {
        permissions: ['users:read'],
      };
      expect(hasAnyPermission(user, [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all required permissions', () => {
      const user = {
        permissions: ['users:read', 'users:write', 'orders:read'],
      };
      expect(hasAllPermissions(user, ['users:read', 'users:write'])).toBe(true);
    });

    it('should return false if user lacks any required permission', () => {
      const user = {
        permissions: ['users:read', 'orders:read'],
      };
      expect(hasAllPermissions(user, ['users:read', 'users:write'])).toBe(
        false
      );
    });

    it('should handle wildcard permissions', () => {
      const user = {
        permissions: ['users:*'],
      };
      expect(hasAllPermissions(user, ['users:read', 'users:write'])).toBe(true);
    });

    it('should return true for empty required permissions', () => {
      const user = {
        permissions: ['users:read'],
      };
      expect(hasAllPermissions(user, [])).toBe(true);
    });
  });

  describe('ROLES', () => {
    it('should have well-defined role structures', () => {
      expect(ROLES.SUPER_ADMIN).toBeDefined();
      expect(ROLES.ADMIN).toBeDefined();
      expect(ROLES.OPERATOR).toBeDefined();
      expect(ROLES.USER).toBeDefined();
    });

    it('should have correct permission hierarchy', () => {
      // Super admin should have all permissions
      expect(ROLES.SUPER_ADMIN.permissions).toContain('*');

      // Admin should have more permissions than operator
      expect(ROLES.ADMIN.permissions.length).toBeGreaterThan(
        ROLES.OPERATOR.permissions.length
      );

      // Operator should have more permissions than user
      expect(ROLES.OPERATOR.permissions.length).toBeGreaterThan(
        ROLES.USER.permissions.length
      );
    });
  });

  describe('PERMISSIONS', () => {
    it('should have all permission categories', () => {
      expect(PERMISSIONS.USERS).toBeDefined();
      expect(PERMISSIONS.CONTENT).toBeDefined();
      expect(PERMISSIONS.ORDERS).toBeDefined();
      expect(PERMISSIONS.SYSTEM).toBeDefined();
      expect(PERMISSIONS.ANALYTICS).toBeDefined();
    });

    it('should have consistent permission naming', () => {
      // All user permissions should start with 'users:'
      Object.values(PERMISSIONS.USERS).forEach((permission) => {
        expect(permission).toMatch(/^users:/);
      });

      // All content permissions should start with 'content:'
      Object.values(PERMISSIONS.CONTENT).forEach((permission) => {
        expect(permission).toMatch(/^content:/);
      });
    });
  });
});
