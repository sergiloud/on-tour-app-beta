#!/usr/bin/env node

/**
 * Generate Sample Audit Logs
 * Creates sample audit entries for testing the AuditLogViewer
 */

// Simple audit log generator - uses console.log to simulate
console.log('📝 Sample Audit Log Generator');

const firebaseConfig = {
  apiKey: "AIzaSyCS_JnAnJrj_EOoMsOOTbusKiJdFHN1qlo",
  authDomain: "ontour-app-ec5b0.firebaseapp.com",
  projectId: "ontour-app-ec5b0",
  storageBucket: "ontour-app-ec5b0.firebasestorage.app",
  messagingSenderId: "458942164664",
  appId: "1:458942164664:web:ef962a0de01f8f61968f00",
  measurementId: "G-P48HE8NK87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const orgId = "demo-org-123";
const userId = "ooaTPnc4KvSzsWQxxfqnOdLvKU92";
const userEmail = "booking@prophecyofficial.com";
const userName = "Prophecy";

async function generateSampleAuditLogs() {
  console.log('🔥 Generating sample audit logs...\n');

  try {
    // 1. Authentication events
    console.log('📝 Creating authentication events...');
    await auditLogService.logAuth(
      'login' as any,
      userId,
      userEmail,
      userName,
      orgId,
      { loginMethod: 'email', ipAddress: '192.168.1.100' }
    );

    // 2. Organization events
    console.log('📝 Creating organization events...');
    await auditLogService.logOrganization(
      'org.settings_changed' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'The Prophecy',
      { changedFields: ['name', 'description'], previousValues: { name: 'Old Name' } }
    );

    // 3. Member events  
    console.log('📝 Creating member events...');
    await auditLogService.logMember(
      'member.invited' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'new-member-123',
      'John Doe',
      { inviteEmail: 'john@example.com', role: 'viewer' }
    );

    await auditLogService.logMember(
      'member.role_changed' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'member-456',
      'Jane Smith',
      { previousRole: 'viewer', newRole: 'admin' }
    );

    // 4. Show events
    console.log('📝 Creating show events...');
    await auditLogService.logShow(
      'show.created' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'show-789',
      'Madison Square Garden',
      { venue: 'Madison Square Garden', date: '2025-12-15', capacity: 20000 }
    );

    await auditLogService.logShow(
      'show.updated' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'show-789',
      'Madison Square Garden',
      { changedFields: ['date'], previousDate: '2025-12-10', newDate: '2025-12-15' }
    );

    // 5. Finance events
    console.log('📝 Creating finance events...');
    await auditLogService.logFinance(
      'finance.transaction_created' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'txn-abc123',
      'Show Fee Payment',
      { amount: 50000, currency: 'USD', type: 'income' }
    );

    await auditLogService.logFinance(
      'finance.transaction_deleted' as any,
      userId,
      userEmail,
      userName,
      orgId,
      'txn-def456',
      'Cancelled Expense',
      { amount: 5000, currency: 'USD', type: 'expense', reason: 'duplicate' }
    );

    // 6. Create some events with different timestamps (past)
    console.log('📝 Creating historical events...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    
    await auditLogService.log({
      organizationId: orgId,
      category: 'COLLABORATION' as any,
      action: 'member.joined' as any,
      severity: 'INFO' as any,
      userId,
      userEmail,
      userName,
      description: 'Member joined the organization',
      metadata: { inviteAccepted: true },
      success: true,
      timestamp: pastDate
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    await auditLogService.log({
      organizationId: orgId,
      category: 'SECURITY' as any,
      action: 'org.settings_changed' as any,
      severity: 'CRITICAL' as any,
      userId,
      userEmail,
      userName,
      description: 'Organization security settings changed',
      metadata: { 
        changedSettings: ['mfa_required', 'password_policy'],
        mfaRequired: true,
        passwordMinLength: 12
      },
      success: true,
      timestamp: weekAgo
    });

    console.log('\n✅ Sample audit logs created successfully!');
    console.log('\n📋 Summary:');
    console.log('• 2 Authentication events');
    console.log('• 1 Organization settings change');
    console.log('• 2 Member management events');
    console.log('• 2 Show management events');
    console.log('• 2 Finance events');
    console.log('• 2 Historical events');
    console.log('\n🎯 Total: 11 audit entries created');
    
    console.log('\n🔍 To view the logs:');
    console.log('1. Open the app: http://localhost:3001');
    console.log('2. Go to Timeline page');
    console.log('3. Click the "Audit Log" tab');
    console.log('4. Test the filters and export functionality');

  } catch (error) {
    console.error('❌ Error generating audit logs:', error);
  }

  process.exit(0);
}

generateSampleAuditLogs();