# Client Audit: Security, Performance & Code Quality

> **Date:** 2026-05-05
> **Scope:** `client/` with focus on `src/`, `next.config.ts`, `package.json`, Tailwind/config, and env files

---

## Table of Contents

1. [Critical Security](#1-critical-security)
2. [High Security](#2-high-security)
3. [Medium Security](#3-medium-security)
4. [Low Security](#4-low-security)
5. [Performance](#5-performance)
6. [Code Quality](#6-code-quality)
7. [Dependencies Review](#7-dependencies-review)
8. [Environment Variables Review](#8-environment-variables-review)
9. [Recommended Fix Order](#9-recommended-fix-order)

---

## 1. Critical Security

### SEC-01 — Fake Stripe Payment Form Handles Raw Card Data Client-Side

**Severity:** Critical  
**File:** `src/components/auth/StripePayment.tsx`  
**Lines:** 24–58

The component renders a card number, expiry, CVC, and cardholder name form and stores that data directly in React state. No Stripe SDK, no tokenization, and no secure payment element integration is used.

```tsx
const [formData, setFormData] = useState({
  cardNumber: "",
  expiry: "",
  cvc: "",
  name: ""
});
```

This is not PCI-compliant if used in any real payment flow. It also creates a false sense of secure payment behavior for users.

**Fix:**
1. Remove this custom card form entirely.
2. Replace it with Stripe Elements using `@stripe/react-stripe-js` and `@stripe/stripe-js`.
3. Ensure the client only receives a publishable key and never handles raw PAN/CVC values directly.

---

## 2. High Security

### SEC-02 — Sensitive Routes Protected Only on the Client

**Severity:** High  
**Files:** `src/app/admin/page.tsx`, `src/app/agent/page.tsx`, `src/app/profile/page.tsx`, `src/components/AdminPage.tsx`, `src/components/AgentPage.tsx`

Protected pages rely on client-side `useEffect` redirects after render instead of server-side route protection. A user can hit `/admin` or `/agent` directly and the page mounts before the redirect happens.

**Risk:**
- Unauthorized users can see loading states and partial UI
- Protected data requests may fire before redirect logic completes
- Access control depends on browser behavior instead of route enforcement

**Fix:**
1. Add `middleware.ts` at the client root.
2. Validate the session cookie and role before protected routes render.
3. Redirect unauthorized users server-side.

---

### SEC-03 — Agent Permissions Hardcoded to Full Access

**Severity:** High  
**File:** `src/components/AgentPage.tsx`  
**Lines:** 122–128

The page hardcodes full permissions for the agent experience:

```tsx
const permissions = {
  canViewWorkspaces: true,
  canUploadFiles: true,
  canDeleteFiles: true,
  canViewApplications: true,
  canManageApplications: true,
};
```

This bypasses any backend or persisted permission model.

**Fix:**
1. Read permissions from the authenticated user state or backend response.
2. Remove the hardcoded object.
3. Use one shared permission resolver across admin and agent views.

---

### SEC-04 — `mockApi` Stores Session/User Data in `localStorage`

**Severity:** High  
**File:** `src/lib/api/mockApi.ts`  
**Lines:** 64–82, 104–108, 135–138

The mock layer stores a mock token and the full user object in `localStorage`, then uses that data as an auth source.

```ts
const SESSION_KEY = 'smart_caf_session';
const token = 'mock_jwt_token_' + user.id;
saveToStorage(SESSION_KEY, { user, token });
```

This is unsafe if it leaks into production because any XSS or malicious extension can read and manipulate it.

**Fix:**
1. Remove `mockApi` from the production path completely.
2. Gate all mock code behind development-only checks.
3. Use HTTP-only cookie auth only.

---

### SEC-05 — Production Components Still Depend on `mockApi`

**Severity:** High  
**Files:** `src/components/AdminPage.tsx`, `src/components/admin/PermissionsModal.tsx`

Real UI flows still call `mockApi` for permissions, file operations, and settings behavior. That means some admin actions persist only in browser storage rather than the backend.

**Fix:**
1. Replace all `mockApi` calls with `adminApi` or proper backend endpoints.
2. Move `mockApi` to test-only or dev-only code.
3. Remove any production import path that references it.

---

## 3. Medium Security

### SEC-06 — Unvalidated `window.open()` With Backend-Supplied URL

**Severity:** Medium  
**Files:** `src/components/ProfilePage.tsx`, `src/components/AdminPage.tsx`, `src/components/AgentPage.tsx`, `src/components/admin/WorkspacesManager.tsx`

Attachment preview URLs from the backend are passed directly to `window.open()` without checking the protocol or target domain.

**Fix:**
```tsx
const url = response.previewUrl;
if (!url.startsWith('https://')) {
  throw new Error('Invalid preview URL');
}
window.open(url, '_blank', 'noopener,noreferrer');
```

---

### SEC-07 — File Validation Checks MIME Only, No Size Limit

**Severity:** Medium  
**File:** `src/lib/utils.ts`  
**Lines:** 54–61

`validateFile()` checks `file.type` only. There is no file size check, and MIME alone is weak validation.

**Fix:**
1. Add a client-side size limit such as 10 MB.
2. Keep the client-side type check for UX.
3. Enforce the same type and size limits on the server.

---

### SEC-08 — Missing CSP Header

**Severity:** Medium  
**File:** `next.config.ts`  
**Lines:** 43–67

Security headers are configured, but `Content-Security-Policy` is missing entirely.

**Fix:** Add a strict CSP covering `script-src`, `connect-src`, `img-src`, `style-src`, and `frame-ancestors`.

Example baseline:

```ts
Content-Security-Policy: default-src 'self'; script-src 'self'; connect-src 'self' https://www.zenvy.com.bd https://zenvy.com.bd; img-src 'self' data: https://api.dicebear.com; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';
```

---

### SEC-09 — Missing HSTS Header

**Severity:** Medium  
**File:** `next.config.ts`

`Strict-Transport-Security` is not configured.

**Fix:** Add:

```ts
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
```

---

### SEC-10 — Missing Permissions-Policy Header

**Severity:** Medium  
**File:** `next.config.ts`

The app includes packages that could use privileged browser APIs, but no `Permissions-Policy` header is present.

**Fix:** Add something like:

```ts
{ key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' }
```

---

### SEC-11 — OAuth Redirect Uses Env Fallback to `localhost`

**Severity:** Medium  
**File:** `src/lib/api/authApi.ts`  
**Line:** 38

```ts
window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`;
```

If misconfigured in production, the browser could redirect users to the wrong origin.

**Fix:**
1. Remove the localhost fallback for production builds.
2. Fail fast when `NEXT_PUBLIC_API_URL` is missing.
3. Validate the URL protocol before redirecting.

---

### SEC-12 — Raw Backend Error Messages Surface in UI

**Severity:** Medium  
**Files:** `src/components/AgentPage.tsx`, `src/components/ProfilePage.tsx`, `src/components/AdminPage.tsx`

Several flows display `error.response?.data?.message` directly to end users.

**Fix:**
1. Show generic messages in the UI.
2. Keep raw details for dev logging only.
3. Standardize on `toast.error()` instead of `alert()`.

---

## 4. Low Security

### SEC-13 — Avatar Seed Leaks User PII to Dicebear

**Severity:** Low  
**Files:** `Navbar.tsx`, `AgentPage.tsx`, `UsersView.tsx`, `ApplicationsView.tsx`, `InternalNotes.tsx`, `AssignAgentModal.tsx`

Avatar URLs embed user email and internal ID in the query string sent to a third-party avatar service.

**Fix:** Use a non-PII seed, such as a generated avatar ID or a hash.

---

### SEC-14 — Console Logging Left in Production Code

**Severity:** Low  
**Files:** `src/components/layout/Navbar.tsx`, `src/components/auth/AuthOverlay.tsx`, `src/context/AuthContext.tsx`

Development logs are left in browser code.

**Fix:** Remove `console.log()` usage from production code paths.

---

### SEC-15 — Native `alert()` / `confirm()` Used in Sensitive UX Flows

**Severity:** Low  
**Files:** `src/components/AdminPage.tsx`, `src/components/AgentPage.tsx`, `src/components/admin/WorkspacesManager.tsx`, `src/components/admin/ServicesView.tsx`

Native dialogs are used for destructive confirmations and error display.

**Fix:** Replace them with proper modal and toast components from the existing UI stack.

---

## 5. Performance

### PERF-01 — Raw `<img>` Used Instead of `next/image`

**Severity:** High  
**Files:** `Navbar.tsx`, `StripePayment.tsx`, `AgentPage.tsx`, `ApplicationsView.tsx`, `AssignAgentModal.tsx`, `InternalNotes.tsx`, `UsersView.tsx`

The app uses multiple raw `<img>` tags, losing Next image optimization, lazy loading, and layout stability.

**Fix:** Replace all raw image tags with `next/image`. Update `next.config.ts` to allow required remote sources.

---

### PERF-02 — `puppeteer` Is a Heavy, Unused Production Dependency

**Severity:** High  
**File:** `package.json`

`puppeteer` is installed in the client app but is not used anywhere in `src/`. It adds major install and image weight.

**Fix:** Remove it immediately.

---

### PERF-03 — `archiver` Is Unused and Wrong for Browser Runtime

**Severity:** High  
**File:** `package.json`

`archiver` is server-oriented and unused in this client codebase.

**Fix:** Remove it.

---

### PERF-04 — `AdminPage.tsx` and `AgentPage.tsx` Are Monolithic

**Severity:** Medium  
**Files:** `src/components/AdminPage.tsx`, `src/components/AgentPage.tsx`

Large route components eagerly load all tabs, panels, and supporting UI.

**Fix:** Split tab content and heavy panels into dynamically imported components.

---

### PERF-05 — No Shared Data Caching Layer

**Severity:** Medium  
**Files:** multiple `useEffect` fetch flows

Data fetching is repeated independently with no caching, deduplication, or stale-while-revalidate behavior.

**Fix:** Adopt `@tanstack/react-query` or `swr` for API reads and mutations.

---

### PERF-06 — Duplicate Service Fetching

**Severity:** Medium  
**Files:** `src/app/page.tsx`, `src/components/ApplicationForm.tsx`

Service catalog data is fetched separately on the landing page and the apply page without shared caching.

**Fix:** Move service data into a shared query/cache layer.

---

### PERF-07 — Missing Memoization on Pure Child Components

**Severity:** Medium  
**Files:** `ApplicationForm.tsx`, `AdminPage.tsx`, `ProfilePage.tsx`, `Navbar.tsx`, `page.tsx`

Several presentational child components are pure but re-render frequently because they are not memoized and receive unstable callback props.

**Fix:**
1. Wrap stable presentational children with `React.memo`.
2. Stabilize handlers with `useCallback` where they are passed deep into child trees.

---

### PERF-08 — `ApplicationForm` Recreates Event Handlers Every Render

**Severity:** Medium  
**File:** `src/components/ApplicationForm.tsx`

Handlers like `handleInputChange`, `toggleService`, and `handleFileUpload` are recreated every render and trigger broad rerendering across a large form.

**Fix:** Use `useCallback` for handlers passed to child components.

---

### PERF-09 — Mixed `motion` / `framer-motion` Import Paths

**Severity:** Medium  
**Files:** `src/app/not-found.tsx`, package dependencies

Most files use `motion/react`, but `not-found.tsx` imports `framer-motion`. This can pull extra bundle weight and inconsistent runtime behavior.

**Fix:** Standardize on one motion package import path throughout the app.

---

### PERF-10 — No Suspense Boundary Around `useSearchParams()` Consumer

**Severity:** Low  
**Files:** `src/app/apply/page.tsx`, `src/components/ApplicationForm.tsx`

`ApplicationForm` uses `useSearchParams()` but the route page does not wrap it in `<Suspense>`.

**Fix:** Wrap the component in `<Suspense>` at the page level.

---

### PERF-11 — Random Value Generated During Render

**Severity:** Low  
**File:** `src/components/ui/PaymentSelection.tsx`  
**Line:** 274

`Math.random()` is called directly in JSX, producing a new reference every render.

**Fix:** Generate once with `useMemo` or `useState`.

---

## 6. Code Quality

### CQ-01 — Excessive `any` Usage Across Core Flows

**Severity:** High  
**Files:** `src/context/AuthContext.tsx`, `src/lib/api/authApi.ts`, `src/lib/api/adminApi.ts`, `src/components/ApplicationForm.tsx`, `src/components/ProfilePage.tsx`, `src/components/AdminPage.tsx`, `src/components/admin/InternalNotes.tsx`, `src/types/user.ts`

TypeScript safety is heavily degraded by broad `any` use in auth state, API payloads, and core component props.

**Fix:** Define explicit interfaces for:
1. Auth session/user shape
2. Admin API responses
3. Application detail models
4. Permissions model

---

### CQ-02 — Dead Code: `src/data/services.tsx`

**Severity:** High  
**File:** `src/data/services.tsx`

Static service definitions exist but the live app fetches services from the backend. This file is unused dead code.

**Fix:** Delete it.

---

### CQ-03 — `mockApi` Is Architectural Debt, Not a Clean Mock Layer

**Severity:** High  
**File:** `src/lib/api/mockApi.ts`

The file mixes fake auth, fake file management, settings, permission logic, and local persistence while still being referenced by production components.

**Fix:** Remove it from app runtime. Move any genuinely useful mock behavior to test fixtures.

---

### CQ-04 — Large Shared UI Is Duplicated Across Admin and Agent Views

**Severity:** High  
**Files:** `src/components/AdminPage.tsx`, `src/components/AgentPage.tsx`

Application detail and surrounding flows are substantially duplicated between both pages.

**Fix:** Extract shared panels and action sections into reusable components.

---

### CQ-05 — No Error Boundaries

**Severity:** Medium  
**Files:** app-wide

There are no route-level `error.tsx` files or component error boundaries to contain runtime failures.

**Fix:**
1. Add `error.tsx` to major route segments.
2. Add a reusable React error boundary for complex dashboard sections.

---

### CQ-06 — `zxcvbn` Installed But Not Used

**Severity:** Medium  
**Files:** `package.json`, auth-related components

Password strength tooling is present in dependencies but not used in registration or onboarding.

**Fix:** Add strength feedback in the auth UI or remove the dependency.

---

### CQ-07 — Error Handling Is Inconsistent

**Severity:** Medium  
**Files:** multiple

The app mixes `alert()`, `toast.error()`, and local error state patterns across similar flows.

**Fix:** Standardize on a single user-notification pattern, preferably `sonner` toasts plus structured inline form errors where needed.

---

### CQ-08 — `PermissionsModal` Writes to Mock Storage, Not Backend

**Severity:** Medium  
**File:** `src/components/admin/PermissionsModal.tsx`

Permissions changes are not real system changes today because they write to `mockApi`.

**Fix:** Add a backend endpoint and route the modal through `adminApi`.

---

### CQ-09 — Broken Styling in `not-found.tsx`

**Severity:** Medium  
**File:** `src/app/not-found.tsx`

The 404 page uses `wix-*` Tailwind classes that do not exist in this project config.

**Fix:** Restyle it using the current design tokens and Tailwind config.

---

### CQ-10 — Hard Navigation Used Instead of Next Router

**Severity:** Low  
**File:** `src/components/ApplicationForm.tsx`  
**Line:** 908

The success state uses `window.location.href = '/profile'` instead of client routing.

**Fix:** Use `router.push('/profile')`.

---

### CQ-11 — Stale Redirect Rules in `next.config.ts`

**Severity:** Low  
**File:** `next.config.ts`

Redirects for `/host/*` routes exist even though those routes are not part of this app.

**Fix:** Remove unrelated redirect config.

---

### CQ-12 — Empty `hooks/` and `schema/` Directories

**Severity:** Low  
**Files:** `src/hooks/`, `src/schema/`

These are harmless but indicate partially started structure with no implementation.

**Fix:** Either populate them with real abstractions or remove them.

---

## 7. Dependencies Review

### Notable Runtime Dependencies

| Package | Status | Note |
|---|---|---|
| `next` | Used | Core framework |
| `react` / `react-dom` | Used | Core runtime |
| `axios` | Used | API client |
| `motion` | Used | Animation library |
| `lucide-react` | Used | Icons |
| `recharts` | Used | Charts |
| `xlsx` | Used | Excel export |
| `sonner` | Used | Toasts |
| `uuid` | Likely minimal use | Keep only if needed |
| `puppeteer` | Unused | Remove immediately |
| `archiver` | Unused | Remove |
| `socket.io-client` | Unused | Remove if not planned |
| `html5-qrcode` | Unused | Remove if not planned |
| `imagekit-javascript` | Unused | Remove if not planned |
| `zxcvbn` | Installed but unused | Use or remove |

---

## 8. Environment Variables Review

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_ENV=development
```

### `.env.production`

```env
NEXT_PUBLIC_API_URL=https://www.zenvy.com.bd/api
NEXT_PUBLIC_SOCKET_URL=https://zenvy.com.bd
NEXT_PUBLIC_APP_ENV=production
```

### Assessment

No secrets were found in the client env files. All values are `NEXT_PUBLIC_*` and therefore intentionally browser-visible.

This is acceptable for URLs and environment labels, but the team should maintain a strict rule:

1. No private API keys in client env files.
2. No secret tokens in any `NEXT_PUBLIC_*` variable.
3. Production builds should fail if required public env vars are missing.

---

## 9. Recommended Fix Order

### Phase 1 — Immediate

1. Replace fake payment handling with Stripe Elements.
2. Add `middleware.ts` for server-side route protection.
3. Remove hardcoded agent permissions.
4. Remove `mockApi` from production flows.
5. Add CSP, HSTS, and Permissions-Policy headers.
6. Remove `puppeteer` and `archiver` from the client app.
7. Fix the missing Suspense boundary around `ApplicationForm`.

### Phase 2 — High Priority

8. Replace raw `<img>` with `next/image`.
9. Add file size validation on uploads.
10. Validate URLs before `window.open()`.
11. Remove raw backend error messages from end-user alerts.
12. Eliminate `mockApi`-backed permission and workspace behavior.
13. Start reducing `any` usage in auth, admin, and application models.

### Phase 3 — Performance and Architecture

14. Adopt React Query or SWR for data fetching.
15. Split `AdminPage` and `AgentPage` with dynamic imports.
16. Memoize stable child components and callback props.
17. Consolidate duplicated admin/agent application detail UI.
18. Remove unused client dependencies and dead code.

### Phase 4 — Polish

19. Add route-level `error.tsx` files and error boundaries.
20. Standardize notifications and destructive confirmation UX.
21. Replace PII-based avatar seeds.
22. Clean stale config (`/host/*` redirects, broken 404 styling, placeholder Tailwind values).
23. Either use `zxcvbn` for password strength or remove it.
