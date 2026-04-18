# Security Improvements TODO

## 🔴 High Priority

### 1. Rate Limiting
- [x] Add rate limiting to OAuth initiation endpoint (`/api/auth/google`) - Uses `auth` limiter (5/15m)
- [x] Add rate limiting to OAuth callback endpoint (`/api/auth/google/callback`) - Uses `auth` limiter (5/15m)
- [x] Add rate limiting to logout endpoint - Uses `strict` limiter (3/1m) via `command` wrapper
- [x] Add rate limiting to session validation in `hooks.server.ts` - Global rate limiting for all API routes
- [x] Consider using a library like `@upstash/ratelimit` or implement in-memory/store-based rate limiting - Using `@upstash/ratelimit`
- [x] Set appropriate limits (e.g., 5 OAuth attempts per IP per 15 minutes) - Configured in `config.ts`

### 2. Automatic Session Cleanup
- [ ] Set up a cron job or scheduled task to run `cleanupExpiredSessions()`
- [ ] Run cleanup daily or every few hours
- [ ] Consider using a database job scheduler or external cron service
- [ ] Add logging for cleanup operations

## 🟡 Medium Priority

### 3. Session Token Entropy Enhancement
- [x] Consider using `crypto.getRandomValues()` for longer tokens (32+ bytes) - Using `crypto.randomUUID()` which is cryptographically secure
- [x] Or keep `crypto.randomUUID()` but ensure it's cryptographically secure - `crypto.randomUUID()` generates UUID v4 with 122 bits of entropy, which is cryptographically secure and sufficient for session tokens
- [x] Document token generation approach - Using `crypto.randomUUID()` for session tokens (UUID v4, 122 bits entropy)

### 4. IP Address Tracking
- [x] Add `ipAddress` column to `sessions` table - Added to schema
- [x] Store IP address when creating sessions - IP stored during session creation
- [x] Validate IP address on session validation (optional - can be too strict) - Skipped (too strict for users)
- [x] Add IP address change detection (log suspicious activity) - Detects and can log IP changes (logging TODO added)
- [x] Consider device fingerprinting for additional security - Implemented with combined client+server fingerprinting

### 5. Error Message Security
- [x] Review all error messages in OAuth callback - All errors now return generic messages
- [x] Ensure no sensitive information leaks (database errors, internal paths) - Fixed: removed config leak, internal error message leak
- [x] Use generic error messages for auth failures - All auth errors return "Authentication failed" or generic messages
- [x] Log detailed errors server-side only - Errors can be logged server-side (console.error), generic messages to client
- [x] Review error handling in `auth-actions.remote.ts` - Reviewed, uses generic error messages from i18n

### 6. Security Headers
- [x] Add Content-Security-Policy (CSP) header - Implemented in `securityHeaders.ts`
- [x] Add Strict-Transport-Security (HSTS) header - Implemented (HTTPS only)
- [x] Add X-Frame-Options header - Set to DENY
- [x] Add X-Content-Type-Options header - Set to nosniff
- [x] Add Referrer-Policy header - Set to strict-origin-when-cross-origin
- [x] Add Permissions-Policy header - Disables geolocation, microphone, camera
- [x] Implement in `hooks.server.ts` or middleware - Implemented in `hooks.server.ts`

### 7. Input Validation & Sanitization
- [x] Validate email format from OAuth data - Implemented with `isValidEmail()`
- [x] Validate name length and characters - Implemented with `validateName()` (max 255 chars, trims whitespace)
- [x] Sanitize picture URL (if allowing user-provided URLs) - Implemented with `validatePictureUrl()` (only allows HTTPS from Google domains)
- [x] Validate Google ID format - Implemented with `isValidGoogleId()` (alphanumeric, max 255 chars)
- [x] Add input validation helpers - Created `validation.ts` with all validation functions

### 8. OAuth Code Reuse Protection
- [ ] Verify authorization codes are single-use (Google handles this, but add explicit check)
- [ ] Add code validation before token exchange
- [ ] Consider storing used codes temporarily to prevent replay attacks

## 🟢 Low Priority

### 9. Session Activity Logging
- [ ] Create `session_logs` table or similar
- [ ] Log login events (timestamp, IP, user agent)
- [ ] Log logout events
- [ ] Log suspicious activity (IP changes, multiple sessions)
- [ ] Add audit trail for security incidents

### 10. Account Security Features
- [ ] Add account disable functionality
- [ ] Add account deletion functionality
- [ ] Add email verification (if adding email/password auth later)
- [ ] Add suspicious login detection (new device, new location)
- [ ] Add "Remember this device" functionality

### 11. Additional Security Enhancements
- [ ] Add CSRF tokens for form submissions (if adding forms)
- [ ] Implement session rotation on privilege escalation
- [ ] Add password reset flow (if adding email/password auth)
- [ ] Add 2FA/MFA support (if needed)
- [ ] Add account recovery options
- [ ] Implement password strength requirements (if adding passwords)

## 📝 Notes

- Review OAuth scopes - ensure only necessary scopes are requested
- Consider implementing refresh tokens for longer sessions
- Add monitoring/alerting for suspicious activity
- Regular security audits and dependency updates
- Consider using a security scanning tool (Snyk, Dependabot, etc.)

## 🔍 Code Review Checklist

- [ ] All user inputs are validated
- [ ] All database queries use parameterized statements (Drizzle handles this)
- [ ] No sensitive data in logs
- [ ] Environment variables are properly secured
- [ ] No hardcoded secrets
- [ ] Error handling doesn't leak information
- [ ] Session tokens are properly invalidated on logout
- [ ] Protected routes properly check authentication
- [ ] Admin routes properly check authorization

