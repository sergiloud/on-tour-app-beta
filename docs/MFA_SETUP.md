# MFA Setup Guide - On Tour App

**Version:** v2.2.1  
**Last Updated:** November 16, 2025  
**Audience:** End Users & Administrators

---

## 🔒 Multi-Factor Authentication (MFA) Overview

On Tour App supports **advanced Multi-Factor Authentication** with multiple methods to secure your account. MFA adds an extra layer of protection beyond your password, significantly reducing the risk of unauthorized access.

### Supported MFA Methods

| Method | Security Level | Setup Time | Best For |
|--------|----------------|------------|----------|
| **Biometric (WebAuthn)** | ⭐⭐⭐⭐⭐ | 2 minutes | Primary daily use |
| **Hardware Keys** | ⭐⭐⭐⭐⭐ | 3 minutes | Maximum security |
| **TOTP Authenticator** | ⭐⭐⭐⭐ | 5 minutes | Cross-device access |
| **SMS Verification** | ⭐⭐⭐ | 1 minute | Emergency backup |
| **Backup Codes** | ⭐⭐⭐⭐ | 30 seconds | Account recovery |

---

## 🚀 Quick Setup (Recommended Path)

### Step 1: Enable Biometric Authentication (Primary)

**Best for:** Daily use with maximum convenience

1. Go to **Settings → Security → Multi-Factor Authentication**
2. Click **"Enable Biometric Authentication"**
3. Choose your device method:
   - **iOS/macOS:** Face ID or Touch ID
   - **Android:** Fingerprint or Face Unlock  
   - **Windows:** Windows Hello (fingerprint/face/PIN)
   - **Linux:** FIDO2 compatible authenticators

4. Follow the device prompts to register your biometric
5. **Test the setup:** Log out and back in to verify it works

✅ **Success:** You'll see a green checkmark next to "Biometric Authentication"

### Step 2: Set Up Backup Codes (Essential)

**Critical for:** Account recovery if you lose your device

1. In **Settings → Security → Backup Codes**
2. Click **"Generate Backup Codes"**
3. **Save these codes securely:**
   - Print them and store in a safe place
   - Save to password manager
   - Store in a secure note app
4. Each code can only be used **once**
5. Generate new codes when you have 3 or fewer remaining

⚠️ **Warning:** Without backup codes, losing your device could lock you out permanently

### Step 3: Add TOTP Authenticator (Cross-Device)

**Best for:** Accessing your account from multiple devices

1. Install an authenticator app:
   - **Recommended:** Google Authenticator, Authy, 1Password, Bitwarden
   - **Enterprise:** Microsoft Authenticator, Okta Verify

2. In **Settings → Security → TOTP Authentication**
3. Click **"Enable TOTP"**
4. Scan the QR code with your authenticator app
5. Enter the 6-digit code from your app to confirm
6. **Save the setup key** in case you need to re-add the account

✅ **Setup Complete:** You now have 3 secure authentication methods!

---

## 📱 Detailed Setup Instructions

### Biometric Authentication (WebAuthn/FIDO2)

#### iOS Devices (iPhone/iPad)

1. Ensure you have **iOS 14+** and Face ID or Touch ID enabled
2. Go to **Settings → Security → Multi-Factor Authentication**
3. Tap **"Enable Biometric Authentication"**
4. When prompted by iOS:
   - **Face ID:** Look at your device normally
   - **Touch ID:** Place your finger on the sensor
5. Safari will ask permission to use Face ID/Touch ID → Tap **"Allow"**
6. **Test immediately:** Sign out and back in

**Troubleshooting iOS:**
- If Face ID fails: Ensure good lighting and remove sunglasses
- If Touch ID fails: Clean the sensor and use a registered finger
- If setup fails: Try Safari instead of Chrome/other browsers

#### Android Devices

1. Ensure **Android 7+** with fingerprint or face unlock enabled
2. Open Chrome or supported browser (not all browsers support WebAuthn)
3. Go to **Settings → Security → Multi-Factor Authentication**
4. Tap **"Enable Biometric Authentication"**
5. Select authentication method when prompted:
   - **Fingerprint:** Place finger on sensor
   - **Face Unlock:** Look at your device
   - **Screen Lock:** Use your PIN/pattern/password
6. Chrome will ask permission → Tap **"Allow"**

**Troubleshooting Android:**
- Use Chrome browser for best compatibility
- Ensure screen lock is enabled in Android settings
- Try clearing Chrome data if authentication fails

#### Windows (Windows Hello)

1. Ensure **Windows 10 v1903+** with Windows Hello configured
2. Open Edge or Chrome browser
3. Go to **Settings → Security → Multi-Factor Authentication**
4. Click **"Enable Biometric Authentication"**
5. Windows Hello prompt will appear:
   - **Face recognition:** Look at your camera
   - **Fingerprint:** Use your registered finger
   - **PIN:** Enter your Windows Hello PIN
