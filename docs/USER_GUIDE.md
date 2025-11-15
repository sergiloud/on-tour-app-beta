# On Tour App - User Guide

**Version:** 2.1.0-beta  
**Last Updated:** November 15, 2025

## Welcome to On Tour! 🎵

This guide will help you get started with managing your tours, shows, finances, and team all in one place.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Shows](#managing-shows)
4. [Financial Tracking](#financial-tracking)
5. [Contacts & CRM](#contacts--crm)
6. [Contracts Management](#contracts-management)
7. [Calendar & Travel](#calendar--travel)
8. [Team Collaboration](#team-collaboration)
9. [Link Invitations](#link-invitations-new)
10. [Activity Timeline](#activity-timeline-new)
11. [Export Reports](#export-reports-new)
12. [Multi-Factor Authentication](#multi-factor-authentication-new)
13. [Settings & Preferences](#settings--preferences)
14. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Creating Your Account

1. Visit [app.ontour.com](https://app.ontour.com)
2. Click **"Empezar gratis"** (Start Free)
3. Enter your email, name, and password
4. Verify your email address
5. You're in! 🎉

### First Steps

After logging in, you'll see the Dashboard. Here's what to do first:

1. **Add your first show**
   - Click "+ Nuevo Show" in the navigation
   - Fill in the basic details (date, venue, city)
   - Click "Guardar"

2. **Set up your profile**
   - Click your avatar (top right)
   - Go to "Configuración" (Settings)
   - Choose your currency, language, and timezone

3. **Invite your team** (Optional)
   - Go to "Organización" → "Miembros"
   - Click "Invite Member"
   - They'll receive an email invitation

---

## Dashboard Overview

Your Dashboard shows everything at a glance:

### Key Metrics

- **Total Shows**: All shows this year
- **Revenue**: Total income from confirmed shows
- **Upcoming**: Shows in the next 30 days
- **Team Size**: Active team members

### Quick Access Cards

- **Upcoming Shows**: See your next 5 shows
- **Financial Overview**: Income vs. expenses chart
- **Tour Map**: Visual representation of your tour route
- **Recent Activity**: Latest changes and updates

### Navigation Menu

- **Dashboard**: Home screen with overview
- **Shows**: List of all your shows
- **Finance**: Income tracking and expense management
- **Contacts**: Venues, promoters, agents, etc.
- **Contracts**: PDF contract storage and management
- **Calendar**: Timeline view of all events
- **Organization**: Team members and settings

---

## Managing Shows

### Creating a Show

1. Click **"+ Nuevo Show"** or press `Ctrl/Cmd + K`
2. Fill in the required fields:
   - **Date**: Performance date
   - **City & Country**: Where it takes place
   - **Venue**: Select from existing or create new
   - **Fee**: Your payment for this show

3. Optional fields:
   - **Promoter**: Who's organizing
   - **Status**: Pending, Confirmed, Cancelled
   - **Capacity**: Venue size
   - **End Date**: For multi-day events

4. Click **"Guardar"**

### Editing a Show

- Click any show from the list
- Edit any field in the modal
- Changes save automatically
- Click outside to close

### Show Stati

- **Pending** 🟡: Not confirmed yet
- **Confirmed** 🟢: Locked in
- **Cancelled** 🔴: Show cancelled
- **Completed** ✅: Show finished

### Bulk Operations

- Select multiple shows with checkboxes
- Click "Export" to download as Excel
- Click "Delete" to remove selected shows

---

## Financial Tracking

### Overview

The Finance module helps you track:
- Show fees (income)
- Expenses (travel, accommodation, equipment)
- Commission calculations
- Net profit per show
- Yearly totals

### Adding Show Fees

1. When creating a show, enter the **Fee** amount
2. The system automatically calculates:
   - Management commission (if set)
   - Booking commission (if set)
   - Net amount after commissions

### Tracking Expenses

1. Go to **Finance** tab
2. Click **"Add Expense"**
3. Choose category:
   - Travel
   - Accommodation
   - Equipment
   - Marketing
   - Personnel
   - Other

4. Enter amount and attach receipt (optional)
5. Link to specific show (optional)

### Financial Reports

- **Income Overview**: Total income by month
- **Expense Breakdown**: Categorized spending
- **Net Profit**: Income minus expenses
- **Tax Summary**: Yearly overview for accounting

### Commission Settings

1. Go to **Settings** → **Finance**
2. Set your management agency (if applicable)
3. Set percentage: typically 10-20%
4. Set your booking agency (if applicable)
5. Set percentage: typically 10-20%

Commissions are automatically calculated on all new shows.

---

## Contacts & CRM

### Contact Types

The app supports 11 types of contacts:

- **Venues** 🏛️: Performance locations
- **Promoters** 📣: Show organizers
- **Booking Agents** 🎫: Your booking agency
- **Managers** 👔: Artist management
- **Labels** 💿: Record companies
- **Distributors** 📦: Distribution companies
- **Media** 📺: Press and media contacts
- **Technical Crew** 🔧: Sound, lights, etc.
- **Legal** ⚖️: Lawyers and legal advisors
- **Sponsors** 💰: Brand sponsors
- **Fans** ❤️: Fan club contacts

### Adding a Contact

1. Go to **Contacts**
2. Click **"+ New Contact"**
3. Choose contact type
4. Fill in details:
   - Name (required)
   - Email
   - Phone
   - Address
   - Notes

5. For **Venues**, also add:
   - Capacity
   - Technical specs
   - Location coordinates (auto-filled from address)

### Linking Contacts to Shows

1. When creating/editing a show
2. Select **Venue** from dropdown
3. Select **Promoter** from dropdown
4. Contact info auto-fills

### Contact Organization

- Use **filters** to view specific contact types
- **Search** by name, email, or company
- **Sort** by name, creation date, or last updated
- **Export** contacts to CSV/Excel

---

## Contracts Management

### Overview

Store, organize, and access all your contracts in one place:
- Performance contracts
- Venue agreements
- Sponsorship deals
- Equipment rentals
- Any PDF document

### Uploading a Contract

1. Go to **Contracts** or open a show
2. Click **"+ Añadir Contrato"** (Add Contract)
3. Select PDF file (max 10MB)
4. The contract is automatically:
   - Stored in cloud (Firebase)
   - Linked to the show (if opened from show modal)
   - Accessible offline

### Contract Details

Each contract shows:
- **Title**: Auto-generated from filename (editable)
- **Status**: Draft, Pending, Signed, Expired, Cancelled
- **Show**: Linked performance
- **Parties**: Contract signatories
- **Upload Date**: When it was added
- **File Size**: PDF size

### Viewing Contracts

- **From Shows**: Open any show → scroll to "Contratos" section
- **From Contracts Page**: View all contracts in one list
- **Click any contract** to:
  - View PDF preview
  - Download original file
  - Edit details
  - Delete contract

### Contract Status

Update status as your deal progresses:
1. **Draft** 📝: Initial version
2. **Pending** ⏳: Sent for signatures
3. **Signed** ✅: Fully executed
4. **Expired** 🔴: Past expiration date
5. **Cancelled** ❌: Deal cancelled

---

## Calendar & Travel

### Calendar View

Switch between views:
- **Month**: Full month overview
- **Week**: 7-day detailed view
- **Day**: Hour-by-hour schedule
- **Agenda**: List of all upcoming events

### Adding Events

Events automatically appear from:
- **Shows**: Performance dates
- **Travel**: Added travel plans
- **Meetings**: Custom events

### Travel Planning

1. Click show date on map/calendar
2. Click **"Plan Travel"** button
3. Choose:
   - Flight
   - Train
   - Bus
   - Car

4. Enter details:
   - Departure time
   - Arrival time
   - Confirmation number
   - Notes

### Route Optimization

The map shows:
- All show locations
- Connections between shows
- Distance and travel time
- Suggested routes

**Pro Tip**: Click any show marker on the map to see details and plan travel.

---

## Team Collaboration

### Organization Roles

- **Owner**: Full access, can delete organization
- **Admin**: Manage members, edit all data
- **Member**: View and edit shows, limited access
- **Viewer**: Read-only access

### Inviting Team Members

1. Go to **Organización** → **Miembros**
2. Click **"Invite Member"**
3. Enter email address
4. Choose role
5. Click **"Send Invitation"**

They'll receive an email and can join with their own account.

### Managing Permissions

- **Owners** can change any member's role
- **Admins** can manage members but not owners
- **Members** cannot invite or remove others

### Real-Time Sync

All changes sync instantly across:
- All devices
- All team members
- Web and mobile apps

You'll see updates within seconds!

---

## Link Invitations (NEW)

**v2.1 Feature**: Share temporary access to your organization via shareable links.

### Overview

Link Invitations allow you to:
- Share access without knowing email addresses
- Set expiration dates (1-30 days)
- Specify role permissions
- Revoke access anytime
- Track who accepted

### Creating a Link Invitation

1. Go to **Organization** → **Link Invitations**
2. Click **"Create Link Invitation"**
3. Configure:
   - **Role**: Viewer, Member, Admin
   - **Expiration**: 7 days (default), or custom
   - **Max Uses**: 1 (default), or unlimited
   - **Note**: Internal description (optional)

4. Click **"Generate Link"**
5. Copy and share the link

### Sharing Link Invitations

**Best for:**
- Quick contractor access
- Temporary team members
- External collaborators
- Event-specific helpers

**Share via:**
- Email
- Slack/Discord
- WhatsApp
- QR code (scan to join)

### Managing Link Invitations

**View All Links:**
- Go to **Organization** → **Link Invitations**
- See **Sent** invitations (your links)
- See **Received** invitations (invites to other orgs)

**Filter by Status:**
- **Pending**: Not yet accepted
- **Accepted**: Someone joined
- **Expired**: Past expiration date
- **Rejected**: Recipient declined

**Actions:**
- ✅ **Accept**: Join the organization (received invites)
- ❌ **Reject**: Decline invitation (received invites)
- 🗑️ **Cancel**: Revoke link (sent invites)
- 📋 **Copy**: Copy link to clipboard
- 🔄 **Regenerate**: Create new link, invalidate old

### Security Tips

✅ **DO:**
- Set short expiration periods (7 days)
- Use single-use links for sensitive access
- Revoke links immediately when no longer needed
- Monitor accepted invitations

❌ **DON'T:**
- Share links publicly on social media
- Use unlimited expiration for temporary access
- Forget to review active links monthly

---

## Activity Timeline (NEW)

**v2.1 Feature**: Track all changes and activities across your organization.

### Overview

The Timeline shows:
- All data changes (shows, contacts, finance)
- Team member actions
- System events (invites, permissions)
- Import/export activities

### Accessing Timeline

1. Go to **Dashboard** → **Timeline**
2. Or click **bell icon** (top right) → **View All**

### Timeline Filters

**Filter by Module:**
- All Activities
- Shows
- Finance
- CRM (Contacts)
- Contracts
- Team (Members)
- Travel

**Filter by Action:**
- Created
- Updated
- Deleted
- Imported
- Exported

**Filter by Member:**
- All Team Members
- Specific user

**Filter by Time:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom date range

### Activity Details

Each activity shows:
- **Who**: Team member who made the change
- **What**: Action performed
- **When**: Timestamp
- **Where**: Module/section
- **Details**: Specific changes made

**Example:**
```
Sergi Recio created Show "Paris - Le Trianon"
Finance Module | 2 hours ago
Details: Fee €2,500, Date: 2025-12-15
```

### Smart Grouping

Related activities are automatically grouped:
- Bulk operations (e.g., "Deleted 5 shows")
- Rapid updates (e.g., "Updated show 3 times")
- Import batches (e.g., "Imported 50 contacts")

### Importance Badges

- 🔴 **Critical**: Deletions, permission changes
- 🟡 **Important**: New shows, finance updates
- 🟢 **Normal**: Routine edits

### Use Cases

**Audit & Compliance:**
- Track who changed financial data
- Review permission history
- Export activity logs for accounting

**Team Coordination:**
- See what teammates are working on
- Identify duplicate work
- Monitor progress

**Troubleshooting:**
- Find when data was deleted
- Restore information from details
- Debug sync issues

---

## Export Reports (NEW)

**v2.1 Feature**: Export data to Excel and PDF for sharing and archiving.

### Excel Export

**Export from:**
- Shows list (bulk select → Export)
- Finance page (Export button)
- Contacts (Export button)
- Timeline (Export activity log)

**Excel Features:**
- Formatted tables with headers
- Color-coded rows (status)
- Auto-calculated totals
- Multiple sheets (shows, finance, contacts)
- Excel formulas included

**How to Export:**
1. Select items (or select all)
2. Click **"Export"** → **"Excel"**
3. Choose date range (optional)
4. Click **"Download"**
5. File downloads as `.xlsx`

### PDF Export

**Export from:**
- Individual show details
- Financial reports
- Contract summaries
- Activity reports

**PDF Features:**
- Professional formatting
- Charts and graphs
- Organization branding
- Page numbers
- Table of contents

**How to Export:**
1. Open item/report
2. Click **"Export"** → **"PDF"**
3. Choose options:
   - Include charts
   - Include notes
   - Include signatures
4. Click **"Generate PDF"**
5. File downloads as `.pdf`

### Bulk Export

**Export all data:**
1. Go to **Settings** → **Data Export**
2. Click **"Export All Data"**
3. Choose format: Excel, JSON, CSV
4. Click **"Download Archive"**
5. Receive `.zip` with all data

**Includes:**
- All shows
- All contacts
- All contracts (file list, not PDFs)
- All finance records
- All timeline activities

**Use for:**
- Monthly backups
- Accountant sharing
- End-of-year reporting
- Migration to other systems

---

## Multi-Factor Authentication (NEW)

**v2.1 Feature**: Add extra security to your account with MFA.

### Why Enable MFA?

- **10x more secure** than password alone
- Protect against phishing attacks
- Required for admin/owner roles (optional for members)
- Industry best practice

### Enabling MFA

1. Go to **Settings** → **Security**
2. Click **"Enable Multi-Factor Authentication"**
3. Choose method:
   - **Authenticator App** (recommended): Google Authenticator, Authy, 1Password
   - **SMS Verification**: Text message codes
   - **Email Verification**: Email codes

4. Follow setup wizard
5. Save **backup codes** (8 codes, use if you lose phone)

### Using MFA

**Login with MFA:**
1. Enter email and password
2. Open authenticator app
3. Enter 6-digit code
4. Click **"Verify"**

**If you lose your device:**
1. Click **"Use backup code"** at login
2. Enter one of your 8 backup codes
3. **Immediately** go to Settings → Security
4. **Re-configure MFA** with new device

### Authenticator Apps

**Recommended:**
- **Google Authenticator** (Free, iOS/Android)
- **Authy** (Free, multi-device sync)
- **1Password** (Paid, password manager integration)
- **Microsoft Authenticator** (Free, biometric unlock)

**Setup:**
1. Download app from App Store/Play Store
2. In On Tour settings, click "Enable MFA"
3. Scan QR code with authenticator app
4. Enter code to confirm

### Backup Codes

**Important:**
- You get **8 one-time codes** when enabling MFA
- Each code works **only once**
- **Print and store securely**
- Regenerate if you run out

**To regenerate:**
1. Settings → Security → MFA Settings
2. Click **"Generate New Backup Codes"**
3. Old codes become invalid

### Managing MFA

**Turn off MFA:**
1. Settings → Security
2. Click **"Disable MFA"**
3. Enter current MFA code
4. Confirm

⚠️ **Not recommended** unless absolutely necessary

**Change MFA method:**
1. Settings → Security
2. Click **"Change MFA Method"**
3. Choose new method
4. Complete setup

---

## Settings & Preferences

### Personal Settings

**Profile**
- Name
- Email (verified)
- Avatar photo
- Password

**Preferences**
- **Language**: English, Español, Français, Deutsch, Italiano, Português
- **Currency**: EUR, USD, GBP, JPY
- **Timezone**: Your local timezone
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY

### Organization Settings

**General**
- Organization name
- Logo
- Website
- Description

**Finance**
- Default currency
- Tax rate
- Commission structure
- Payment terms

**Notifications**
- Email alerts
- Desktop notifications
- Mobile push (coming soon)

---

## Tips & Best Practices

### Data Entry

✅ **DO:**
- Enter shows as soon as they're booked
- Add venue details for better maps
- Track all expenses immediately
- Upload contracts right away

❌ **DON'T:**
- Wait until month-end to update finances
- Skip venue information
- Forget to categorize expenses

### Organization

✅ **DO:**
- Use consistent naming (e.g., "Paris - Le Trianon" not just "Paris")
- Tag shows with tours/campaigns
- Keep contact information updated
- Review financial reports monthly

❌ **DON'T:**
- Create duplicate contacts
- Mix personal and professional shows
- Ignore pending/unconfirmed shows

### Collaboration

✅ **DO:**
- Invite your team early
- Assign clear roles
- Review changes regularly
- Communicate via notes/comments

❌ **DON'T:**
- Share login credentials
- Give everyone admin access
- Skip permission reviews

### Backup & Security

✅ **DO:**
- Enable two-factor authentication
- Use a strong password
- Export data monthly (backup)
- Verify email address

❌ **DON'T:**
- Use public WiFi without VPN
- Share sensitive contract PDFs publicly
- Ignore security warnings

---

## Keyboard Shortcuts

Speed up your workflow:

- `Ctrl/Cmd + K`: Quick search/new show
- `Ctrl/Cmd + S`: Save current item
- `Esc`: Close modal/dialog
- `Arrow Keys`: Navigate lists
- `Enter`: Select/confirm
- `/`: Focus search

---

## Mobile App

The On Tour app works great on mobile browsers:

1. Open Safari/Chrome on your phone
2. Visit [app.ontour.com](https://app.ontour.com)
3. Tap "Share" → "Add to Home Screen"
4. Use like a native app!

**Features:**
- Full offline support
- Auto-sync when online
- Touch-optimized UI
- Fast and responsive

---

## Getting Help

### In-App Support

- Click the **"?"** icon (bottom right)
- Search the knowledge base
- Contact support

### Email Support

- support@ontour.com
- Response within 24 hours
- Monday-Friday, 9am-6pm CET

### Community

- [Discord Server](https://discord.gg/ontour)
- [Facebook Group](https://facebook.com/groups/ontour)
- [YouTube Tutorials](https://youtube.com/@ontourapp)

---

## What's Next?

Now that you know the basics:

1. ✅ Add your first 5 shows
2. ✅ Upload at least one contract
3. ✅ Set up your commission structure
4. ✅ Invite one team member
5. ✅ Explore the mobile app

**Happy touring! 🎸**

---

## v2.1 Features Summary

**New in v2.1.0-beta (November 2025):**

✅ **Link Invitations**: Shareable links for temporary access  
✅ **Activity Timeline**: Comprehensive audit log  
✅ **Excel/PDF Export**: Professional data exports  
✅ **Multi-Factor Authentication**: Enhanced security  
✅ **Bulk CRM Operations**: Select multiple contacts/shows  
✅ **i18n Expansion**: 6 languages (EN, ES, FR, DE, IT, PT)  

**Coming in v2.2 (Q1 2026):**

🔜 **Mobile App (PWA)**: Native iOS/Android experience  
🔜 **Advanced Analytics**: Custom dashboards  
🔜 **OAuth Login**: Google, Microsoft, Apple sign-in  
🔜 **Webhooks**: Integrate with external services  
🔜 **API Access**: Developer API (beta)  

---

*This guide is based on version 2.1.0-beta. Features may change. Last updated: November 15, 2025.*
