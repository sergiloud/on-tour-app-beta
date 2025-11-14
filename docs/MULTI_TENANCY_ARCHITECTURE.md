# Multi-Tenancy Architecture for On Tour App

## Overview

Transform the On Tour App from a single-user tool into a collaborative platform where multiple team members can manage tours together. This implements **organization-based multi-tenancy** where tours are shared resources managed by teams.

---

## Problem Statement

**Current Limitation:**
```
users/{userId}/
  ├── organizations/{orgId}/
  │   ├── finance_snapshots/{snapshotId}/
  │   │   └── transactions/{txId}
  │   ├── shows/{showId}
  │   └── calendar_events/{eventId}
```

- Data is isolated per user
- No collaboration between band members
- Tour Manager must manually share information
- No role-based permissions
- Each person maintains separate data

**Industry Reality:**
- Tours involve 5-15+ people (band, crew, manager)
- Financial data needs to be shared (settlement, expenses)
- Calendar changes affect entire team
- Travel logistics require coordination

---

## New Architecture: Organizations as First-Class Entities

### Core Concept

Organizations (tours/bands) are the **primary data containers**, not users. Users are **members** of organizations with specific roles.

### Firestore Structure

```
organizations/
  {orgId}/
    ├── [Document Fields]
    │   ├── name: string                 // "Summer Tour 2025"
    │   ├── type: "tour" | "band"        // Organization type
    │   ├── createdAt: timestamp
    │   ├── createdBy: userId            // Owner
    │   ├── settings: object
    │   │   ├── currency: string
    │   │   ├── timezone: string
    │   │   └── defaultRole: string
    │   └── metadata: object
    │       ├── startDate: timestamp     // Tour start
    │       ├── endDate: timestamp       // Tour end
    │       └── description: string
    │
    ├── members/                         // Sub-collection
    │   {userId}/
    │     ├── email: string
    │     ├── displayName: string
    │     ├── photoURL: string
    │     ├── role: "owner" | "admin" | "member" | "viewer"
    │     ├── permissions: string[]      // ["finance.read", "shows.write"]
    │     ├── joinedAt: timestamp
    │     └── invitedBy: userId
    │
    ├── shows/                           // Sub-collection
    │   {showId}/
    │     ├── venue: string
    │     ├── city: string
    │     ├── date: timestamp
    │     ├── fee: number
    │     ├── status: string
    │     ├── createdBy: userId
    │     └── updatedAt: timestamp
    │
    ├── finance_snapshots/               // Sub-collection
    │   {snapshotId}/
    │     ├── period: "YTD" | "monthly"
    │     ├── startDate: timestamp
    │     ├── endDate: timestamp
    │     ├── summary: object
    │     └── transactions/              // Nested sub-collection
    │         {txId}/
    │           ├── amount: number
    │           ├── type: "income" | "expense"
    │           ├── category: string
    │           ├── date: timestamp
    │           └── createdBy: userId
    │
    ├── calendar_events/                 // Sub-collection
    │   {eventId}/
    │     ├── title: string
    │     ├── date: timestamp
    │     ├── type: "show" | "travel" | "meeting"
    │     ├── relatedShowId?: string
    │     └── createdBy: userId
    │
    └── invitations/                     // Sub-collection
        {inviteId}/
          ├── email: string              // Invitee email
          ├── role: string               // Proposed role
          ├── status: "pending" | "accepted" | "rejected"
          ├── invitedBy: userId
          ├── createdAt: timestamp
          └── expiresAt: timestamp       // 7 days default

users/
  {userId}/
    ├── [Document Fields]
    │   ├── email: string
    │   ├── displayName: string
    │   ├── photoURL: string
    │   └── createdAt: timestamp
    │
    └── organization_memberships/        // Sub-collection (denormalized)
        {orgId}/
          ├── organizationName: string   // Cache
          ├── role: string               // Cache
          ├── lastAccessed: timestamp
          └── isFavorite: boolean
```

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```typescript
type Role = 'owner' | 'admin' | 'member' | 'viewer';

const ROLE_HIERARCHY = {
  owner: 4,    // Full control, cannot be removed
  admin: 3,    // Manage members, all data access
  member: 2,   // Edit shows/finance, no member management
  viewer: 1    // Read-only access
};
```