6. Browser will ask permission → Click **"Allow"**

**Troubleshooting Windows:**
- Use Edge browser for best Windows Hello integration
- Ensure Windows Hello is set up in Windows Settings
- Check camera/fingerprint reader is working

#### macOS (Touch ID)

1. Ensure **macOS Big Sur+** with Touch ID enabled (MacBook Pro/Air)
2. Open Safari browser (recommended) or Chrome
3. Go to **Settings → Security → Multi-Factor Authentication**
4. Click **"Enable Biometric Authentication"**
5. Touch ID sensor prompt → Place your registered finger
6. Safari will ask permission → Click **"Allow"**

### Hardware Security Keys (YubiKey, etc.)

#### Supported Keys
- **YubiKey 5 Series** (USB-A, USB-C, NFC, Lightning)
- **YubiKey Security Key** (budget option)
- **SoloKeys**
- **Nitrokey FIDO2**
- **Any FIDO2/WebAuthn compatible key**

#### Setup Process

1. **Insert your security key** (USB) or ensure NFC is enabled
2. Go to **Settings → Security → Hardware Keys**
3. Click **"Add Security Key"**
4. **Touch/tap your key** when it lights up or vibrates
5. **Name your key** (e.g., "YubiKey Work", "Backup Key")
6. Test immediately by signing out and back in

**Best Practices:**
- Register **2 keys minimum** (primary + backup)
- Store backup key in a secure location (safe, bank deposit box)
- Register keys from different manufacturers for redundancy

### TOTP Authenticator Apps

#### Recommended Apps

| App | Platform | Backup | Sync | Free |
|-----|----------|--------|------|------|
| **Google Authenticator** | iOS, Android | ✅ | ✅ | ✅ |
| **Authy** | iOS, Android, Desktop | ✅ | ✅ | ✅ |
| **1Password** | All platforms | ✅ | ✅ | 💰 |
| **Bitwarden** | All platforms | ✅ | ✅ | ✅/💰 |
| **Microsoft Authenticator** | iOS, Android | ✅ | ✅ | ✅ |

#### Setup Steps

1. **Install your chosen app** from official app store
2. In On Tour App: **Settings → Security → TOTP Authentication**
3. Click **"Enable TOTP"**
4. **Scan QR code** with authenticator app:
   - Open authenticator app
   - Tap "+" or "Add account"
   - Point camera at QR code
5. **Enter the 6-digit code** displayed in your app
6. **Save setup key** (manual entry code) in secure location
7. **Test immediately** by signing out and using the TOTP code

#### Manual Setup (if QR scan fails)

1. In authenticator app, choose **"Manual entry"**
2. **Account name:** "On Tour App - [Your Email]"
3. **Setup key:** Copy the code shown below the QR code
4. **Time-based:** Ensure this is selected (6-digit, 30-second)
5. Save and use the generated code to complete setup

### SMS Verification (Backup Only)

⚠️ **Security Note:** SMS is less secure than other methods due to SIM swapping risks. Use only as emergency backup.

#### Setup Process

1. Go to **Settings → Security → SMS Verification**
2. Click **"Add Phone Number"**
3. Enter your phone number with country code (e.g., +1234567890)
4. **Receive verification SMS** and enter the code
5. **Set as backup only** (recommended)

#### Supported Countries
- ✅ United States, Canada
- ✅ United Kingdom, Ireland  
- ✅ European Union (all countries)
- ✅ Australia, New Zealand
- ✅ Japan, South Korea
- ✅ Brazil, Mexico
- ⚠️ Some countries may have limitations or delays

---

## ⚙️ Organization Settings (Admins)

### MFA Enforcement Policies

Administrators can enforce MFA requirements for their organization:

#### Policy Options

1. **Voluntary MFA** (Default)
   - Users can enable MFA optionally
   - No enforcement or deadlines
   - Good for smaller teams with high trust

2. **Recommended MFA**
   - Users see reminders to enable MFA
   - Grace period of 30 days for new accounts
   - Email notifications for unprotected accounts

3. **Required MFA**
   - All users must enable MFA within 7 days
   - Account access restricted until MFA is enabled
   - Only backup codes work for initial setup

4. **Strict MFA Policy**
   - Biometric or hardware key required (no SMS)
   - TOTP acceptable with admin approval
   - Immediate enforcement for new users

#### Setting Organization Policy

1. Go to **Organization Settings → Security Policies**
2. Select **"Multi-Factor Authentication"**
3. Choose your enforcement level
4. Set grace period (if applicable)
5. Configure exemptions (if needed)
6. **Save and notify users** via email

#### Monitoring MFA Adoption

**Dashboard:** Organization Settings → Security → MFA Status

| Metric | Description |
|--------|-------------|
| **MFA Enabled** | Percentage of users with any MFA method |
| **Strong MFA** | Users with biometric/hardware keys |
| **Backup Prepared** | Users with backup codes generated |
| **Compliance** | Users meeting current policy requirements |

