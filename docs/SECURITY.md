# Security Policy

**Version:** 2.2.1-production  
**Last Updated:** November 16, 2025  
**Scope:** Production & Beta Environments

---

## 🔒 Security Features (v2.2.1)

### Authentication & Access Control

- ✅ **Firebase Authentication:** Email/password with email verification
- ✅ **Advanced Multi-Factor Authentication (MFA):** 
  - **WebAuthn/FIDO2:** Biometric authentication (fingerprint, Face ID, Windows Hello)
  - **TOTP:** Time-based one-time passwords (Google Authenticator, Authy)
  - **SMS Verification:** Fallback SMS codes for mobile devices
  - **Backup Codes:** Printable recovery codes for account recovery
  - **Hardware Security Keys:** YubiKey and other FIDO2 devices support
- ✅ **Role-Based Access Control (RBAC):** Owner, Admin, Member, Viewer with granular permissions
- ✅ **Advanced Session Management:** 
  - JWT token rotation every 15 minutes
  - Device fingerprinting and anomaly detection
  - Concurrent session limits (max 5 devices)
  - Automatic logout on suspicious activity
- ✅ **OAuth Integration:** Google, Microsoft, Apple (production ready)

### Audit & Compliance System

- ✅ **Comprehensive Audit Logging:** 
  - All user actions tracked with timestamp, IP, device info
  - Data access patterns and modification history
  - Administrative actions with detailed context
  - Automated anomaly detection and alerting
- ✅ **Compliance Reporting:**
  - GDPR compliance with data export/deletion tools
  - SOC 2 Type II audit trail preparation
  - Real-time compliance monitoring dashboard
  - Automated compliance violation detection

### Multi-Tenancy Security

- ✅ **Organization Isolation:** All data scoped to organization ID
- ✅ **Firestore Security Rules:** Server-side data access validation
- ✅ **Permission Checks:** Client-side guards + server-side enforcement
- ✅ **Invite System:** Email-based invites with expiration (7 days)
- ✅ **Link Invitations:** Shareable links with role enforcement

### Data Protection

- ✅ **Advanced Encryption in Transit:** 
  - HTTPS/TLS 1.3 with HSTS preloading
  - Certificate pinning for critical API endpoints
  - End-to-end encryption for sensitive communications
- ✅ **Enhanced Encryption at Rest:** 
  - Firebase default AES-256 encryption
  - WebAssembly encrypted storage for financial data
  - Client-side encryption for private notes and documents
- ✅ **Comprehensive Input Sanitization:** 
  - XSS prevention with strict CSP and output encoding
  - SQL injection protection (parameterized queries only)
  - File upload validation and virus scanning
  - Input size limits and type validation
- ✅ **Advanced CSRF Protection:** 
  - Token-based validation with entropy checks
  - SameSite cookie attributes enforced
  - Referrer policy validation
- ✅ **Dynamic Rate Limiting:** 
  - Per-endpoint throttling (varies by sensitivity)
  - Burst protection with exponential backoff
  - IP-based and user-based limits
  - Automatic DDoS mitigation

### Application Security

- ✅ **Strict Content Security Policy (CSP):** 
  - Nonce-based script loading
  - Strict dynamic imports policy
  - WebAssembly execution controls
  - Third-party integration sandboxing
- ✅ **Comprehensive Security Headers:** 
  - HSTS with max-age 63072000 and preload
  - X-Frame-Options: DENY (clickjacking prevention)
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=()
- ✅ **Automated Security Pipeline:** 
  - Continuous dependency scanning with npm audit
  - SAST (Static Application Security Testing) integration
  - Secret detection in codebase and commits
  - Vulnerability database matching with Snyk
- ✅ **Enterprise Secret Management:** 
  - Environment variable encryption at rest
  - Secret rotation policies (90 days)
  - Least privilege access to secrets
  - Audit logging for secret access
- ✅ **Production-Grade Audit System:** 
  - Real-time activity tracking across all modules
  - Forensic-ready log format with immutable timestamps
  - Automated anomaly detection and alerting
  - Integration with SIEM systems (Splunk, ELK Stack)
- ✅ **Zero-Vulnerability Dependencies:** 
  - Migrated from vulnerable xlsx to secure ExcelJS
  - Papaparse for CSV (RFC 4180 compliant, no known CVEs)
  - Regular automated dependency updates with security patches
  - Dependency license compliance checking

See [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) for implementation details.

---

## 📋 Known Vulnerabilities