### Permission Matrix

| Resource              | Owner | Admin | Member | Viewer |
|-----------------------|-------|-------|--------|--------|
| **Organizations**     |       |       |        |        |
| Create organization   | ✅    | ❌    | ❌     | ❌     |
| Update settings       | ✅    | ✅    | ❌     | ❌     |
| Delete organization   | ✅    | ❌    | ❌     | ❌     |
| **Members**           |       |       |        |        |
| Invite members        | ✅    | ✅    | ❌     | ❌     |
| Remove members        | ✅    | ✅    | ❌     | ❌     |
| Change roles          | ✅    | ✅*   | ❌     | ❌     |
| **Shows**             |       |       |        |        |
| Create shows          | ✅    | ✅    | ✅     | ❌     |
| Edit shows            | ✅    | ✅    | ✅     | ❌     |
| Delete shows          | ✅    | ✅    | ✅     | ❌     |
| View shows            | ✅    | ✅    | ✅     | ✅     |
| **Finance**           |       |       |        |        |
| Create transactions   | ✅    | ✅    | ✅     | ❌     |
| Edit transactions     | ✅    | ✅    | ✅**   | ❌     |
| Delete transactions   | ✅    | ✅    | ❌     | ❌     |
| View finance          | ✅    | ✅    | ✅     | ✅***  |
| **Calendar**          |       |       |        |        |
| Create events         | ✅    | ✅    | ✅     | ❌     |
| Edit events           | ✅    | ✅    | ✅     | ❌     |
| Delete events         | ✅    | ✅    | ✅     | ❌     |
| View calendar         | ✅    | ✅    | ✅     | ✅     |

\* Admin cannot change owner's role or promote to owner  
\*\* Member can only edit their own transactions  
\*\*\* Viewer can see aggregates but not individual transactions

---

## Firestore Security Rules

