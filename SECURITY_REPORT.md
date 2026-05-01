# WebGenix Security Vulnerability Report

**Date**: May 1, 2026  
**Project**: WebGenix (Node.js/Express + React/Vite)  
**Auditor**: Automated Security Scan

---

## Executive Summary

A security audit of the WebGenix project identified **12 vulnerabilities** across critical, high, medium, and low severity levels. The most critical issues involve hardcoded secrets in `.env` files and weak cryptographic randomness. Immediate action is required for CRITICAL and HIGH severity findings.

| Severity | Count |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 1 |
| MEDIUM | 6 |
| LOW | 4 |

---

## Critical Vulnerabilities

### 1. Hardcoded Secrets in .env Files

**Severity**: CRITICAL  
**Files**: 
- `C:\Users\Anurag\Music\WebGenix\.env` (lines 15-16, 21-22, 29-30)
- `C:\Users\Anurag\Music\WebGenix\webgenix-backend\.env` (lines 29-30)

**Description**: The `.env` files contain actual credentials including:
- `MONGO_ROOT_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`

**Risk**: If these files are committed to version control or accessible to unauthorized users, all authentication and payment systems are compromised.

**Recommendation**:
1. Rotate ALL exposed credentials immediately
2. Ensure `.env` is in `.gitignore`
3. Use `.env.example` with placeholder values
4. Consider using a secrets manager for production

---

## High Severity Vulnerabilities

### 2. Weak Randomness in Crypto Service

**Severity**: HIGH  
**File**: `webgenix-backend\src\services\crypto.service.js` (lines 17-18)

**Description**: The `generateRandomCode()` function uses `Math.random()` which is NOT cryptographically secure.

```javascript
export const generateRandomCode = (length = 6) => {
    return Math.floor(Math.random() * 10 ** length).toString().padStart(length, '0');
};
```

**Risk**: If used for OTPs, verification codes, or security tokens, these can be predicted by an attacker.

**Recommendation**: Replace with Node.js crypto module:
```javascript
import crypto from 'crypto';

export const generateRandomCode = (length = 6) => {
    const min = 10 ** (length - 1);
    const max = 10 ** length - 1;
    return crypto.randomInt(min, max + 1).toString();
};
```

---

## Medium Severity Vulnerabilities

### 3. Excessive Debug Logging in Production

**Severity**: MEDIUM-HIGH  
**Files Affected**:
- `webgenix-backend\src\modules\payments\razorpay.webhook.js`
- `webgenix-backend\src\modules\billing\services\billing.service.js`
- `webgenix-backend\src\modules\billing\services\razorpay.service.js`
- `webgenix-backend\src\modules\billing\payment.controller.js`
- `webgenix-backend\src\services\cron.service.js`
- `webgenix-backend\src\config\backup.js`

**Description**: Multiple `console.log` and `console.error` statements may leak sensitive data including payment IDs, user IDs, and internal state.

**Recommendation**: Remove debug logs or use the existing `logger` utility that respects `NODE_ENV`.

### 4. Content Security Policy Allows Unsafe-Inline

**Severity**: MEDIUM  
**File**: `webgenix-backend\src\app.js` (line 20)

```javascript
styleSrc: ["'self'", "'unsafe-inline'"],
```

**Risk**: Reduces XSS defense effectiveness.

**Recommendation**: Use nonces or hashes for inline styles instead of `'unsafe-inline'`.

### 5. NoSQL Injection Risk in Ticket Search

**Severity**: MEDIUM  
**File**: `webgenix-backend\src\modules\tickets\ticket.service.js` (lines 278-284)

**Description**: Regex-based search with user input could be exploited for NoSQL injection or ReDoS attacks.

**Recommendation**:
- Use MongoDB text indexes for search
- Implement stricter input sanitization
- Add query complexity limits

### 6. Backup Security Concerns

**Severity**: MEDIUM  
**File**: `webgenix-backend\src\config\backup.js`

**Description**: Backups are stored as JSON files within the project structure and may contain passwords, JWT tokens, and payment information.

**Recommendation**:
- Store backups outside web root
- Encrypt backup files
- Ensure backup directory is in `.gitignore`
- Set proper file permissions

### 7. Payment Debug Information Exposure

**Severity**: MEDIUM  
**File**: `webgenix-backend\src\modules\billing\payment.controller.js` (line 52)

**Description**: Full payment objects are logged, potentially exposing transaction data.

**Recommendation**: Never log full payment objects; log only non-sensitive identifiers.

### 8. Cookie Secure Flag Environment-Dependent

**Severity**: LOW-MEDIUM  
**File**: `webgenix-backend\src\config\env.js` (line 38)

**Description**: `COOKIE_SECURE` depends on environment variable which could be misconfigured in production.

**Recommendation**: Make secure cookies a hard requirement in production.

---

## Low Severity Vulnerabilities

### 9. In-Memory Rate Limiting

**File**: `webgenix-backend\src\middlewares\rateLimit.middleware.js`

**Description**: Uses default in-memory store which won't work across multiple server instances.

**Recommendation**: Use Redis or similar distributed store for production.

### 10. CORS Single Origin Limitation

**File**: `webgenix-backend\src\app.js` (lines 31-34)

**Description**: Only a single origin allowed; may not scale for multiple environments.

**Recommendation**: Implement dynamic CORS origin validation.

### 11. Error Response Information Leakage

**File**: `webgenix-backend\src\middlewares\error.middleware.js` (lines 20-24)

**Description**: Error messages could reveal system information.

**Recommendation**: Use generic error messages for auth failures and sensitive operations.

### 12. Dependency Security

**File**: `webgenix-backend\package.json`

**Recommendation**: Regularly run `npm audit` and update vulnerable packages.

---

## Immediate Action Items

1. **[CRITICAL]** Rotate all credentials in `.env` files
2. **[CRITICAL]** Verify `.env` is properly gitignored
3. **[HIGH]** Fix `crypto.service.js` to use `crypto.randomInt()`
4. **[MEDIUM]** Remove or secure all debug logging
5. **[MEDIUM]** Review and secure backup process
6. **[MEDIUM]** Run `npm audit` for dependency vulnerabilities
7. **[MEDIUM]** Ensure `COOKIE_SECURE=true` in production

---

## Files Requiring Attention

| File | Issue | Severity |
|------|-------|----------|
| `.env` | Hardcoded secrets | CRITICAL |
| `webgenix-backend/.env` | Hardcoded Razorpay credentials | CRITICAL |
| `webgenix-backend/src/services/crypto.service.js` | Weak randomness | HIGH |
| `webgenix-backend/src/app.js` | CSP unsafe-inline | MEDIUM |
| `webgenix-backend/src/modules/tickets/ticket.service.js` | NoSQL injection risk | MEDIUM |
| `webgenix-backend/src/config/backup.js` | Backup security | MEDIUM |
| `webgenix-backend/src/modules/billing/payment.controller.js` | Sensitive data logging | MEDIUM |

---

## Contact

For questions about this report or to report security issues, contact the development team.

**END OF REPORT**