### ~~xlsx (SheetJS)~~ - **RESOLVED in v2.2**

**Previous Status:** High severity - Prototype Pollution and ReDoS vulnerabilities  
**Resolution Date:** November 16, 2025  
**Action Taken:** Migrated to **ExcelJS** (secure alternative) + **Papaparse** for CSV exports

**Changes:**
- ✅ Removed vulnerable `xlsx` package completely
- ✅ Replaced with `exceljs` (actively maintained, no known CVEs)
- ✅ Added `papaparse` for lightweight CSV exports
- ✅ Updated all export utilities in `src/lib/excelExport.ts`
- ✅ Maintained backward compatibility with existing export functions

**Security Benefits:**
- Zero known vulnerabilities in new dependencies
- Better performance and smaller bundle size
- Enhanced Excel formatting capabilities
- Improved CSV parsing with RFC 4180 compliance

---

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a vulnerability:

### How to Report

1. **Email:** security@ontour.app (preferred)
2. **GitHub Security Advisory:** [Private vulnerability reporting](https://github.com/sergiloud/on-tour-app-beta/security/advisories/new)

### What to Include

- **Description:** Clear explanation of the vulnerability
- **Steps to Reproduce:** Detailed reproduction steps
- **Impact:** Potential security impact and affected users
- **Proof of Concept:** Code, screenshots, or video (if applicable)
- **Suggested Fix:** Mitigation or patch (optional)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Critical (7 days), High (14 days), Medium (30 days), Low (60 days)

### Disclosure Policy

- We follow **responsible disclosure** practices
- Please **do not publicly disclose** until we've issued a fix
- We will credit researchers in release notes (if desired)

---

## 🛡️ Security Best Practices (For Users)

### Account Security

- ✅ Use a **strong, unique password** (12+ characters, mixed case, numbers, symbols)
- ✅ Enable **Multi-Factor Authentication (MFA)** (Settings → Security)
- ✅ Review **active sessions** regularly (Settings → Security → Sessions)
- ✅ **Never share your password** with anyone (including support staff)
- ✅ Use **password managers** (1Password, Bitwarden, LastPass)

### Organization Management

- ✅ Grant **minimum necessary permissions** (Principle of Least Privilege)
- ✅ Review **team members regularly** (Organization → Members)
- ✅ **Revoke access immediately** when team members leave
- ✅ Use **link invitations with expiration** for temporary access
- ✅ Enable **audit logging** to track sensitive operations (Timeline feature)

### Data Protection

- ✅ **Don't share sensitive data** in show notes or comments
- ✅ Use **contracts feature** for confidential documents (encrypted storage)
- ✅ **Regularly backup critical data** (Export → Excel/PDF)
- ✅ **Verify recipient** before sharing organization invites
- ✅ **Monitor activity** in Timeline for suspicious behavior

---

## 🔐 For Developers

### Security Checklist

When contributing code, ensure:

- [ ] Input validation on all user-provided data
- [ ] Output encoding to prevent XSS
- [ ] Authentication checks on protected routes
- [ ] Authorization checks on sensitive operations
- [ ] Firestore security rules updated for new collections
- [ ] Dependencies scanned with `npm audit`
- [ ] Secrets stored in environment variables (not in code)
- [ ] Error messages don't leak sensitive information
- [ ] Unit tests include security test cases

### Security Tools

```bash
# Run dependency audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Run security tests
npm run test:security
```

### Code Review Guidelines

- All PRs require security review from maintainers
- Changes to auth, Firestore rules, or sensitive features require thorough review
- Follow [OWASP Top 10](https://owasp.org/www-project-top-ten/) guidelines

---

## 📜 Compliance

### Data Privacy

- **GDPR Compliant:** User data deletion, data export, consent management
- **CCPA Compliant:** California Consumer Privacy Act requirements
- **Data Residency:** Firebase Firestore (europe-west1)

### Standards

- **OWASP Top 10:** Regularly audited against common vulnerabilities
- **Firebase Security Best Practices:** Followed for all Firebase integrations
- **ISO 27001 Alignment:** Security controls aligned with ISO standards (in progress)

---

## 📞 Contact

- **Security Email:** security@ontour.app
- **General Support:** support@ontour.app
- **Documentation:** [docs/README.md](./README.md)

---

**Last Security Audit:** November 15, 2025  
**Next Scheduled Audit:** January 15, 2026  
**Security Team:** Sergi Recio (Lead), External Auditors (Q4 2025)