### Organization Access Verification

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // Helper Functions
    // ========================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserId() {
      return request.auth.uid;
    }
    
    // Check if user is a member of the organization
    function isMember(orgId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/organizations/$(orgId)/members/$(getUserId()));
    }
    
    // Get user's role in organization
    function getMemberRole(orgId) {
      return get(/databases/$(database)/documents/organizations/$(orgId)/members/$(getUserId())).data.role;
    }
    
    // Role hierarchy checks
    function isOwner(orgId) {
      return isMember(orgId) && getMemberRole(orgId) == 'owner';
    }
    
    function isAdmin(orgId) {
      return isMember(orgId) && getMemberRole(orgId) in ['owner', 'admin'];
    }
    
    function canWrite(orgId) {
      return isMember(orgId) && getMemberRole(orgId) in ['owner', 'admin', 'member'];
    }
    
    function canRead(orgId) {
      return isMember(orgId); // All members can read (including viewers)
    }
    
    // Permission checks
    function hasPermission(orgId, permission) {
      let memberData = get(/databases/$(database)/documents/organizations/$(orgId)/members/$(getUserId())).data;
      return permission in memberData.permissions;
    }
    
    // ========================================
    // Organizations
    // ========================================
    
    match /organizations/{orgId} {
      // Anyone can create an organization (becomes owner)
      allow create: if isAuthenticated();
      
      // Only members can read organization data
      allow read: if canRead(orgId);
      
      // Only owner/admin can update organization settings
      allow update: if isAdmin(orgId);
      
      // Only owner can delete organization
      allow delete: if isOwner(orgId);
      
      // ========================================
      // Members Sub-collection
      // ========================================
      
      match /members/{memberId} {
        // Members can read member list
        allow read: if canRead(orgId);
        
        // Owner/admin can add members
        allow create: if isAdmin(orgId);
        
        // Owner/admin can update member roles
        // Cannot demote owner or promote to owner (unless requester is owner)
        allow update: if isAdmin(orgId) &&
          (request.resource.data.role != 'owner' || isOwner(orgId)) &&
          (resource.data.role != 'owner' || isOwner(orgId));
        
        // Owner/admin can remove members (except owner)
        allow delete: if isAdmin(orgId) && resource.data.role != 'owner';
      }
      
      // ========================================
      // Shows Sub-collection
      // ========================================
      
      match /shows/{showId} {
        // All members can read shows
        allow read: if canRead(orgId);
        
        // Owner/admin/member can create/update shows
        allow create, update: if canWrite(orgId);
        
        // Owner/admin/member can delete shows
        allow delete: if canWrite(orgId);
      }
      
      // ========================================
      // Finance Snapshots Sub-collection
      // ========================================
      
      match /finance_snapshots/{snapshotId} {
        // All members can read snapshots
        allow read: if canRead(orgId);
        
        // Owner/admin can create/update snapshots
        allow create, update: if isAdmin(orgId);
        
        // Only owner can delete snapshots
        allow delete: if isOwner(orgId);
        
        // Transactions nested sub-collection
        match /transactions/{txId} {
          // All members can read transactions
          allow read: if canRead(orgId);
          
          // Owner/admin/member can create transactions
          allow create: if canWrite(orgId) &&
            request.resource.data.createdBy == getUserId();
          
          // Owner/admin can update any transaction
          // Members can only update their own
          allow update: if isAdmin(orgId) ||
            (canWrite(orgId) && resource.data.createdBy == getUserId());
          
          // Only owner/admin can delete transactions
          allow delete: if isAdmin(orgId);
        }
      }
      
      // ========================================
      // Calendar Events Sub-collection
      // ========================================
      
      match /calendar_events/{eventId} {
        // All members can read events
        allow read: if canRead(orgId);
        
        // Owner/admin/member can create/update events
        allow create, update: if canWrite(orgId);
        
        // Owner/admin/member can delete events
        allow delete: if canWrite(orgId);
      }
      
      // ========================================
      // Invitations Sub-collection
      // ========================================
      
      match /invitations/{inviteId} {
        // Owner/admin can read invitations
        allow read: if isAdmin(orgId);
        
        // Owner/admin can create invitations
        allow create: if isAdmin(orgId) &&
          request.resource.data.invitedBy == getUserId() &&
          request.resource.data.status == 'pending';
        
        // Only the invited user can update (accept/reject)
        allow update: if isAuthenticated() &&
          request.auth.token.email == resource.data.email &&
          request.resource.data.status in ['accepted', 'rejected'];
        
        // Owner/admin can delete invitations
        allow delete: if isAdmin(orgId);
      }
    }
    
    // ========================================
    // Users Collection
    // ========================================
    
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && getUserId() == userId;
      
      // Users can update their own profile
      allow update: if isAuthenticated() && getUserId() == userId;
      
      // Organization memberships (denormalized cache)
      match /organization_memberships/{orgId} {
        // Users can read their own memberships
        allow read: if isAuthenticated() && getUserId() == userId;
        
        // System creates/updates memberships (backend/cloud function)
        // Users cannot directly modify
        allow write: if false;
      }
    }
  }
}
```

---

## TypeScript Types

```typescript
// ========================================
// Organization Types
// ========================================

export type OrganizationType = 'tour' | 'band' | 'venue' | 'agency';

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  createdAt: Date;
  createdBy: string; // userId
  settings: OrganizationSettings;
  metadata: OrganizationMetadata;
}

export interface OrganizationSettings {
  currency: string;
  timezone: string;
  defaultRole: MemberRole;
  locale: string;
  features: {
    finance: boolean;
    calendar: boolean;
    travel: boolean;
    crm: boolean;
  };
}

