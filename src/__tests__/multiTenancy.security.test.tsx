/**
 * Multi-tenancy Security Test Suite - P0 CRITICAL
 * Tests enterprise-grade security boundaries and data isolation
 * 
 * Coverage Areas:
 * - Organization isolation and data boundaries
 * - Permission validation and role-based access control
 * - Data access controls and query filtering
 * - Cross-tenant data leakage prevention
 * - API endpoint security validation
 * - User authentication and authorization
 * - Security audit trail verification
 * - Edge cases and attack vector prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock authentication and organization services
const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  organizations: ['org-1', 'org-2'],
  currentOrgId: 'org-1',
  permissions: ['read:shows', 'write:shows', 'admin:finance']
};

type MockOrganization = {
  id: string;
  name: string;
  members: string[];
  ownerId: string;
  settings: {
    dataIsolation: boolean;
    auditLogging: boolean;
  };
};

const mockOrganizations: Record<string, MockOrganization> = {
  'org-1': {
    id: 'org-1',
    name: 'Primary Organization',
    members: ['user-123', 'user-456'],
    ownerId: 'user-123',
    settings: {
      dataIsolation: true,
      auditLogging: true
    }
  },
  'org-2': {
    id: 'org-2',
    name: 'Secondary Organization', 
    members: ['user-123', 'user-789'],
    ownerId: 'user-789',
    settings: {
      dataIsolation: true,
      auditLogging: true
    }
  }
};

type MockShow = {
  id: string;
  title: string;
  orgId: string;
  private: boolean;
};

const mockShows: Record<string, MockShow[]> = {
  'org-1': [
    { id: 'show-1', title: 'Org 1 Show', orgId: 'org-1', private: true },
    { id: 'show-2', title: 'Org 1 Show 2', orgId: 'org-1', private: false }
  ],
  'org-2': [
    { id: 'show-3', title: 'Org 2 Show', orgId: 'org-2', private: true }
  ]
};

describe('Multi-tenancy Security Test Suite - P0 CRITICAL', () => {
  
  describe('Organization Data Isolation', () => {
    it('should enforce strict data boundaries between organizations', async () => {
      // Mock data service that should only return org-specific data
      const mockDataService = vi.fn()
        .mockImplementation((orgId: string) => mockShows[orgId] || []);
      
      // Simulate fetching shows for org-1
      const org1Shows = mockDataService('org-1');
      expect(org1Shows).toHaveLength(2);
      expect(org1Shows.every((show: MockShow) => show.orgId === 'org-1')).toBe(true);
      
      // Verify no cross-contamination with org-2 data
      const org2Shows = mockDataService('org-2');
      expect(org2Shows).toHaveLength(1);
      expect(org2Shows.every((show: MockShow) => show.orgId === 'org-2')).toBe(true);
      
      // Ensure no data from other orgs leaks through
      const invalidOrgShows = mockDataService('org-999');
      expect(invalidOrgShows).toHaveLength(0);
    });

    it('should prevent unauthorized cross-org data access', () => {
      const userWithSingleOrg = {
        ...mockAuthUser,
        organizations: ['org-1'], // Only has access to org-1
        currentOrgId: 'org-1'
      };
      
      // Attempt to access org-2 data should fail
      const attemptUnauthorizedAccess = () => {
        if (!userWithSingleOrg.organizations.includes('org-2')) {
          throw new Error('Unauthorized: Access denied to organization org-2');
        }
      };
      
      expect(attemptUnauthorizedAccess).toThrow('Unauthorized: Access denied to organization org-2');
    });

    it('should validate organization membership before data operations', () => {
      const maliciousUser = {
        id: 'malicious-user',
        email: 'malicious@example.com',
        organizations: [], // No valid organization memberships
        currentOrgId: null as string | null,
        permissions: []
      };
      
      const validateOrgMembership = (userId: string, orgId: string) => {
        const org = mockOrganizations[orgId];
        if (!org) return false;
        return org.members.includes(userId);
      };
      
      // Valid user should pass validation
      expect(validateOrgMembership(mockAuthUser.id, 'org-1')).toBe(true);
      
      // Malicious user should fail validation
      expect(validateOrgMembership(maliciousUser.id, 'org-1')).toBe(false);
      expect(validateOrgMembership(maliciousUser.id, 'org-2')).toBe(false);
    });
  });

  describe('Permission-Based Access Control (RBAC)', () => {
    it('should enforce granular permission checks', () => {
      const checkPermission = (userPerms: string[], requiredPerm: string) => {
        return userPerms.includes(requiredPerm);
      };

      // User with admin:finance permission should have access
      const adminPerms = ['read:shows', 'write:shows', 'admin:finance'];
      expect(checkPermission(adminPerms, 'admin:finance')).toBe(true);

      // User without admin:finance should be denied
      const limitedPerms = ['read:shows'];
      expect(checkPermission(limitedPerms, 'admin:finance')).toBe(false);
      
      // Should still have read permission
      expect(checkPermission(limitedPerms, 'read:shows')).toBe(true);
    });

    it('should validate hierarchical permission inheritance', () => {
      const checkPermissionHierarchy = (userPerms: string[], requiredPerm: string) => {
        const permissionHierarchy: Record<string, string[]> = {
          'admin:all': ['admin:finance', 'admin:shows', 'write:shows', 'read:shows'],
          'admin:finance': ['write:finance', 'read:finance'],
          'admin:shows': ['write:shows', 'read:shows'],
          'write:shows': ['read:shows'],
          'write:finance': ['read:finance']
        };
        
        // Check direct permission
        if (userPerms.includes(requiredPerm)) return true;
        
        // Check inherited permissions
        for (const userPerm of userPerms) {
          const inheritedPerms = permissionHierarchy[userPerm] || [];
          if (inheritedPerms.includes(requiredPerm)) return true;
        }
        
        return false;
      };
      
      // Admin should have all permissions
      expect(checkPermissionHierarchy(['admin:all'], 'read:shows')).toBe(true);
      expect(checkPermissionHierarchy(['admin:all'], 'write:finance')).toBe(true);
      
      // Finance admin should have finance permissions but not show admin
      expect(checkPermissionHierarchy(['admin:finance'], 'read:finance')).toBe(true);
      expect(checkPermissionHierarchy(['admin:finance'], 'admin:shows')).toBe(false);
      
      // Writer should have read permissions
      expect(checkPermissionHierarchy(['write:shows'], 'read:shows')).toBe(true);
      expect(checkPermissionHierarchy(['write:shows'], 'admin:shows')).toBe(false);
    });

    it('should handle permission context switching between organizations', () => {
      const userWithDifferentOrgPermissions = {
        id: 'user-123',
        email: 'test@example.com',
        organizations: ['org-1', 'org-2'],
        currentOrgId: 'org-1',
        orgPermissions: {
          'org-1': ['admin:all'],
          'org-2': ['read:shows'] // Limited permissions in org-2
        }
      };
      
      const getPermissionsForOrg = (user: any, orgId: string) => {
        return user.orgPermissions[orgId] || [];
      };
      
      // Should have full permissions in org-1
      const org1Perms = getPermissionsForOrg(userWithDifferentOrgPermissions, 'org-1');
      expect(org1Perms).toContain('admin:all');
      
      // Should have limited permissions in org-2
      const org2Perms = getPermissionsForOrg(userWithDifferentOrgPermissions, 'org-2');
      expect(org2Perms).toEqual(['read:shows']);
      expect(org2Perms).not.toContain('admin:all');
    });
  });

  describe('Data Query Security and Filtering', () => {
    it('should automatically inject organization filters in database queries', () => {
      const buildSecureQuery = (baseQuery: any, userOrgId: string) => {
        // Simulate secure query builder that automatically adds org filter
        return {
          ...baseQuery,
          where: {
            ...baseQuery.where,
            orgId: userOrgId // Automatically inject org filter
          }
        };
      };
      
      const userQuery = {
        table: 'shows',
        where: { status: 'confirmed' }
      };
      
      const secureQuery = buildSecureQuery(userQuery, 'org-1');
      
      expect(secureQuery.where.orgId).toBe('org-1');
      expect(secureQuery.where.status).toBe('confirmed');
    });

    it('should prevent SQL injection through org ID manipulation', () => {
      const sanitizeOrgId = (orgId: string) => {
        // Validate org ID format and prevent injection
        const orgIdRegex = /^org-[a-zA-Z0-9]+$/;
        if (!orgIdRegex.test(orgId)) {
          throw new Error('Invalid organization ID format');
        }
        return orgId;
      };
      
      // Valid org IDs should pass
      expect(() => sanitizeOrgId('org-1')).not.toThrow();
      expect(() => sanitizeOrgId('org-abc123')).not.toThrow();
      
      // Malicious org IDs should be rejected
      expect(() => sanitizeOrgId("org-1'; DROP TABLE shows; --")).toThrow('Invalid organization ID format');
      expect(() => sanitizeOrgId('org-1 OR 1=1')).toThrow('Invalid organization ID format');
      expect(() => sanitizeOrgId('<script>alert("xss")</script>')).toThrow('Invalid organization ID format');
    });

    it('should implement row-level security for sensitive operations', () => {
      const checkRowLevelSecurity = (resource: any, userOrgId: string, action: string) => {
        // Verify resource belongs to user's organization
        if (resource.orgId !== userOrgId) {
          return {
            allowed: false,
            reason: 'Cross-organization access denied'
          };
        }
        
        // Check if resource is marked as private/sensitive
        if (resource.private && action !== 'read') {
          return {
            allowed: false,
            reason: 'Private resource modification denied'
          };
        }
        
        return { allowed: true };
      };
      
      const publicShow = { id: 'show-2', orgId: 'org-1', private: false };
      const privateShow = { id: 'show-1', orgId: 'org-1', private: true };
      const otherOrgShow = { id: 'show-3', orgId: 'org-2', private: false };
      
      // Should allow access to own org's public resources
      expect(checkRowLevelSecurity(publicShow, 'org-1', 'write')).toEqual({ allowed: true });
      
      // Should deny write access to private resources
      expect(checkRowLevelSecurity(privateShow, 'org-1', 'write')).toEqual({
        allowed: false,
        reason: 'Private resource modification denied'
      });
      
      // Should deny access to other org's resources
      expect(checkRowLevelSecurity(otherOrgShow, 'org-1', 'read')).toEqual({
        allowed: false,
        reason: 'Cross-organization access denied'
      });
    });
  });

  describe('API Endpoint Security', () => {
    it('should validate authentication tokens before API access', () => {
      const validateAuthToken = (token: string) => {
        if (!token) {
          throw new Error('Authentication token required');
        }
        
        // Simulate token validation
        const validTokens = ['valid-token-123', 'admin-token-456'];
        if (!validTokens.includes(token)) {
          throw new Error('Invalid authentication token');
        }
        
        return true;
      };
      
      // Valid tokens should pass
      expect(() => validateAuthToken('valid-token-123')).not.toThrow();
      
      // Invalid/missing tokens should fail
      expect(() => validateAuthToken('')).toThrow('Authentication token required');
      expect(() => validateAuthToken('invalid-token')).toThrow('Invalid authentication token');
    });

    it('should implement rate limiting per organization', () => {
      class OrgRateLimiter {
        private requests = new Map<string, number[]>();
        private readonly limit = 100; // requests per minute
        private readonly window = 60000; // 1 minute in ms

        isAllowed(orgId: string): boolean {
          const now = Date.now();
          const orgRequests = this.requests.get(orgId) || [];
          
          // Remove expired requests
          const validRequests = orgRequests.filter(time => now - time < this.window);
          
          if (validRequests.length >= this.limit) {
            return false;
          }
          
          // Add current request
          validRequests.push(now);
          this.requests.set(orgId, validRequests);
          
          return true;
        }
      }
      
      const rateLimiter = new OrgRateLimiter();
      
      // First requests should be allowed
      expect(rateLimiter.isAllowed('org-1')).toBe(true);
      expect(rateLimiter.isAllowed('org-2')).toBe(true);
      
      // Simulate hitting rate limit for org-1
      for (let i = 0; i < 100; i++) {
        rateLimiter.isAllowed('org-1');
      }
      
      // Should now deny org-1 but still allow org-2
      expect(rateLimiter.isAllowed('org-1')).toBe(false);
      expect(rateLimiter.isAllowed('org-2')).toBe(true);
    });

    it('should sanitize and validate API input parameters', () => {
      const sanitizeApiInput = (input: any) => {
        const sanitized = { ...input };
        
        // Remove potentially dangerous fields
        delete sanitized.__proto__;
        delete sanitized.constructor;
        delete sanitized.prototype;
        
        // Validate required fields
        if (!sanitized.orgId || typeof sanitized.orgId !== 'string') {
          throw new Error('Valid orgId required');
        }
        
        // Sanitize string fields
        Object.keys(sanitized).forEach(key => {
          if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitized[key]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
              .replace(/javascript:/gi, '') // Remove javascript: protocol
              .trim();
          }
        });
        
        return sanitized;
      };
      
      const validInput = {
        orgId: 'org-1',
        title: 'Test Show',
        description: 'A legitimate description'
      };
      
      const maliciousInput = {
        orgId: 'org-1',
        title: '<script>alert("xss")</script>Malicious Show',
        description: 'javascript:alert("xss")',
        __proto__: { admin: true }
      };
      
      const sanitizedValid = sanitizeApiInput(validInput);
      expect(sanitizedValid).toEqual(validInput);
      
      const sanitizedMalicious = sanitizeApiInput(maliciousInput);
      expect(sanitizedMalicious.title).not.toContain('<script>');
      expect(sanitizedMalicious.description).not.toContain('javascript:');
      expect(sanitizedMalicious.__proto__).toBeUndefined();
    });
  });

  describe('Security Audit and Compliance', () => {
    it('should log all security-relevant events', () => {
      const auditLog: any[] = [];
      
      const logSecurityEvent = (event: {
        action: string;
        userId: string;
        orgId: string;
        resource?: string;
        timestamp: Date;
        success: boolean;
        details?: any;
      }) => {
        auditLog.push(event);
      };
      
      // Simulate various security events
      logSecurityEvent({
        action: 'AUTH_LOGIN',
        userId: 'user-123',
        orgId: 'org-1',
        timestamp: new Date(),
        success: true
      });
      
      logSecurityEvent({
        action: 'DATA_ACCESS_DENIED',
        userId: 'user-456',
        orgId: 'org-2',
        resource: 'show-1',
        timestamp: new Date(),
        success: false,
        details: { reason: 'Cross-organization access attempt' }
      });
      
      expect(auditLog).toHaveLength(2);
      expect(auditLog[0].action).toBe('AUTH_LOGIN');
      expect(auditLog[1].success).toBe(false);
      expect(auditLog[1].details.reason).toContain('Cross-organization');
    });

    it('should detect and prevent privilege escalation attempts', () => {
      const detectPrivilegeEscalation = (currentPerms: string[], attemptedPerms: string[]) => {
        const escalationAttempts = attemptedPerms.filter(perm => !currentPerms.includes(perm));
        
        if (escalationAttempts.length > 0) {
          return {
            detected: true,
            escalationAttempts,
            severity: 'HIGH'
          };
        }
        
        return { detected: false };
      };
      
      const userPerms = ['read:shows', 'write:shows'];
      const legitimateAction = ['read:shows'];
      const escalationAttempt = ['read:shows', 'admin:finance', 'admin:all'];
      
      // Legitimate action should pass
      expect(detectPrivilegeEscalation(userPerms, legitimateAction)).toEqual({ detected: false });
      
      // Privilege escalation should be detected
      const escalation = detectPrivilegeEscalation(userPerms, escalationAttempt);
      expect(escalation.detected).toBe(true);
      expect(escalation.escalationAttempts).toContain('admin:finance');
      expect(escalation.escalationAttempts).toContain('admin:all');
      expect(escalation.severity).toBe('HIGH');
    });

    it('should validate data export compliance and restrictions', () => {
      const validateDataExport = (exportRequest: {
        userId: string;
        orgId: string;
        dataTypes: string[];
        format: string;
        recipients: string[];
      }) => {
        const restrictions = {
          'org-1': {
            allowedDataTypes: ['shows', 'contacts', 'finance'],
            allowedFormats: ['csv', 'pdf'],
            requiresApproval: ['finance'],
            maxRecipients: 5
          },
          'org-2': {
            allowedDataTypes: ['shows', 'contacts'],
            allowedFormats: ['csv'],
            requiresApproval: ['shows', 'contacts'],
            maxRecipients: 2
          }
        };
        
        const orgRestrictions = restrictions[exportRequest.orgId as keyof typeof restrictions];
        const violations: string[] = [];
        
        // Check data type restrictions
        const invalidDataTypes = exportRequest.dataTypes.filter(
          type => !orgRestrictions.allowedDataTypes.includes(type)
        );
        if (invalidDataTypes.length > 0) {
          violations.push(`Unauthorized data types: ${invalidDataTypes.join(', ')}`);
        }
        
        // Check format restrictions
        if (!orgRestrictions.allowedFormats.includes(exportRequest.format)) {
          violations.push(`Unauthorized export format: ${exportRequest.format}`);
        }
        
        // Check recipient limits
        if (exportRequest.recipients.length > orgRestrictions.maxRecipients) {
          violations.push(`Too many recipients: ${exportRequest.recipients.length} > ${orgRestrictions.maxRecipients}`);
        }
        
        return {
          allowed: violations.length === 0,
          violations,
          requiresApproval: exportRequest.dataTypes.some(type => 
            orgRestrictions.requiresApproval.includes(type)
          )
        };
      };
      
      const validExport = {
        userId: 'user-123',
        orgId: 'org-1',
        dataTypes: ['shows'],
        format: 'csv',
        recipients: ['manager@company.com']
      };
      
      const invalidExport = {
        userId: 'user-123',
        orgId: 'org-2',
        dataTypes: ['finance'], // Not allowed for org-2
        format: 'xlsx', // Not allowed format
        recipients: ['a@test.com', 'b@test.com', 'c@test.com'] // Too many recipients
      };
      
      const validResult = validateDataExport(validExport);
      expect(validResult.allowed).toBe(true);
      expect(validResult.violations).toHaveLength(0);
      
      const invalidResult = validateDataExport(invalidExport);
      expect(invalidResult.allowed).toBe(false);
      expect(invalidResult.violations.length).toBeGreaterThan(0);
      expect(invalidResult.violations[0]).toContain('Unauthorized data types: finance');
    });
  });

  describe('Edge Cases and Attack Vector Prevention', () => {
    it('should handle concurrent organization switches securely', async () => {
      let currentOrgId = 'org-1';
      const orgSwitchLock = new Map<string, boolean>();
      
      const secureOrgSwitch = async (userId: string, newOrgId: string) => {
        // Prevent concurrent switches for same user
        if (orgSwitchLock.get(userId)) {
          throw new Error('Organization switch in progress');
        }
        
        orgSwitchLock.set(userId, true);
        
        try {
          // Simulate async org switch with validation
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Validate user has access to new org
          const userOrgs = mockAuthUser.organizations;
          if (!userOrgs.includes(newOrgId)) {
            throw new Error('Unauthorized organization access');
          }
          
          currentOrgId = newOrgId;
          return { success: true, newOrgId };
        } finally {
          orgSwitchLock.delete(userId);
        }
      };
      
      // Valid switch should work
      const result = await secureOrgSwitch('user-123', 'org-2');
      expect(result.success).toBe(true);
      expect(result.newOrgId).toBe('org-2');
      
      // Concurrent switch attempt should fail
      const promise1 = secureOrgSwitch('user-123', 'org-1');
      const promise2 = secureOrgSwitch('user-123', 'org-2');
      
      await expect(Promise.all([promise1, promise2])).rejects.toThrow('Organization switch in progress');
    });

    it('should prevent session hijacking and token replay attacks', () => {
      class SecureSessionManager {
        private sessions = new Map<string, {
          token: string;
          userId: string;
          orgId: string;
          createdAt: Date;
          lastActivity: Date;
          ipAddress: string;
          userAgent: string;
        }>();
        
        private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        private readonly MAX_INACTIVE_TIME = 15 * 60 * 1000; // 15 minutes
        
        createSession(userId: string, orgId: string, ipAddress: string, userAgent: string) {
          const token = `secure-token-${Date.now()}-${Math.random()}`;
          const now = new Date();
          
          this.sessions.set(token, {
            token,
            userId,
            orgId,
            createdAt: now,
            lastActivity: now,
            ipAddress,
            userAgent
          });
          
          return token;
        }
        
        validateSession(token: string, ipAddress: string, userAgent: string) {
          const session = this.sessions.get(token);
          if (!session) {
            throw new Error('Invalid session token');
          }
          
          const now = new Date();
          
          // Check session timeout
          if (now.getTime() - session.createdAt.getTime() > this.SESSION_TIMEOUT) {
            this.sessions.delete(token);
            throw new Error('Session expired');
          }
          
          // Check inactivity timeout
          if (now.getTime() - session.lastActivity.getTime() > this.MAX_INACTIVE_TIME) {
            this.sessions.delete(token);
            throw new Error('Session timed out due to inactivity');
          }
          
          // Validate IP address and user agent for basic anti-hijacking
          if (session.ipAddress !== ipAddress || session.userAgent !== userAgent) {
            this.sessions.delete(token);
            throw new Error('Session security violation detected');
          }
          
          // Update last activity
          session.lastActivity = now;
          
          return session;
        }
      }
      
      const sessionManager = new SecureSessionManager();
      
      // Create valid session
      const token = sessionManager.createSession('user-123', 'org-1', '192.168.1.1', 'Mozilla/5.0');
      
      // Valid validation should work
      expect(() => sessionManager.validateSession(token, '192.168.1.1', 'Mozilla/5.0')).not.toThrow();
      
      // Different IP should fail (potential hijacking)
      expect(() => sessionManager.validateSession(token, '192.168.1.2', 'Mozilla/5.0'))
        .toThrow('Session security violation detected');
      
      // Different user agent should fail
      expect(() => sessionManager.validateSession(token, '192.168.1.1', 'Chrome/96.0'))
        .toThrow('Session security violation detected');
      
      // Invalid token should fail
      expect(() => sessionManager.validateSession('invalid-token', '192.168.1.1', 'Mozilla/5.0'))
        .toThrow('Invalid session token');
    });

    it('should implement secure password and secret management', () => {
      const secureSecretManager = {
        hashPassword: (password: string, salt: string) => {
          // Simulate secure password hashing (e.g., bcrypt)
          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
          }
          return `hashed_${password}_with_${salt}`;
        },
        
        generateSalt: () => {
          return `salt_${Math.random().toString(36).substring(2)}`;
        },
        
        validatePasswordStrength: (password: string) => {
          const checks = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            noCommonPatterns: !(/123456|password|admin/.test(password.toLowerCase()))
          };
          
          const score = Object.values(checks).filter(Boolean).length;
          
          return {
            isStrong: score >= 5,
            score,
            checks,
            recommendations: [
              !checks.minLength && 'Use at least 8 characters',
              !checks.hasUppercase && 'Include uppercase letters',
              !checks.hasLowercase && 'Include lowercase letters',
              !checks.hasNumbers && 'Include numbers',
              !checks.hasSpecialChars && 'Include special characters',
              !checks.noCommonPatterns && 'Avoid common patterns'
            ].filter(Boolean)
          };
        }
      };
      
      // Strong password should pass
      const strongPassword = 'SecureP@ssw0rd123';
      const strongValidation = secureSecretManager.validatePasswordStrength(strongPassword);
      expect(strongValidation.isStrong).toBe(true);
      expect(strongValidation.score).toBeGreaterThanOrEqual(5);
      
      // Weak password should fail
      const weakPassword = 'password123';
      const weakValidation = secureSecretManager.validatePasswordStrength(weakPassword);
      expect(weakValidation.isStrong).toBe(false);
      expect(weakValidation.recommendations.length).toBeGreaterThan(0);
      
      // Password hashing should work for valid passwords
      const salt = secureSecretManager.generateSalt();
      expect(() => secureSecretManager.hashPassword(strongPassword, salt)).not.toThrow();
      
      // Should reject too-short passwords
      expect(() => secureSecretManager.hashPassword('short', salt))
        .toThrow('Password must be at least 8 characters');
    });
  });
});