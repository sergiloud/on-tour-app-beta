# Audit Logging System Guide

**Version:** v2.2.1  
**Last Updated:** November 16, 2025  
**Audience:** Administrators & Compliance Teams

---

## 📊 Audit Logging Overview

On Tour App implements **comprehensive audit logging** to track all user activities, data changes, and system events. This system ensures accountability, helps with compliance requirements, and provides forensic capabilities for security investigations.

### Key Features

- ✅ **Real-time Activity Tracking:** All user actions logged immediately
- ✅ **Immutable Log Records:** Tamper-proof timestamps and integrity checking
- ✅ **Comprehensive Data Coverage:** Shows, Finance, Contacts, Travel, Settings
- ✅ **Advanced Search & Filtering:** Find specific events across time ranges
- ✅ **Export & Reporting:** Generate compliance reports in multiple formats
- ✅ **Automated Anomaly Detection:** Alert on suspicious activity patterns
- ✅ **GDPR/SOC2 Compliance:** Structured for regulatory requirements

---

## 🎯 What Gets Logged

### User Authentication Events

| Event Type | Details Captured | Retention |
|------------|------------------|-----------|
| **Login Success** | Timestamp, IP address, device info, MFA method used | 2 years |
| **Login Failure** | Failed attempt details, IP, reason for failure | 2 years |
| **Password Changes** | User ID, timestamp, IP, password strength score | 2 years |
| **MFA Events** | Setup/disable MFA, method changes, backup code usage | 2 years |
| **Session Management** | Session creation/termination, concurrent sessions | 90 days |
| **Account Lockouts** | Failed attempt thresholds, unlock methods | 2 years |

### Data Modification Events

#### Shows Management
```json
{
  "eventType": "show_created",
  "timestamp": "2025-11-16T14:30:22.123Z",
  "userId": "user_12345",
  "organizationId": "org_67890", 
  "showId": "show_abc123",
  "changes": {
    "venue": "Madison Square Garden",
    "date": "2025-12-15",
    "fee": 50000,
    "currency": "USD"
  },
  "metadata": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Chrome/119.0.0.0 macOS",
    "sessionId": "session_xyz789"
  }
}
```

#### Financial Operations
```json
{
  "eventType": "expense_added",
  "timestamp": "2025-11-16T14:35:15.456Z",
  "userId": "user_12345",
  "organizationId": "org_67890",
  "expenseId": "expense_def456",
  "changes": {
    "amount": 2500.00,
    "category": "travel",
    "description": "Hotel accommodation NYC",
    "receiptAttached": true
  },
  "sensitivity": "financial",
  "complianceFlags": ["tax_deductible"]
}
```

#### Contact Management
- Contact creation, modification, deletion
- Contact sharing and permission changes
- Venue assignments and relationship mapping
- Email/phone number changes with verification status

#### Travel & Logistics
- Itinerary creation and modifications
- Transportation bookings and changes
- Accommodation reservations
- Travel expense approvals

### Administrative Actions

| Action | Information Logged | Compliance Notes |
|--------|-------------------|------------------|
| **User Invitations** | Inviter, invitee email, role assigned, expiration | GDPR: Processing basis |
| **Permission Changes** | Role modifications, access level changes | SOC2: Access management |
| **Organization Settings** | Policy changes, feature toggles, billing updates | Audit trail required |
| **Data Exports** | Export type, data scope, recipient | GDPR: Data portability |
| **Bulk Operations** | Mass deletions, imports, data migrations | High-risk operations |

### System Events

- Application deployments and configuration changes
- Database schema modifications
- Security policy updates
- Integration enablement/disablement
- Performance threshold violations

---

## 🔍 Accessing Audit Logs

### For Organization Administrators

#### Timeline View (Integrated)

1. Go to **Dashboard → Timeline**
2. Click **"Show Audit Events"** toggle
3. Filter by:
   - **Event Type:** Authentication, Data Changes, Admin Actions
   - **User:** Specific team member or "All Users"
   - **Date Range:** Last 24h, Week, Month, Custom
   - **Sensitivity:** Public, Internal, Confidential, Restricted

#### Dedicated Audit Dashboard

1. Navigate to **Organization Settings → Audit & Compliance**
2. **Overview Tab:** Key metrics and recent activity
3. **Search Tab:** Advanced filtering and export options
4. **Reports Tab:** Pre-built compliance reports
5. **Alerts Tab:** Configure anomaly detection rules