export interface OrganizationMetadata {
  startDate?: Date;
  endDate?: Date;
  description?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
}

// ========================================
// Member Types
// ========================================

export interface OrganizationMember {
  id: string; // userId
  email: string;
  displayName: string;
  photoURL?: string;
  role: MemberRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy: string; // userId
  lastActive?: Date;
}

export type Permission =
  | 'finance.read'
  | 'finance.write'
  | 'finance.delete'
  | 'shows.read'
  | 'shows.write'
  | 'shows.delete'
  | 'calendar.read'
  | 'calendar.write'
  | 'calendar.delete'
  | 'members.read'
  | 'members.invite'
  | 'members.remove'
  | 'members.manage_roles'
  | 'settings.read'
  | 'settings.write';

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: [
    'finance.read', 'finance.write', 'finance.delete',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
    'settings.read', 'settings.write',
  ],
  admin: [
    'finance.read', 'finance.write', 'finance.delete',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
    'settings.read',
  ],
  member: [
    'finance.read', 'finance.write',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'members.read',
  ],
  viewer: [
    'finance.read',
    'shows.read',
    'calendar.read',
    'members.read',
  ],
};

// ========================================
// Invitation Types
// ========================================

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string; // Denormalized
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  invitedBy: string; // userId
  invitedByName: string; // Denormalized
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

// ========================================
// Membership Cache Types
// ========================================

