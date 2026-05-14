# Senior Cybersecurity Engineer Audit: Brandavox AI

## Executive Summary
Brandavox AI implements several enterprise-grade security patterns, including end-to-end encryption for chat, strict Firestore security rules, and modern authentication flows. However, as with any complex SaaS platform, there are opportunities to harden the architecture against sophisticated attack vectors.

## Vulnerability Assessment

| ID | Vulnerability | Severity | Risk Description |
|---|---|---|---|
| SEC-01 | Hardcoded System Pepper | Low | The `SYSTEM_PEPPER` in `EncryptionService` is hardcoded, making it easier for an attacker to decrypt local storage if they compromise a client device. |
| SEC-02 | Missing CSRF Protection on API | Medium | Custom Express API routes (`/api/*`) lack explicit CSRF tokens, potentially allowing cross-site request forgery for sensitive operations like queuing jobs. |
| SEC-03 | Relational Integrity Gaps | Medium | Some Firestore rules rely on client-provided IDs without verifying the owner of the parent document via `get()` in all critical paths. |
| SEC-04 | Broad CSP Directives | Low | Content Security Policy includes broad wildcards (e.g., `https://*.google.com`) which, while necessary for SDKs, increases the surface area for certain types of XSS. |
| SEC-05 | Insecure Local Storage | Low | Sensitive social media tokens are stored in Firestore, but local application state might handle them insecurely during transitions. |

---

## Detailed Findings & Fixes

### 1. Hardcoded Secret (SEC-01)
**Risk:** An attacker with access to the source code or a compiled bundle can see the salt/pepper used for AES-256 encryption.
**Fix:** Move the pepper to a server-side environment variable and inject it or use a more robust Key Exchange (ECDH).
**Recommendation:** Use `import.meta.env.VITE_SYSTEM_PEPPER`.

### 2. Cross-Site Request Forgery (SEC-02)
**Risk:** A malicious site can trick a logged-in user's browser into sending a POST request to `/api/jobs` or other state-changing endpoints.
**Fix:** Implement `double-submit-cookie` pattern or a dedicated CSRF middleware.
**Recommendation:** Add `double-submit-cookie` logic to the Express app.

### 3. Firestore Rules Hardening (SEC-03)
**Risk:** An attacker could potentially write to a sub-collection by providing a valid `projectId` they don't own if the rule only checks if the `projectId` exists.
**Fix:** Use `get()` to verify the agency/owner of the parent resource inside the rule.
**Status:** Partially addressed in recent updates. Further hardening recommended for all nested paths.

---

## Secure Architecture Improvements

### Rate Limiting & Abuse Prevention
We have implemented specialized limiters for:
- Global traffic (`100 req / 15 min`)
- Authentication/AI Gateways (`20 req / 15 min`)

### Identity & Access Management (IAM)
- **Principle of Least Privilege**: Users are strictly partitioned by `agencyId` or `userId`.
- **Verified Access**: Critical operations requires `request.auth.token.email_verified == true`.

## Recommended Security Tools
1. **Snyk / Dependabot**: For tracking unsafe dependencies.
2. **OWASP ZAP**: For automated penetration testing of the Express API.
3. **Firebase App Check**: To ensure only your authorized app can access Firebase services.