#### Advanced Search Interface

**Access:** Organization Settings → Audit & Compliance → Search

**Search Capabilities:**
```
Event Type: [Dropdown: All, Authentication, Data, Admin, System]
User: [Autocomplete: All team members]
Date Range: [Calendar picker or quick filters]
IP Address: [Text input for specific IP investigation]
Resource Type: [Shows, Contacts, Finance, Travel, Settings]
Action: [Created, Modified, Deleted, Viewed, Exported]
Sensitivity: [Public, Internal, Confidential, Restricted]

Advanced Filters:
□ Failed operations only
□ High-risk activities
□ External IP addresses
□ After-hours activities (6PM - 8AM)
□ Weekend activities
□ Bulk operations (>10 records)
□ Cross-organization activities
```

### For Regular Users (Limited View)

Users can view their own audit trail:

1. Go to **Settings → Privacy & Activity**
2. **"My Activity"** tab shows:
   - Your login history (30 days)
   - Data you've created or modified
   - Exports you've performed
   - Settings changes you've made

**Note:** Users cannot see other users' activities or administrative actions.

---

## 📈 Audit Analytics & Reports

### Built-in Reports

#### Security & Compliance Report
```
Report Period: [Last Month]
Generated: November 16, 2025

AUTHENTICATION SECURITY:
✅ MFA Adoption Rate: 94% (47/50 users)
⚠️ Failed Login Attempts: 23 (5 unique IPs)
✅ Password Policy Compliance: 100%
✅ Session Security: No concurrent session violations

DATA GOVERNANCE:
✅ Data Retention: All logs within policy limits
✅ Export Compliance: 12 exports, all authorized
⚠️ After-Hours Activity: 8 events (review recommended)
✅ Bulk Operations: 3 events, all authorized

ADMINISTRATIVE OVERSIGHT:
✅ Permission Changes: 5 events, proper approvals
✅ Organization Settings: 2 changes, documented
✅ User Management: 3 invitations, 1 removal (offboarding)
```

#### User Activity Summary
```
Top Active Users (Last 30 Days):
1. john@example.com - 245 actions (95% shows management)
2. sarah@example.com - 189 actions (80% finance operations)  
3. mike@example.com - 156 actions (70% contact management)

Risk Indicators:
⚠️ 3 users with after-hours financial operations
⚠️ 1 user with unusual login pattern (different countries)
✅ No policy violations detected
✅ No anomalous data access patterns
```

#### Compliance Audit Trail
- GDPR Article 30 Record of Processing Activities
- SOC 2 Type II Access Controls Evidence  
- ISO 27001 Information Security Management
- CCPA Consumer Rights Fulfillment Log

### Custom Report Builder

**Access:** Audit Dashboard → Reports → Create Custom Report

**Available Dimensions:**
- Time Period (hourly, daily, weekly, monthly)
- User Roles (Owner, Admin, Member, Viewer)
- Event Categories (Auth, Data, Admin, System)
- Risk Levels (Low, Medium, High, Critical)
- Data Sensitivity (Public, Internal, Confidential)
- Geographic Location (based on IP geolocation)

**Sample Custom Queries:**
```sql
-- High-risk financial operations
SELECT * FROM audit_logs 
WHERE event_category = 'financial' 
AND risk_level >= 'high'
AND timestamp >= NOW() - INTERVAL 30 DAY

-- After-hours administrative actions  
SELECT user_id, event_type, timestamp, details
FROM audit_logs 
WHERE event_category = 'administrative'
AND EXTRACT(HOUR FROM timestamp) NOT BETWEEN 8 AND 18
ORDER BY timestamp DESC

-- Cross-border data access (compliance)
SELECT user_id, ip_address, country, COUNT(*) as access_count
FROM audit_logs 
WHERE event_type LIKE '%_accessed'
GROUP BY user_id, country
HAVING COUNT(*) > 10
```

---

## 🚨 Anomaly Detection & Alerts

### Automated Detection Rules

#### Authentication Anomalies
- **Multiple failed logins:** >5 attempts in 10 minutes
- **Unusual login locations:** New country/region without travel notification
- **Off-hours access:** Administrative actions outside business hours
- **Concurrent sessions:** >3 active sessions from different locations
- **MFA bypass attempts:** Repeated backup code usage

