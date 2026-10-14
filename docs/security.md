# NoteSpace Security Architecture & Implementation

NoteSpace employs defense-in-depth principles across its frontend, API layer, and database interactions.

## 1. Authentication & Session Security

- **Dual-Token Pattern:**
  - Short-lived Access Token (15-minute lifespan): Sent via `Authorization: Bearer <token>` in memory/localStorage.
  - Long-lived Refresh Token (7-day lifespan): Stored exclusively in an `HttpOnly`, `SameSite=Strict` cookie (`Secure` in production).
- **Session Tracking & Revocation:**
  - Refresh tokens are hashed using SHA-256 and tracked in the `RefreshSession` collection.
  - Logging out or changing passwords invalidates sessions server-side.
- **Password Protection:**
  - Passwords are salted and hashed using `bcryptjs` with configurable 12 rounds.
  - Schema requires strong passwords (min 8 chars, uppercase, lowercase, number).
  - Password hashes are marked `{ select: false }` in Mongoose and never exposed in JSON responses.

---

## 2. Network & Header Defenses

- **Helmet:** Sets secure HTTP response headers (`Content-Security-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options: SAMEORIGIN`).
- **CORS Allowlist:** Only allows explicit client origins (`CLIENT_ORIGIN`), disallowing wildcard or arbitrary cross-origin requests.
- **Rate Limiting:**
  - General API: 300 requests per 60 seconds per IP.
  - Authentication (`/auth/login`, `/auth/register`): 10 requests per 15 minutes per IP to mitigate brute force attacks.
  - Search: 60 requests per 60 seconds per IP.

---

## 3. Data Validation & Injection Prevention

- **Zod Schema Validation:** All request payloads (`req.body`, `req.query`, `req.params`) are strictly validated and stripped of unknown properties.
- **NoSQL Injection Defenses:**
  - Mongoose typed schemas and strict casting disallow operator injection (e.g. `{ $gt: '' }`).
  - IDs are verified via `Types.ObjectId.isValid` before querying.
- **XSS Mitigation:**
  - React auto-escapes rendered text.
  - HTML body parsers have strict request size caps (2MB).

---

## 4. Multi-Tenant Data Isolation

- Every database query for notes, categories, tags, and sessions strictly scopes using `{ userId: req.user.userId }`.
- Cross-user access returns `404 Not Found` or `403 Forbidden` to prevent object-level authorization bypasses (IDOR).

---

## 5. Role-Based Access Control (RBAC) & Administrative Security

- **Server-Side Role Verification:**
  - `requireAdmin` middleware checks both the decoded JWT and live database state to verify `role === 'admin'` and `status !== 'suspended'`.
  - Stale or tampered tokens are rejected before reaching controller logic.
- **Root Admin Safeguards:**
  - Logic prevents an administrator from accidentally demoting or deleting their own account.
  - Prevents removal, demotion, or suspension of the sole active administrator.
- **Account Suspension Mechanism:**
  - When a user is suspended, all active refresh tokens in `RefreshSession` are instantly revoked server-side, blocking subsequent API calls immediately.
- **Zero Public Admin Registration:**
  - No public API allows registering as an administrator.
  - Admin accounts are strictly provisioned via authenticated server CLI scripts (`npm run seed:admin`).
- **Privacy-by-Default Note Inspection:**
  - Admin bulk note lists never expose note content (`-content`).
  - Accessing note content requires entering an administrative justification, and the access event is irrevocably logged to the `AuditLog` collection.
- **Immutable Append-Only Audit Trail:**
  - Sensitive administrative operations (role shifts, account suspensions, deletions, content views) are permanently written to MongoDB with actor ID, email, IP address, timestamp, and metadata.

