# Server Audit: Security, Performance & DB Optimization

> **Date:** 2026-05-05
> **Scope:** `server/src/` — all controllers, services, models, middleware, utils, workers
> **Total Issues Found:** 40 (2 Critical, 6 High, 5 Medium Security · 10 Performance · 7 DB · 10 Code Quality)

---

## Table of Contents

1. [Critical Security](#1-critical-security)
2. [High Security](#2-high-security)
3. [Medium Security](#3-medium-security)
4. [Low Security](#4-low-security)
5. [Performance](#5-performance)
6. [Database Query Optimization](#6-database-query-optimization)
7. [Code Quality](#7-code-quality)
8. [Summary Table](#8-summary-table)
9. [Recommended Fix Order](#9-recommended-fix-order)

---

## 1. Critical Security

### CRIT-1 — Real Credentials Committed to Version Control

**Severity:** Critical
**Files:** `.env` (lines 10–32), `.env.production` (lines 11–55)

Both `.env` files are tracked by git and contain live production secrets:

- MongoDB Atlas URIs with embedded passwords
- Backblaze B2 Application Keys
- Gmail SMTP App Password (`itzariful777@gmail.com`)
- Brevo (Sendinblue) API keys (dev + prod)
- Google OAuth Client Secrets
- JWT signing secrets
- Google Gemini API key, ImageKit private key

**Impact:** Full database read/write, cloud storage read/write/delete, email sending as the owner account, complete account takeover via forged JWTs.

**Fix:**
1. Rotate every listed credential immediately before anything else.
2. Add the following to `.gitignore`:
   ```
   server/.env
   server/.env.production
   .env
   .env*.local
   ```
3. Remove the committed files from git history (`git filter-repo` or `BFG Repo Cleaner`).
4. Migrate secrets to a secrets manager (Doppler, AWS Secrets Manager, or GitHub Actions Secrets for CI/CD).
5. Add a startup guard that exits the process if any required env var is absent (see CRIT-2 fix).

---

### CRIT-2 — Hardcoded Fallback JWT Secret

**Severity:** Critical
**Files:** `src/utils/auth/token.ts:10–11`, `src/middlewares/auth.ts:23`

```typescript
// token.ts
const secret = process.env.JWT_ACCESS_TOKEN_SECRET! || 'secret';

// auth.ts
const decoded = verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET! || 'secret');
```

If `JWT_ACCESS_TOKEN_SECRET` is unset or misconfigured, the server silently falls back to the string `'secret'`. Any attacker who knows this (it is public once the source is leaked) can forge valid JWTs and gain full admin access.

**Fix:**
```typescript
// src/utils/env.ts — validate at startup
const REQUIRED_ENV_VARS = [
  'JWT_ACCESS_TOKEN_SECRET',
  'MONGODB_URI',
  'BACKBLAZE_KEY_ID',
  // ...all required vars
];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}
```

```typescript
// token.ts — remove fallback entirely
const secret = process.env.JWT_ACCESS_TOKEN_SECRET!;
// If undefined, the startup guard above already killed the process.
```

---

## 2. High Security

### HIGH-1 — No Rate Limiting on Any Route

**Severity:** High
**Files:** `src/app.ts` (entire file), all route files

`express-rate-limit` (or any equivalent) is not installed. Every endpoint is open to abuse:

| Endpoint | Risk |
|---|---|
| `POST /auth/login` | Unlimited brute-force password guessing |
| `POST /auth/register` | Unlimited account creation / spam |
| `POST /auth/resend-verification` | Email flooding |
| `GET /auth/verify-email` | Token enumeration |
| `POST /auth/google/callback` | OAuth code replay |
| `POST /admin/users/:id/credits` | No throttle on credit manipulation |
| All upload routes | No upload frequency limit |

**Fix:**
```bash
npm install express-rate-limit
```

```typescript
// src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});
```

Apply in `app.ts`:
```typescript
app.use('/auth', authLimiter);
app.use('/media', uploadLimiter);
app.use(generalLimiter);
```

---

### HIGH-2 — `registerAgent` Has No Input Validation

**Severity:** High
**Files:** `src/modules/auth/controller.ts:140`, `src/modules/auth/service.ts:301`

```typescript
// controller.ts line 140
const result = await authService.registerAgent(req.body); // raw req.body, no Zod parse
```

`firstName`, `lastName`, and `password` are written directly from the request with no length, format, or type constraints.

**Fix:**
```typescript
// src/modules/auth/schema.ts — add:
export const RegisterAgentSchema = z.object({
  token: z.string().min(1),
  firstName: sanitizedString(z.string().min(1).max(50)),
  lastName: sanitizedString(z.string().min(1).max(50)),
  password: z.string().min(8).max(128),
});

// controller.ts
const data = RegisterAgentSchema.parse(req.body);
const result = await authService.registerAgent(data);
```

---

### HIGH-3 — Insecure Direct Object Reference on Attachment Preview

**Severity:** High
**File:** `src/modules/application/service.ts:194–198`

`objectKey` comes from `req.query.key` with no validation of structure or ownership prefix before a presigned S3 URL is generated.

**Fix:**
```typescript
// Validate the key belongs to the expected namespace
const ALLOWED_PREFIXES = [`users/${userId}/`, `workspaces/`];
const isAllowed = ALLOWED_PREFIXES.some(p => objectKey.startsWith(p));
if (!isAllowed || objectKey.includes('..')) {
  throw new CustomError('Invalid document key', 400);
}
```

---

### HIGH-4 — No CSRF Protection

**Severity:** High
**File:** `src/app.ts`, `src/utils/cookieConfig.ts`

Auth cookies use `sameSite: 'lax'`, which does not protect sub-resource or same-site requests. No synchronizer token or double-submit cookie pattern is implemented.

**Fix:**
- Change `sameSite` to `'strict'` in `cookieConfig.ts` unless OAuth redirects require `lax`.
- If `lax` is required, install `csrf` or `lusca` and apply to all state-mutating routes.
- Ensure all non-GET routes require a valid `Authorization` header or CSRF token.

---

### HIGH-5 — `updateUserRole` Accepts Arbitrary Role String

**Severity:** High
**File:** `src/modules/admin/service.ts:43–48`

```typescript
user.role = role as any; // TypeScript bypass; relies solely on Mongoose enum at DB layer
await user.save();
```

**Fix:**
```typescript
const VALID_ROLES = ['admin', 'agent', 'client'] as const;
if (!VALID_ROLES.includes(role as any)) {
  throw new CustomError('Invalid role', 400);
}
user.role = role as typeof VALID_ROLES[number];
```

---

### HIGH-6 — Invitation Token Endpoint Has No Rate Limiting

**Severity:** High
**Files:** `src/modules/auth/service.ts:291`, `src/modules/admin/invitation.service.ts:79`

Combined with HIGH-1, the invitation verification endpoint has no throttle, enabling timing-based token enumeration via MongoDB response latency.

**Fix:**
- Apply `authLimiter` to the invitation verification route.
- Fetch by `email` first, then compare the token in-process with `crypto.timingSafeEqual` rather than using the token as the primary query key.

---

## 3. Medium Security

### MED-1 — `(req as any).user` Bypasses Null-Checks in 10+ Controllers

**Files:** `auth/controller.ts:19,101`, `application/controller.ts` (~12 sites), `admin/invitation.controller.ts:7–8`, `admin/workspace.controller.ts:7,56`

```typescript
const userId = (req as any).user.userId; // if requireAuth is missing, this throws 500
```

**Fix:** The `Express.Request` is already augmented in `src/types/auth.type.ts`. Use:
```typescript
const userId = req.user!.userId; // safe after requireAuth middleware
```

---

### MED-2 — `createOrUpdateService` Passes Raw `req.body` to `Object.assign`

**File:** `src/modules/service/service.ts:8–18`

```typescript
Object.assign(existing, data); // data = req.body, completely unvalidated
return Service.create(data);
```

**Fix:** Define and apply a Zod schema for service creation/update. Never `Object.assign` an unvalidated payload onto a Mongoose document.

---

### MED-3 — `addCredits` Allows Negative Amounts (Balance Drain)

**File:** `src/modules/admin/service.ts:54–60`

`amount` comes from `req.body` with no type, sign, or integer constraint. A negative value subtracts balance; a float injects fractional cents.

**Fix:**
```typescript
// schema
amount: z.number().int().positive()

// service — use atomic $inc to avoid race condition
const result = await User.findByIdAndUpdate(
  userId,
  { $inc: { balance: amount } },
  { new: true }
);
```

---

### MED-4 — `clearCookie` in Logout Missing `domain` Option

**File:** `src/modules/auth/controller.ts:116–120`

`res.clearCookie` options must exactly match `res.cookie` options. If `COOKIE_DOMAIN` is set in production, the cookie will not be cleared because the `domain` is omitted from the clear call.

**Fix:**
```typescript
// src/utils/cookieConfig.ts
export const CLEAR_COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
};

// auth/controller.ts
res.clearCookie('accessToken', CLEAR_COOKIE_CONFIG);
```

---

### MED-5 — Invoice Generator Resolves Path Outside App Directory

**File:** `src/utils/invoice.service.ts:32–35`

```typescript
const logoPath = path.resolve(__dirname, '../../../client/public/logo.png');
```

This traverses three directories above `dist/utils/` at runtime, depending on the sibling `client/` project being present — which it is not inside the Docker container.

**Fix:** Copy the logo into `server/src/assets/logo.png` and reference it as:
```typescript
const logoPath = path.resolve(__dirname, '../assets/logo.png');
```

---

## 4. Low Security

### LOW-1 — Email Templates Do Not HTML-Escape User Data

**Files:** `src/utils/email/applicationUpdates.ts:38,43,83`, `emailVerification.ts:50,54,62`, `invitation.ts:59,62`, `welcomeClient.ts:49`

User-provided values (`name`, `newStatus`, `agentName`, `documentName`) are interpolated directly into HTML strings. A malformed value could inject content into email clients that render HTML.

**Fix:**
```typescript
// src/utils/escapeHtml.ts
export const escapeHtml = (str: string) =>
  str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
     .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

// In each template:
Hi ${escapeHtml(displayName)},
```

---

### LOW-2 — `zodSanitizer.ts` Only Trims — No HTML Stripping

**File:** `src/utils/zodSanitizer.ts:12–13`

The sanitizer comment acknowledges the gap. Fields like `firstName`, `lastName` flow into PDF invoices and email HTML.

**Fix:** Use the `escapeHtml` utility above in `sanitizedString`, or integrate `dompurify` (server-side via `isomorphic-dompurify`).

---

### LOW-3 — `handleError` Leaks Raw Error Messages

**File:** `src/utils/handleError.ts:20–25`

Any error with a non-500 `status` property has its `.message` sent verbatim to the client, potentially exposing internal paths or query details from third-party libraries.

**Fix:**
```typescript
if (error instanceof CustomError) {
  return res.status(error.status).json({ success: false, message: error.message });
}
// All other errors → generic 500
return res.status(500).json({ success: false, message: 'Internal server error' });
```

---

### LOW-4 — `addNote` Text Field Has No Length Limit

**Files:** `src/modules/application/controller.ts:142–143`, `application/service.ts:418–436`

Notes are embedded in the Application document. A user can submit multi-megabyte strings, bloating documents indefinitely.

**Fix:**
```typescript
const NoteSchema = z.object({ text: z.string().min(1).max(2000) });
const { text } = NoteSchema.parse(req.body);
```

---

## 5. Performance

### PERF-1 — N+1 Query in `listAgentsWithWorkload`

**Severity:** High
**File:** `src/modules/admin/service.ts:7–29`

```typescript
const agents = await User.find({ role: { $in: ['agent', 'admin'] } }); // 1 query

await Promise.all(agents.map(async (agent) => {
  const activeWorkload = await Application.countDocuments({ // 1 query PER agent
    reviewerId: agent._id,
    status: 'Reviewing',
  });
}));
// With 20 agents → 21 queries per API call
```

**Fix — single aggregation:**
```typescript
const workloads = await Application.aggregate([
  { $match: { status: 'Reviewing' } },
  { $group: { _id: '$reviewerId', activeWorkload: { $sum: 1 } } }
]);
const workloadMap = new Map(workloads.map(w => [w._id.toString(), w.activeWorkload]));

const agents = await User.find({ role: { $in: ['agent', 'admin'] } });
return agents.map(agent => ({
  ...agent.toObject(),
  activeWorkload: workloadMap.get(agent._id.toString()) ?? 0,
}));
// 2 queries total regardless of agent count
```

---

### PERF-2 — Full Collection Scan for Analytics

**Severity:** High
**File:** `src/modules/admin/service.ts:66–114`

```typescript
const applications = await Application.find(); // loads ALL documents into Node.js heap
applications.forEach(app => { /* in-memory aggregation */ });
```

**Fix — push all aggregation to MongoDB:**
```typescript
const [stats] = await Application.aggregate([
  {
    $facet: {
      counts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      revenue: [
        { $match: { paymentStatus: 'Received' } },
        { $unwind: '$selectedServices' },
        { $group: { _id: null, total: { $sum: '$selectedServices.price' } } }
      ],
      chart: [
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: '%b %d', date: '$createdAt' } },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus','Received'] }, 1, 0] } }
        }}
      ]
    }
  }
]);
```

---

### PERF-3 — Workspace Init Checks Run on Every Request

**Severity:** Medium
**File:** `src/modules/admin/workspace.service.ts:37–49`

`ensureSystemWorkspace()` and `ensureInvoicesWorkspace()` each do a `findOne` + possible `create` on every `GET /admin/workspaces` call.

**Fix:** Call both once in `index.ts` after the DB connects:
```typescript
await mongoose.connect(MONGODB_URI);
await ensureSystemWorkspace();
await ensureInvoicesWorkspace();
```
Remove the calls from `listWorkspaces`. Cache the workspace IDs in a module-level variable.

---

### PERF-4 — Three Separate S3Client Instances

**Severity:** Medium
**Files:**
- `src/lib/backblaze.ts:4–11` (instance 1 — exported)
- `src/modules/application/service.ts:137–144` (instance 2 — local duplicate)
- `src/modules/media/backblaze/service.ts:8–15` (instance 3 — local duplicate)

Each instance maintains its own connection pool and TLS state.

**Fix:** In both `application/service.ts` and `media/backblaze/service.ts`:
```typescript
// Remove local S3Client instantiation
import { s3Client } from '../../lib/backblaze'; // reuse shared client
```

---

### PERF-5 — No Pagination on Application Listings

**Severity:** High
**File:** `src/modules/application/service.ts:88–135`

Both `getUserApplications` and `getAllApplications` return the full result set with no `limit` or `skip`. Full embedded sub-documents (`notes`, `activityLog`, `attachments`, `requestedFiles`) are included.

**Fix:**
```typescript
// Accept from query: ?page=1&limit=20
const page = parseInt(req.query.page as string) || 1;
const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
const skip = (page - 1) * limit;

Application.find(query)
  .select('applicationId status createdAt userId selectedServices paymentStatus')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
```

Use the full document fetch only on the detail (`GET /applications/:id`) endpoint.

---

### PERF-6 — `listFilesInWorkspace` Loads All Applications with Attachments

**Severity:** High
**File:** `src/modules/admin/workspace.service.ts:103–117`

```typescript
const applications = await Application.find({ 'attachments.0': { $exists: true } });
const allFiles = applications.flatMap(app => app.attachments.map(...));
```

Fetches every application that has at least one attachment into Node.js memory.

**Fix:**
```typescript
// Project only needed fields
Application.find({ 'attachments.0': { $exists: true } })
  .select('applicationId attachments')
  .lean();
// Add pagination to the result
```
Long-term: migrate workspace file metadata to a dedicated `WorkspaceFile` collection.

---

### PERF-7 — Unbounded Recursive Retry for Duplicate Application ID

**Severity:** Medium
**File:** `src/modules/application/service.ts:22–24`

```typescript
if (existing) return submitApplication(userId, data); // recursive, no max depth
```

**Fix:**
```typescript
async function generateUniqueApplicationId(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const id = `CAF-${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await Application.exists({ applicationId: id });
    if (!exists) return id;
  }
  throw new CustomError('Failed to generate unique application ID', 500);
}
```

---

### PERF-8 — `ListObjectsV2` Does Not Follow Pagination

**Severity:** Medium
**File:** `src/lib/backblaze.ts:52–61`

`ListObjectsV2` returns at most 1000 objects. `IsTruncated` and `NextContinuationToken` are never checked, so workspaces with more than 1000 files are silently truncated.

**Fix:**
```typescript
export async function listObjects(prefix: string) {
  const results: _Object[] = [];
  let continuationToken: string | undefined;
  do {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    results.push(...(response.Contents ?? []));
    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
  return results;
}
```

---

### PERF-9 — PDF Generation Blocks the Event Loop

**Severity:** Medium
**File:** `src/utils/invoice.service.ts:12–156`

`pdfkit` layout calculations are synchronous CPU work running on the main thread inline during the application creation request, stalling all other requests for the duration.

**Fix:** Offload to a BullMQ job queue (the infrastructure already exists in `src/workers/`):
```typescript
// invoice.queue.ts — new queue
await invoiceQueue.add('generate', { applicationId, userId });

// invoice.worker.ts — runs in background
worker.on('job', async job => {
  const pdf = await generateInvoice(job.data);
  await uploadInvoice(pdf, job.data.applicationId);
});
```

---

### PERF-10 — Missing Database Indexes on `Application` Collection

**Severity:** High
**File:** `src/models/Application.model.ts`

Heavily queried fields have no indexes defined:

| Query pattern | Missing index |
|---|---|
| `find({ userId })` | `{ userId: 1, createdAt: -1 }` |
| `find({ reviewerId, status })` | `{ reviewerId: 1, status: 1 }` |
| `find({ 'attachments.url': key })` | `{ 'attachments.url': 1 }` |
| Analytics filters | `{ status: 1, paymentStatus: 1 }` |

**Fix:**
```typescript
// Application.model.ts
ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ reviewerId: 1, status: 1 });
ApplicationSchema.index({ 'attachments.url': 1 });
ApplicationSchema.index({ status: 1, paymentStatus: 1 });
```

---

## 6. Database Query Optimization

### DB-1 — Race Condition on User Balance (Read-Modify-Write)

**Severity:** High
**Files:** `src/modules/application/service.ts:27–38`, `src/modules/admin/service.ts:54–60`

```typescript
const user = await User.findById(userId);  // READ
if (user.balance < totalCost) throw ...;
user.balance -= totalCost;                 // MODIFY in memory
await user.save();                         // WRITE — no atomicity
```

Two concurrent requests both pass the balance check, both deduct, both save — resulting in double-spending.

**Fix — atomic conditional update:**
```typescript
const result = await User.findOneAndUpdate(
  { _id: userId, balance: { $gte: totalCost } },
  { $inc: { balance: -totalCost } },
  { new: true }
);
if (!result) throw new CustomError('Insufficient balance', 400);
```

---

### DB-2 — Application Creation and Balance Deduction Are Not Atomic

**Severity:** High
**File:** `src/modules/application/service.ts:31–55`

```typescript
user.balance -= totalCost;
await user.save();                          // Balance gone

const application = await Application.create({ ... }); // If this throws → funds lost forever
```

**Fix — wrap in a MongoDB session transaction:**
```typescript
const session = await mongoose.startSession();
try {
  session.startTransaction();
  await User.findOneAndUpdate(
    { _id: userId, balance: { $gte: totalCost } },
    { $inc: { balance: -totalCost } },
    { session }
  );
  await Application.create([applicationData], { session });
  await session.commitTransaction();
} catch (e) {
  await session.abortTransaction();
  throw e;
} finally {
  session.endSession();
}
```

> **Note:** MongoDB transactions require a replica set or Atlas cluster. Verify your deployment supports them.

---

### DB-3 — `revokeInvitation` Makes Two Round-Trips for One Delete

**Severity:** Low
**File:** `src/modules/admin/invitation.service.ts:67–72`

```typescript
const invitation = await Invitation.findById(id);   // wasted round-trip
if (!invitation) throw ...;
await Invitation.findByIdAndDelete(id);
```

**Fix:**
```typescript
const deleted = await Invitation.findByIdAndDelete(id);
if (!deleted) throw new CustomError('Invitation not found', 404);
```

---

### DB-4 — Status Updates Use `findOne` + `save` Instead of Targeted `findOneAndUpdate`

**Severity:** Medium
**File:** `src/modules/application/service.ts` — `updateStatus`, `assignApplication`, `unassignApplication`, `addNote`, `requestFile`, `addAttachment`

Fetching the full document (with all embedded arrays), modifying it in memory, and saving the entire document causes unnecessary read/write bandwidth, especially as `notes` and `activityLog` grow.

**Fix — use targeted operators:**
```typescript
await Application.findOneAndUpdate(
  { _id: applicationId },
  {
    $set: { status, lastActivityAt: new Date() },
    $push: { activityLog: logEntry }
  },
  { new: true }
);
```

---

### DB-5 — `listAllUsers` Returns Full Collection with No Projection or Pagination

**Severity:** Medium
**File:** `src/modules/admin/service.ts:34–37`

```typescript
const users = await User.find({}).sort({ createdAt: -1 }); // all fields, all users
```

**Fix:**
```typescript
User.find({})
  .select('firstName lastName email role avatar balance createdAt isEmailVerified')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();
```

---

### DB-6 — `listInvitations` Returns All Records with No Pagination

**Severity:** Low
**File:** `src/modules/admin/invitation.service.ts:61`

```typescript
return Invitation.find().sort({ createdAt: -1 }); // grows without bound
```

**Fix:** Add pagination and default to filtering `status: 'Pending'`.

---

### DB-7 — Analytics Chart Uses In-Memory Date Grouping on Full Collection

**Severity:** High
**File:** `src/modules/admin/service.ts:73–107`

See PERF-2. The chart data is computed by iterating all applications in Node.js memory. Push this entirely to MongoDB via `$match` + `$group` + `$dateToString` (solution shown in PERF-2).

---

## 7. Code Quality

| ID | Issue | File | Lines | Fix |
|---|---|---|---|---|
| CQ-1 | `import` statement placed in the middle of the file body | `auth/service.ts` | 288 | Move all imports to the top of the file |
| CQ-2 | Duplicate `/health` route — richer one in `index.ts` is never reached | `app.ts`, `index.ts` | 58–60, 10–18 | Remove `/health` from `app.ts`; keep the detailed one in `index.ts` |
| CQ-3 | `nodemon` listed under `dependencies` instead of `devDependencies` | `package.json` | 36 | Move to `devDependencies` |
| CQ-4 | `axios` and `uuid` listed as runtime deps but unused in `src/` | `package.json` | 21, 39 | Remove or move to `devDependencies` |
| CQ-5 | `sib-api-v3-sdk` loaded via `require()` in a TypeScript ESM file | `workers/email.worker.ts` | 7 | Switch to `@getbrevo/brevo` (official SDK with types) |
| CQ-6 | `isValidObjectId.ts` exists but is empty; `ObjectId` validation duplicated inline across 8+ files | `utils/isValidObjectId.ts` | — | Implement once, import everywhere |
| CQ-7 | `handleError` hardcodes "User already exists" for all duplicate key errors (code 11000) | `utils/handleError.ts` | 13–17 | Extract field name from `error.keyValue`; let services throw `CustomError` before hitting the constraint |
| CQ-8 | Invoice generator hardcodes business address, name, and founder signature | `utils/invoice.service.ts` | 43–46, 107–111 | Drive from env vars or a config model |
| CQ-9 | Wide use of `any` type in service function signatures | Multiple services | Various | Add proper TypeScript interfaces for all service parameters |
| CQ-10 | No tests present despite `vitest` being a declared dependency | — | — | Add unit tests for auth, application submission, balance deduction, and analytics |

---

## 8. Summary Table

| ID | Category | Severity | File | Line(s) |
|---|---|---|---|---|
| CRIT-1 | Security — Secrets Exposure | Critical | `.env`, `.env.production` | 10–55 |
| CRIT-2 | Security — Auth | Critical | `utils/auth/token.ts`, `middlewares/auth.ts` | 10–11, 23 |
| HIGH-1 | Security — Rate Limiting | High | `app.ts`, all routers | — |
| HIGH-2 | Security — Input Validation | High | `auth/controller.ts`, `auth/service.ts` | 140, 301 |
| HIGH-3 | Security — IDOR | High | `application/service.ts` | 194–198 |
| HIGH-4 | Security — CSRF | High | `app.ts`, `utils/cookieConfig.ts` | — |
| HIGH-5 | Security — Privilege Escalation | High | `admin/service.ts` | 43–48 |
| HIGH-6 | Security — Timing Attack | High | `auth/service.ts`, `admin/invitation.service.ts` | 291, 79 |
| MED-1 | Security — Type Safety | Medium | Multiple controllers | Multiple |
| MED-2 | Security — Mass Assignment | Medium | `service/service.ts` | 8–18 |
| MED-3 | Security — Business Logic | Medium | `admin/service.ts` | 54–60 |
| MED-4 | Security — Cookie Config | Medium | `auth/controller.ts` | 116–120 |
| MED-5 | Security — Path Traversal Risk | Medium | `utils/invoice.service.ts` | 32–35 |
| LOW-1 | Security — XSS in Email | Low | `utils/email/*.ts` | Various |
| LOW-2 | Security — XSS | Low | `utils/zodSanitizer.ts` | 12–13 |
| LOW-3 | Security — Info Leak | Low | `utils/handleError.ts` | 20–25 |
| LOW-4 | Security — Input Validation | Low | `application/controller.ts` | 142–143 |
| PERF-1 | Performance — N+1 Query | High | `admin/service.ts` | 7–29 |
| PERF-2 | Performance — Full Collection Scan | High | `admin/service.ts` | 66–114 |
| PERF-3 | Performance — Repeated Init | Medium | `admin/workspace.service.ts` | 37–49 |
| PERF-4 | Performance — Duplicate S3 Clients | Medium | `lib/backblaze.ts`, `application/service.ts`, `media/backblaze/service.ts` | Various |
| PERF-5 | Performance — No Pagination | High | `application/service.ts` | 88–135 |
| PERF-6 | Performance — Full Scan on Attachments | High | `admin/workspace.service.ts` | 103–117 |
| PERF-7 | Performance — Unbounded Recursion | Medium | `application/service.ts` | 22–24 |
| PERF-8 | Performance — S3 Listing Truncation | Medium | `lib/backblaze.ts` | 52–61 |
| PERF-9 | Performance — Blocking CPU Work | Medium | `utils/invoice.service.ts` | 12–156 |
| PERF-10 | Performance — Missing DB Indexes | High | `models/Application.model.ts` | — |
| DB-1 | DB — Race Condition on Balance | High | `application/service.ts`, `admin/service.ts` | 27–38, 54–60 |
| DB-2 | DB — No Transaction on Create | High | `application/service.ts` | 31–55 |
| DB-3 | DB — Extra Round-Trip on Delete | Low | `admin/invitation.service.ts` | 67–72 |
| DB-4 | DB — Inefficient Full-Doc Updates | Medium | `application/service.ts` | Multiple |
| DB-5 | DB — No Projection on User List | Medium | `admin/service.ts` | 34–37 |
| DB-6 | DB — No Pagination on Invitations | Low | `admin/invitation.service.ts` | 61 |
| DB-7 | DB — In-Memory Analytics Aggregation | High | `admin/service.ts` | 73–107 |
| CQ-1 | Code Quality | Low | `auth/service.ts` | 288 |
| CQ-2 | Code Quality — Duplicate Route | Medium | `app.ts`, `index.ts` | 58–60, 10–18 |
| CQ-3 | Code Quality — Wrong Dep Type | Low | `package.json` | 36 |
| CQ-4 | Code Quality — Unused Deps | Low | `package.json` | 21, 39 |
| CQ-5 | Code Quality — require() in TS | Low | `workers/email.worker.ts` | 7 |
| CQ-6 | Code Quality — Empty Utility | Low | `utils/isValidObjectId.ts` | — |
| CQ-7 | Code Quality — Misleading Error Msg | Low | `utils/handleError.ts` | 13–17 |
| CQ-8 | Code Quality — Hardcoded Biz Data | Low | `utils/invoice.service.ts` | 43–111 |
| CQ-9 | Code Quality — `any` Types | Medium | Multiple | Various |
| CQ-10 | Code Quality — No Tests | Low | — | — |

---

## 9. Recommended Fix Order

### Phase 1 — Immediate (Do today, before next deployment)

1. **CRIT-1** — Rotate all committed secrets. Add `.env*` to `.gitignore`. Purge from git history.
2. **CRIT-2** — Remove `|| 'secret'` JWT fallback. Add startup env var validation.
3. **DB-1** — Replace read-modify-write balance logic with atomic `$inc` + conditional filter.
4. **DB-2** — Wrap application creation + balance deduction in a MongoDB transaction.

### Phase 2 — This Week (Security hardening)

5. **HIGH-1** — Install `express-rate-limit`. Apply to all auth and upload routes.
6. **HIGH-2** — Add `RegisterAgentSchema` and parse `req.body` in `registerAgent`.
7. **HIGH-3** — Validate `objectKey` prefix and reject path traversal.
8. **HIGH-4** — Set `sameSite: 'strict'` on auth cookie.
9. **HIGH-5** — Validate `role` against enum before DB write.
10. **MED-3** — Add `z.number().int().positive()` validation to `addCredits`.
11. **MED-4** — Fix `clearCookie` options to include `domain`.

### Phase 3 — Next Sprint (Performance & DB)

12. **PERF-1** — Replace N+1 workload query with single aggregation pipeline.
13. **PERF-2 / DB-7** — Replace full collection analytics scan with `$facet` aggregation.
14. **PERF-5** — Add pagination to `getUserApplications` and `getAllApplications`.
15. **PERF-10** — Add four compound indexes to `ApplicationSchema`.
16. **DB-4** — Replace `findOne` + `save` in status updates with `findOneAndUpdate` + `$push`/`$set`.
17. **DB-5** — Add `.select()` and pagination to `listAllUsers`.
18. **PERF-3** — Move `ensureSystemWorkspace` / `ensureInvoicesWorkspace` to startup.
19. **PERF-4** — Remove duplicate S3Client instances; reuse `src/lib/backblaze.ts` export.

### Phase 4 — Polish (Code quality & remaining items)

20. **PERF-8** — Implement pagination loop for `ListObjectsV2`.
21. **PERF-9** — Offload PDF generation to BullMQ worker.
22. **LOW-1 / LOW-2** — Add HTML escaping to email templates and `zodSanitizer`.
23. **LOW-3** — Tighten `handleError` to not leak raw third-party error messages.
24. **MED-2** — Add Zod schema to `createOrUpdateService`.
25. **MED-5** — Move logo into `src/assets/`; fix invoice generator path.
26. **HIGH-6 / LOW-4** — Rate-limit invitation endpoint; add note text length validation.
27. **CQ-2 thru CQ-10** — Clean up code quality items (duplicate route, dep cleanup, `any` types, empty utility).
28. **CQ-10** — Add unit tests for auth, balance deduction, application submission, and analytics.
