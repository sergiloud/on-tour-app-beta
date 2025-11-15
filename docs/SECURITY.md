# Security Policy

**Version:** 2.1.0-beta  
**Last Updated:** November 15, 2025  
**Scope:** Production & Beta Environments

---

## 🔒 Security Features (v2.1)

### Authentication & Access Control

- ✅ **Firebase Authentication:** Email/password with email verification
- ✅ **Multi-Factor Authentication (MFA):** SMS verification, TOTP, backup codes
- ✅ **Role-Based Access Control (RBAC):** Owner, Admin, Member, Viewer
- ✅ **Session Management:** Automatic token refresh, secure logout
- ✅ **OAuth Integration:** Google, Microsoft, Apple (planned Q1 2026)

### Multi-Tenancy Security

- ✅ **Organization Isolation:** All data scoped to organization ID
- ✅ **Firestore Security Rules:** Server-side data access validation
- ✅ **Permission Checks:** Client-side guards + server-side enforcement
- ✅ **Invite System:** Email-based invites with expiration (7 days)
- ✅ **Link Invitations:** Shareable links with role enforcement

### Data Protection

- ✅ **Encryption in Transit:** HTTPS/TLS 1.3 for all connections
- ✅ **Encryption at Rest:** Firebase default encryption (AES-256)
- ✅ **Input Sanitization:** XSS prevention, SQL injection protection
- ✅ **CSRF Protection:** Token-based validation for state-changing operations
- ✅ **Rate Limiting:** API throttling (100 req/min per user)

### Application Security

- ✅ **Content Security Policy (CSP):** Strict CSP headers via Helmet.js
- ✅ **Security Headers:** HSTS, X-Frame-Options, X-Content-Type-Options
- ✅ **Dependency Scanning:** Automated npm audit on CI/CD
- ✅ **Secret Management:** Environment variables, no hardcoded secrets
- ✅ **Audit Logging:** Activity tracking in Timeline feature

See [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) for implementation details.

---

## 📋 Known Vulnerabilities

### xlsx (SheetJS)

**Severity:** High  
**Status:** Acknowledged - Under Review  
**Issue:** Prototype Pollution and ReDoS vulnerabilities  

**Mitigation:**
- Library is only used for **export functionality** (user-initiated)
- **No user-provided Excel files are parsed** (no upload feature)
- Feature runs in **controlled environment** (browser sandboxed)
- Input data is **sanitized and validated** before export
- Consider migration to **alternative library** in v2.2 (Q1 2026)

**Tracking:**
- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6) - Prototype Pollution
- [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9) - ReDoS

**Risk Assessment:** Low (export-only, no file uploads, sanitized data)

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