#### Data Access Patterns  
- **Bulk data exports:** >1000 records exported in single operation
- **Rapid data changes:** >50 modifications in 5 minutes by single user
- **Cross-organization access:** Attempts to access other organization data
- **Sensitive data patterns:** Unusual access to financial/personal information
- **Permission escalation:** User attempting actions above their role

#### System-Level Anomalies
- **API rate limiting:** Individual user hitting rate limits repeatedly
- **Large payload operations:** Requests exceeding normal size thresholds
- **Error pattern clustering:** Multiple similar errors from same user/IP
- **Feature abuse:** Excessive use of export, sharing, or administrative features

### Alert Configuration

**Setup:** Organization Settings → Audit & Compliance → Alerts

#### Alert Channels
- **Email Notifications:** Immediate for critical, daily digest for medium
- **Slack Integration:** Post to #security channel with severity levels
- **Webhook URLs:** Integrate with SIEM systems (Splunk, ELK, etc.)
- **In-App Notifications:** Dashboard alerts for administrators

#### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **🔴 Critical** | Security incident likely | <15 minutes | Multiple failed admin logins |
| **🟡 High** | Policy violation or unusual activity | <1 hour | After-hours financial operations |
| **🟠 Medium** | Potential issue requiring review | <4 hours | Bulk data export by regular user |
| **🟢 Low** | Informational, trends | Daily digest | New user login from expected location |

#### Sample Alert Configuration
```yaml
alert_rules:
  - name: "Suspicious Login Activity"
    condition: "failed_logins > 5 AND timeframe = '10m'"
    severity: "critical"
    channels: ["email", "slack"]
    
  - name: "After Hours Financial Activity"
    condition: "event_category = 'financial' AND hour NOT BETWEEN 8-18"
    severity: "medium" 
    channels: ["email"]
    
  - name: "Bulk Data Export"
    condition: "event_type = 'export' AND record_count > 1000"
    severity: "high"
    channels: ["email", "webhook"]
```

---

## 📋 Compliance & Legal Requirements

### GDPR Compliance

#### Data Subject Rights Support

**Right to Access (Article 15):**
```
Request Process:
1. Data subject emails privacy@ontour.app
2. Identity verification required
3. Automated report generation from audit logs
4. Delivery within 30 days

Report Contents:
- All personal data processed
- Audit trail of data modifications  
- Third-party data sharing events
- Data retention and deletion dates
```

**Right to Rectification (Article 16):**
- All data corrections logged with timestamp
- Previous values retained for audit purposes  
- User notification of corrections made by others

**Right to Erasure (Article 17):**
- Complete audit trail of deletion requests
- Verification of complete data removal
- Legal basis for retention (where applicable)
- Third-party deletion coordination logs

#### Processing Records (Article 30)
```
Automated Generation:
- Categories of data subjects (users, contacts, organizations)
- Categories of personal data processed
- Purposes of processing with legal basis
- Recipients of personal data (internal/external)
- International transfers with safeguards
- Retention periods for each category
- Technical and organizational security measures
```

### SOC 2 Type II Evidence

#### Access Controls (CC6.1)
- User provisioning and deprovisioning logs
- Role assignment and modification tracking  
- Privilege escalation monitoring
- Regular access review documentation

#### System Operations (CC7.1)  
- Configuration change management logs
- System capacity and performance monitoring
- Incident detection and response tracking
- Business continuity and disaster recovery testing

#### Change Management (CC8.1)
- Software deployment and rollback logs
- Configuration baseline management
- Emergency change authorization tracking
- Post-change validation and monitoring

### Industry-Specific Compliance

#### Music Industry Requirements
- **Mechanical Rights:** Track usage of copyrighted material
- **Performance Rights:** Log venue performance details for PRO reporting
- **Union Compliance:** Document crew hours and working conditions
- **Tax Jurisdiction:** Multi-state/country tax reporting for touring

#### Financial Regulations  
- **Anti-Money Laundering (AML):** Large cash transaction reporting
- **Know Your Customer (KYC):** Venue and vendor verification logs
- **Foreign Corrupt Practices Act (FCPA):** International payment tracking
- **Tax Compliance:** Automated calculation and reporting logs

---

## 🔧 Technical Implementation

### Log Storage & Architecture