### Emergency Access Procedures

#### Admin Override (Break Glass)

When a user is locked out and has lost all MFA methods:

1. **Verify user identity** through multiple channels:
   - In-person verification (if possible)
   - Video call with ID verification
   - Multiple trusted team members vouching
   - Alternative contact methods (secondary email, emergency contact)

2. **Organization Owner** can grant temporary access:
   - Go to **Organization Settings → Members**
   - Find the locked-out user
   - Click **"Emergency Access"**
   - Select **"Temporary MFA Bypass (24 hours)"**
   - **Document the reason** in audit log

3. **Immediate security actions:**
   - User must set up new MFA within 24 hours
   - Force password reset on next login
   - Review recent account activity for suspicious behavior
   - Generate new backup codes

#### Account Recovery Process

For users who have lost all authentication methods:

1. **Contact support:** security@ontour.app
2. **Provide verification:**
   - Full name and email address
   - Organization name and your role
   - Recent account activity you can describe
   - Alternative contact methods
3. **Wait for verification:** 1-3 business days
4. **Temporary access granted:** 48-hour window to re-establish MFA

---

## 🔧 Troubleshooting

### Common Issues

#### "Authentication Failed" Errors

**Biometric Authentication:**
```
Error: "Face ID/Touch ID not recognized"
Solutions:
1. Ensure good lighting conditions
2. Clean camera lens or fingerprint sensor  
3. Remove sunglasses or gloves
4. Try alternative registered biometric
5. Use backup code if repeated failures
```

**Hardware Keys:**
```
Error: "Security key not detected"
Solutions:
1. Ensure key is fully inserted (USB)
2. Try different USB port
3. Enable NFC if using NFC key
4. Update browser to latest version
5. Try different browser (Edge/Chrome/Safari)
```

**TOTP Codes:**
```
Error: "Invalid authentication code"
Solutions:
1. Ensure device time is synchronized
2. Wait for new code generation (codes change every 30 seconds)
3. Try the next code if timing is close to expiration
4. Check if you're using the correct account in app
5. Re-sync authenticator app time settings
```

#### Setup Problems

**QR Code Won't Scan:**
1. Increase screen brightness
2. Remove screen protector temporarily
3. Try manual entry instead
4. Use different authenticator app
5. Take screenshot and scan on different device

**Browser Compatibility:**
```
Fully Supported:
✅ Chrome 67+ (all platforms)
✅ Safari 14+ (macOS, iOS)
✅ Edge 18+ (Windows)
✅ Firefox 60+ (limited WebAuthn support)

Limited Support:
⚠️ Internet Explorer (not supported)
⚠️ Older mobile browsers
⚠️ Some privacy-focused browsers
```

### Getting Help

1. **Self-Service:** Check this guide and try troubleshooting steps
2. **Team Admin:** Contact your organization administrator
3. **Support Email:** security@ontour.app (include error screenshots)
4. **Emergency:** If completely locked out, email with verification details

---

## 🛡️ Security Best Practices

### Do's ✅

- **Enable multiple MFA methods** for redundancy
- **Generate and store backup codes** securely
- **Test your MFA setup** regularly
- **Keep authenticator apps updated**
- **Register backup security keys**
- **Review active sessions** monthly
- **Use trusted devices** only
- **Enable device notifications** for sign-ins

### Don'ts ❌

- **Don't share backup codes** with anyone
- **Don't screenshot TOTP QR codes** (security risk)
- **Don't rely on SMS only** (SIM swapping risk)
- **Don't save backup codes** in cloud notes unencrypted
- **Don't use the same security key** for multiple critical accounts
- **Don't ignore failed authentication alerts**
- **Don't set up MFA on untrusted devices**

### Pro Tips 💡

1. **Backup Strategy:** Keep backup codes in 2 separate secure locations
2. **Travel Preparedness:** Ensure MFA works while traveling/roaming
3. **Team Coordination:** Ensure multiple admins have MFA enabled
4. **Regular Testing:** Test backup methods quarterly
5. **Documentation:** Keep MFA setup info in team password manager
6. **Incident Response:** Have clear procedures for MFA-related lockouts

---

## 📋 Quick Reference

### Setup Priority Order

1. **🥇 Primary:** Biometric (WebAuthn) - Daily use
2. **🥈 Essential:** Backup Codes - Emergency access  
3. **🥉 Secondary:** TOTP Authenticator - Cross-device
4. **📱 Backup:** Hardware Key - Maximum security
5. **⚠️ Last Resort:** SMS - Emergency only

### Support Contacts

- **General Help:** support@ontour.app
- **Security Issues:** security@ontour.app  
- **Emergency Access:** Call organization owner directly
- **Documentation:** [docs.ontour.app/security](https://docs.ontour.app/security)

---

**Last Updated:** November 16, 2025  
**Document Version:** v2.2.1  
**Next Review:** February 2026