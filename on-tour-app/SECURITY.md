# Security Policy

## Known Vulnerabilities

### xlsx (SheetJS)
**Severity**: High  
**Status**: Acknowledged - Under Review  
**Issue**: Prototype Pollution and ReDoS vulnerabilities  
**Mitigation**: 
- Library is only used for export functionality
- No user-provided Excel files are parsed
- Feature runs in controlled environment
- Consider migration to alternative library in future releases

**Tracking**: 
- [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)
- [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@ontourapp.com or create a private security advisory on GitHub.

## Security Best Practices

- All dependencies are regularly audited
- Automated security updates via Dependabot (recommended)
- Strict Content Security Policy in production
- No sensitive data in logs or client-side storage
- All API calls use HTTPS
- Environment variables for secrets

---

## 🚨 ALPHA LIMITATIONS (As of Oct 2025)

**⚠️ This application is in ALPHA phase with known security limitations**

### Critical Limitations for Alpha

Based on Panorama Alpha security assessment (5/10), the following limitations exist:

#### 1. localStorage Encryption (NOT ACTIVE)
- **Status**: `secureStorage` infrastructure exists but stores in plaintext
- **Risk**: Low for internal use (Danny only), HIGH for external beta
- **Impact**: Auth tokens, user data, financial targets stored unencrypted
- **Mitigation**: Controlled environment, single trusted user

#### 2. Client-Side Permission Validation
- **Status**: `can()` function validates permissions locally (localStorage)
- **Risk**: User can modify `demo:links` scopes via DevTools
- **Impact**: Privilege escalation possible
- **Mitigation**: Single user environment, no malicious actors expected

#### 3. Authentication Without Real Tokens
- **Status**: Simple boolean flag (`demo:authed`) in localStorage
- **Risk**: No JWT, no expiration, no remote logout
- **Impact**: Session persists indefinitely, no revocation mechanism
- **Mitigation**: Demo environment only, not production-ready

#### 4. Multi-Tenant Data Not Isolated
- **Status**: All tenant data in same localStorage, no backend enforcement
- **Risk**: Cross-tenant data leaks possible via DevTools
- **Impact**: Agency could theoretically access artist data
- **Mitigation**: Alpha uses single tenant (Danny Avila)

### Acceptable Use for Alpha
✅ Internal demos with Danny Avila  
✅ Development and testing  
✅ Stakeholder presentations (mock data)  

❌ External beta without refactoring  
❌ Real sensitive data storage  
❌ Multi-user production environment  

### Required Before Beta
1. Activate real AES-256 encryption in secureStorage
2. Implement JWT-based authentication with expiration
3. Add backend permission validation
4. Enforce tenant data isolation server-side
5. Add Content Security Policy headers
6. External security audit

### References
- See `docs/CODIGO_ROJO_COMPLETADO.md` for implemented security features
- See `docs/XSS_PROTECTION_IMPLEMENTATION.md` for XSS mitigations (✅ DONE)
- See `docs/SECURE_STORAGE_IMPLEMENTATION.md` for encryption design (⏸️ NOT ACTIVE)

**For detailed limitations analysis, see internal Panorama Alpha report.**