#### Data Structure
```typescript
interface AuditLogEntry {
  id: string;                    // Unique identifier
  timestamp: Date;               // ISO 8601 with microsecond precision
  eventType: string;             // Standardized event type
  userId: string;                // Actor performing action
  organizationId: string;        // Tenant isolation
  resourceType: string;          // What was affected (show, contact, etc.)
  resourceId?: string;           // Specific resource identifier
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
  changes?: {                    // Before/after values for updates
    before: Record<string, any>;
    after: Record<string, any>;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    sessionId: string;
    geolocation?: {
      country: string;
      region: string;
      city: string;
    };
    riskScore: number;           // 0-100 calculated risk
    complianceFlags: string[];   // Regulatory markers
  };
  integrity: string;             // HMAC-SHA256 for tamper detection
}
```

#### Storage Infrastructure
- **Primary:** Firestore with automatic backup
- **Archive:** Google Cloud Storage for long-term retention
- **Search:** Elasticsearch for complex queries and analytics
- **Real-time:** Cloud Functions for immediate alert processing

#### Retention Policies
```yaml
retention_schedule:
  authentication_events: 2_years
  financial_operations: 7_years    # Tax and audit requirements
  data_modifications: 3_years     # SOC2 compliance
  administrative_actions: 5_years  # Regulatory oversight
  system_events: 1_year          # Operational troubleshooting
  
archive_schedule:
  after_6_months: move_to_cold_storage
  after_2_years: compress_and_archive  
  after_retention_period: secure_deletion
```

### Security & Integrity

#### Tamper Detection
```typescript
// Cryptographic integrity checking
function generateIntegrityHash(entry: AuditLogEntry): string {
  const payload = JSON.stringify({
    timestamp: entry.timestamp,
    eventType: entry.eventType,
    userId: entry.userId,
    resourceType: entry.resourceType,
    action: entry.action,
    changes: entry.changes
  });
  
  return crypto
    .createHmac('sha256', process.env.AUDIT_LOG_SECRET)
    .update(payload)
    .digest('hex');
}

// Verify log entry hasn't been tampered with
function verifyIntegrity(entry: AuditLogEntry): boolean {
  const expectedHash = generateIntegrityHash(entry);
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(entry.integrity)
  );
}
```

#### Access Controls
- **Read Access:** Organization administrators only
- **Write Access:** System service accounts only (no human write access)
- **Export Access:** Requires additional authentication step
- **Deletion:** Only automated based on retention policies

---

## 📞 Support & Troubleshooting

### Common Tasks

#### Finding Specific User Activity
```
1. Go to Audit Dashboard → Search
2. Enter user email in "User" field
3. Set appropriate date range
4. Filter by relevant event types
5. Export results if needed for investigation
```

#### Investigating Security Incidents
```
1. Check Recent Alerts (Dashboard → Alerts)
2. Search by IP address or timeframe
3. Look for patterns in failed authentications
4. Check for unusual data access or exports
5. Correlate with user reports of suspicious activity
6. Export evidence for further analysis
```

#### Preparing Compliance Reports
```
1. Use pre-built report templates (Reports → Compliance)
2. Select appropriate time period (quarter/year)
3. Choose relevant compliance framework (GDPR/SOC2)
4. Review generated report for completeness
5. Export in required format (PDF/Excel/JSON)
6. Store securely for audit purposes
```

### Getting Help

- **Documentation:** This guide and [docs.ontour.app/audit](https://docs.ontour.app/audit)
- **General Support:** support@ontour.app
- **Security Issues:** security@ontour.app (urgent incidents)
- **Compliance Questions:** compliance@ontour.app
- **API Documentation:** [api.ontour.app/audit](https://api.ontour.app/audit)

### Feature Requests

Common requests for future versions:
- Real-time dashboard widgets for security operations teams
- Advanced ML-based anomaly detection
- Integration with additional SIEM platforms
- Custom retention policies per data type
- Advanced correlation analysis between events

---

## 📚 Additional Resources

- **Security Policy:** [SECURITY.md](./SECURITY.md)
- **MFA Setup Guide:** [MFA_SETUP.md](./MFA_SETUP.md)
- **Privacy Policy:** [privacy.ontour.app](https://privacy.ontour.app)
- **Compliance Certifications:** [trust.ontour.app](https://trust.ontour.app)

---

**Last Updated:** November 16, 2025  
**Document Version:** v2.2.1  
**Next Review:** February 2026  
**Compliance Standards:** GDPR, SOC 2 Type II, ISO 27001, CCPA