export interface OrganizationMembership {
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  role: MemberRole;
  lastAccessed: Date;
  isFavorite: boolean;
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Establish organization data model and security

1. **Create Organizations Collection Structure**
   - Organizations document schema
   - Members sub-collection
   - Invitations sub-collection

2. **Update Security Rules**
   - Implement RBAC helper functions
   - Add organization access verification
   - Test rules with Firestore emulator

3. **Create Organization Hooks**
   - `useOrganizations()` - List user's organizations
   - `useOrganization(orgId)` - Get single organization
   - `useOrganizationMembers(orgId)` - List members
   - `createOrganization()` - Create new organization
   - `updateOrganization()` - Update settings

### Phase 2: Invitation System (Week 2)

**Goal:** Enable team collaboration

1. **Invitation Hooks**
   - `useInvitations(orgId)` - List pending invitations
   - `inviteMember()` - Send invitation
   - `acceptInvitation()` - Accept invite
   - `rejectInvitation()` - Reject invite

2. **Email Integration (Optional)**
   - Cloud Function to send invitation emails
   - Email templates with organization branding
   - Invitation link with token

3. **Invitation UI**
   - Invite member dialog
   - Pending invitations list
   - Invitation acceptance page

### Phase 3: Data Migration (Week 2-3)

**Goal:** Migrate user-based data to organizations

1. **Migration Script**
   - Convert `users/{uid}/organizations/{orgId}/*` → `organizations/{orgId}/*`
   - Create default organization for each user
   - Add user as owner of their organization
   - Copy shows, finance, calendar data
   - Create denormalized membership cache

2. **Migration UI**
   - Migration progress indicator
   - Validation checks
   - Rollback capability

### Phase 4: UI Integration (Week 3-4)

**Goal:** Update app UI for multi-tenancy

1. **Organization Selector**
   - Dropdown in navbar
   - Switch between organizations
   - Persist current organization in localStorage

2. **Member Management Panel**
   - Member list with roles
   - Invite member button
   - Remove member confirmation
   - Role change dropdown

3. **Permissions UI**
   - Hide/disable features based on role
   - Show "View Only" badges for viewers
   - Permission denied messages

4. **Update Existing Features**
   - Shows: Pass orgId to all hooks
   - Finance: Pass orgId to all hooks
   - Calendar: Pass orgId to all hooks

### Phase 5: Testing & Refinement (Week 4)

**Goal:** Ensure stability and security

1. **E2E Tests**
   - Organization creation flow
   - Member invitation flow
   - Role-based access tests
   - Organization switching

2. **Security Audit**
   - Test security rules with emulator
   - Verify permission boundaries
   - Check for data leaks

3. **Performance Optimization**
   - Index creation for common queries
   - Cache organization data
   - Optimize member lookups

---

## Migration Strategy

### Backward Compatibility

During migration, support both old and new structures:

```typescript
// Check if user has old structure
const hasLegacyData = await checkLegacyStructure(userId);

if (hasLegacyData) {
  // Show migration banner
  showMigrationPrompt();
  
  // Auto-migrate on first login
  await migrateUserToOrganization(userId);
}
```

### Migration Script Example

```typescript
async function migrateUserToOrganization(userId: string) {
  const db = getFirestore();
  const batch = writeBatch(db);
  
  // 1. Create default organization
  const orgRef = doc(collection(db, 'organizations'));
  const orgId = orgRef.id;
  
  batch.set(orgRef, {
    name: `${user.displayName}'s Tour`,
    type: 'tour',
    createdAt: serverTimestamp(),
    createdBy: userId,
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      defaultRole: 'viewer',
    },
    metadata: {},
  });
  
  // 2. Add user as owner
  const memberRef = doc(db, `organizations/${orgId}/members/${userId}`);
  batch.set(memberRef, {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'owner',
    permissions: ROLE_PERMISSIONS.owner,
    joinedAt: serverTimestamp(),
    invitedBy: userId,
  });
  
  // 3. Migrate shows
  const oldShowsSnap = await getDocs(
    collection(db, `users/${userId}/organizations/default/shows`)
  );
  
  oldShowsSnap.forEach((showDoc) => {
    const newShowRef = doc(db, `organizations/${orgId}/shows/${showDoc.id}`);
    batch.set(newShowRef, showDoc.data());
  });
  
  // 4. Migrate finance snapshots
  const oldSnapshotsSnap = await getDocs(
    collection(db, `users/${userId}/organizations/default/finance_snapshots`)
  );
  
  for (const snapshotDoc of oldSnapshotsSnap.docs) {
    const newSnapshotRef = doc(db, `organizations/${orgId}/finance_snapshots/${snapshotDoc.id}`);
    batch.set(newSnapshotRef, snapshotDoc.data());
    
    // Migrate transactions
    const oldTxSnap = await getDocs(
      collection(db, `users/${userId}/organizations/default/finance_snapshots/${snapshotDoc.id}/transactions`)
    );
    
    oldTxSnap.forEach((txDoc) => {
      const newTxRef = doc(db, `organizations/${orgId}/finance_snapshots/${snapshotDoc.id}/transactions/${txDoc.id}`);
      batch.set(newTxRef, {
        ...txDoc.data(),
        createdBy: userId,
      });
    });
  }
  
  // 5. Create denormalized membership cache
  const membershipRef = doc(db, `users/${userId}/organization_memberships/${orgId}`);
  batch.set(membershipRef, {
    organizationName: `${user.displayName}'s Tour`,
    role: 'owner',
    lastAccessed: serverTimestamp(),
    isFavorite: true,
  });
  
  // 6. Commit all changes
  await batch.commit();
  
  console.log(`✅ Migrated user ${userId} to organization ${orgId}`);
  return orgId;
}
```

---

## UI Examples

### Organization Selector (Navbar)

```tsx
export function OrganizationSelector() {
  const { organizations, currentOrg, switchOrganization } = useOrganizationContext();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <span>{currentOrg?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      
      <PopoverContent>
        <div className="space-y-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded",
                currentOrg?.id === org.id && "bg-accent"
              )}
            >
              <div className="font-medium">{org.name}</div>
              <div className="text-sm text-muted-foreground">
                {org.type} • {getMemberRole(org.id)}
              </div>
            </button>
          ))}
          
          <Separator />
          
          <button
            onClick={openCreateOrgDialog}
            className="w-full text-left px-3 py-2 rounded hover:bg-accent"
          >
            <Plus className="inline h-4 w-4 mr-2" />
            Create Organization
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Member Management Panel

```tsx
export function MembersPanel({ orgId }: { orgId: string }) {
  const { members, removeMember, updateMemberRole } = useOrganizationMembers(orgId);
  const { invitations } = useInvitations(orgId);
  const { currentRole } = useOrganizationContext();
  
  const canManageMembers = ['owner', 'admin'].includes(currentRole);
  
  return (
    <div className="space-y-6">
      {/* Members List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Members ({members.length})</h3>
          
          {canManageMembers && (
            <Button onClick={openInviteDialog}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.photoURL} />
                  <AvatarFallback>{member.displayName[0]}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium">{member.displayName}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {canManageMembers && member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(role) => updateMemberRole(member.id, role as MemberRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge>{member.role}</Badge>
                )}
                
                {canManageMembers && member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Pending Invitations */}
      {canManageMembers && invitations.length > 0 && (
        <section>
          <h3 className="text-lg font-medium mb-4">Pending Invitations ({invitations.length})</h3>
          
          <div className="space-y-2">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Invited by {invite.invitedByName} • {formatDistanceToNow(invite.createdAt)} ago
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{invite.role}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelInvitation(invite.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Benefits

### For Users

✅ **True Collaboration** - Multiple team members access same data  
✅ **Role-Based Access** - Control who can view/edit finances  
✅ **Invitation System** - Easy onboarding for new members  
✅ **Multiple Organizations** - Manage multiple tours/bands  
✅ **Data Ownership** - Clear ownership and permissions

### For Business

✅ **Team Plans** - Charge per organization (not per user)  
✅ **Enterprise Features** - Custom roles, SSO, audit logs  
✅ **Network Effects** - Users invite bandmates (viral growth)  
✅ **Retention** - Organizations persist beyond single user  
✅ **Scalability** - Each organization has dedicated collections

---

## Security Considerations

### Data Isolation

- Organization data cannot be accessed across boundaries
- Member verification on every request
- Firestore rules prevent unauthorized reads/writes

### Invitation Security

- Email verification before accepting invitations
- Expiration time (7 days default)
- Only admins can invite
- Invitee can reject

### Audit Trail

```typescript
// Add to all write operations
{
  createdBy: userId,
  createdAt: serverTimestamp(),
  updatedBy: userId,
  updatedAt: serverTimestamp(),
}
```

### Rate Limiting

- Limit invitations per organization (20/day)
- Limit organization creation (5 per user)
- Detect suspicious activity (rapid role changes)

---

## Performance Optimization

### Denormalization Strategy

```typescript
// Cache organization name in shows (avoid extra lookup)
{
  showId: 'abc123',
  organizationId: 'org456',
  organizationName: 'Summer Tour 2025', // ← Denormalized
  venue: 'Madison Square Garden',
  // ...
}

// Cache user's role in localStorage
localStorage.setItem('currentOrgRole', 'admin');
```

### Composite Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "joinedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "invitations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Success Metrics

- **Adoption Rate:** % of users who invite at least 1 member
- **Collaboration Index:** Average members per organization
- **Invitation Acceptance:** % of invites accepted within 48h
- **Multi-Org Usage:** % of users in 2+ organizations
- **Role Distribution:** Breakdown of owner/admin/member/viewer

---

## Next Steps

1. ✅ Review architecture design
2. ⏳ Implement Phase 1 (Foundation)
3. ⏳ Create organization management UI
4. ⏳ Build invitation system
5. ⏳ Write migration script
6. ⏳ Update existing features for multi-tenancy
7. ⏳ E2E testing
8. ⏳ Deploy to beta users

---

**Status:** Architecture Design Complete ✅  
**Next:** Implement organization hooks and security rules
