# WebGenix MVP Gap Analysis — Part 3: Architecture & Technical Gaps

---

## SECTION 4: BACKEND ARCHITECTURE ANALYSIS

### 4.1 What's Good
- ✅ Clean modular structure: `modules/auth`, `modules/billing`, `modules/tickets`, `modules/admin`
- ✅ ESM modules throughout (modern, no CommonJS)
- ✅ Controller → Service separation in billing module
- ✅ Zod validation per module (`auth.validation.js`, `billing.validation.js`, `ticket.validation.js`)
- ✅ Centralized error handling (`error.middleware.js`, `ApiError`, `asyncHandler`)
- ✅ Audit logging via `logAction()` on critical operations
- ✅ Rate limiting (global API limiter + ticket-specific limiters)
- ✅ Security headers (Helmet, HSTS, CSP, X-Frame-Options)
- ✅ MongoDB sanitization (prevents NoSQL injection)
- ✅ Webhook raw body parsing before JSON middleware

### 4.2 Critical Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| No `technical` / `superadmin` roles in enum | HIGH | Add to User.js enum |
| `admin.controller.js` returns hardcoded `[]` for services/invoices/tickets | HIGH | Populate from DB |
| `getStats()` returns `openTickets: 0`, `unpaidInvoices: 0` hardcoded | HIGH | Real DB queries |
| `getRevenueAnalytics()` returns empty array | HIGH | Aggregate Invoice model |
| `cancelOrder` uses MongoDB transactions — **fails on standalone MongoDB** | HIGH | Remove session, use sequential ops |
| No `SystemSettings` model — payment config hardcoded in `.env` | MEDIUM | SystemSettings collection |
| Cron jobs use `setInterval` — not crash-safe, no missed-run recovery | MEDIUM | Use `node-cron` library |
| No input sanitization on free-text fields beyond mongo-sanitize | MEDIUM | Add `xss` library |
| No file upload infrastructure (multer, storage) | MEDIUM | Required for attachments |
| `email.service.js` has hardcoded templates — no DB-driven templates | MEDIUM | EmailTemplate model |
| AuditLog missing `resource`, `resourceId`, `targetUserId` fields | LOW | Extend schema |
| No health check endpoint for services/DB status | LOW | Enhance `/health` route |

### 4.3 Missing Backend Modules (MVP Required)

```
src/modules/
├── domains/               ← NEW: Domain management + registrar API
│   ├── domain.controller.js
│   ├── domain.routes.js
│   ├── domain.service.js
│   └── models/
│       ├── Domain.js
│       ├── DomainRegistrar.js
│       └── TldPricing.js
│
├── servers/               ← NEW: cPanel/WHM integration
│   ├── server.controller.js
│   ├── server.routes.js
│   ├── cpanel.service.js
│   └── models/
│       ├── Server.js
│       ├── ServerGroup.js
│       └── ModuleLog.js
│
├── tax/                   ← NEW: India GST engine
│   ├── tax.controller.js
│   ├── tax.routes.js
│   ├── tax.service.js
│   └── models/
│       ├── TaxRule.js
│       └── TaxRate.js
│
├── knowledgebase/         ← NEW: KB article system
│   ├── kb.controller.js
│   ├── kb.routes.js
│   └── models/
│       ├── KbCategory.js
│       └── KbArticle.js
│
└── notifications/         ← NEW: In-app notifications
    ├── notification.controller.js
    ├── notification.routes.js
    └── models/
        └── Notification.js
```

---

## SECTION 5: FRONTEND ARCHITECTURE ANALYSIS

### 5.1 What's Good
- ✅ Role-based protected routes via `ProtectedRoute` component with `allowedRoles`
- ✅ Axios interceptor with token refresh queue (prevents concurrent refresh storms)
- ✅ AuthContext properly hydrates from localStorage + validates with server
- ✅ CartContext for checkout flow
- ✅ Modular service layer (`auth.service.js`, `billing.service.js`, etc.)
- ✅ Separate dashboard layouts per role
- ✅ Reusable components: DataTable, StatCard, Modal, StatusBadge, FilterBar, ActionMenu
- ✅ `DashboardSidebar` with role-aware navigation

### 5.2 Critical Gaps

| Gap | Severity | Fix |
|-----|----------|-----|
| Only 1 custom hook (`useDebounce`) — no `useFetch`, `usePagination`, `useToast` | HIGH | Add shared hooks |
| No global toast/notification system | HIGH | Add ToastContext or react-hot-toast |
| No loading skeleton components — raw spinners only | MEDIUM | Add SkeletonLoader |
| No error boundary components | MEDIUM | Add ErrorBoundary wrapper |
| State management is prop-drilling heavy — no Zustand/Redux | MEDIUM | Add Zustand for admin state |
| `MarketplacePage.jsx` is only 311 bytes — stub placeholder | HIGH | Implement fully |
| No PDF generation for invoices | HIGH | Add react-pdf or server-side PDF |
| No file upload component | HIGH | Required for ticket attachments |
| `BillingDashboard.jsx` is only 1984 bytes — placeholder | HIGH | Implement with real data |
| `SupportDashboard.jsx` in `/support/` is stub (1897 bytes) | HIGH | Implement with real metrics |
| `LeadDashboard.jsx` is stub (1868 bytes) | MEDIUM | Implement with pipeline data |
| AdminDashboard stats call — `openTickets` / `unpaidInvoices` always 0 | HIGH | Backend fix required |
| No domain management pages for client or admin | HIGH | New pages required |
| No knowledgebase pages | HIGH | New pages required |
| Settings.jsx 2FA toggle has no backend integration | MEDIUM | Wire to 2FA endpoints |
| No active sessions list in Settings | MEDIUM | New UI section |
| No admin system settings page | HIGH | New page required |

### 5.3 Missing Frontend Pages (MVP Required)

```
webgenix-app/src/pages/
├── domains/
│   ├── DomainSearch.jsx       ← Search & register domains
│   ├── MyDomains.jsx          ← Client domain list
│   └── DomainDetail.jsx       ← Manage single domain
│
├── admin/
│   ├── AdminServicesList.jsx  ← All services admin view
│   ├── AdminServiceDetail.jsx ← Manage single service
│   ├── AdminDomainList.jsx    ← All domains admin view
│   ├── AdminServerList.jsx    ← Server management
│   ├── SystemSettings.jsx     ← Company/gateway/tax config
│   ├── EmailTemplates.jsx     ← Email template editor
│   └── StaffManagement.jsx    ← Manage staff accounts
│
├── knowledgebase/
│   ├── KbHome.jsx             ← Category grid
│   ├── KbCategory.jsx         ← Articles in category
│   └── KbArticle.jsx         ← Single article
│
└── billing/
    ├── AdminInvoiceDetail.jsx ← Admin invoice detail + actions
    └── AdminOrderDetail.jsx   ← Admin order detail + actions
```

### 5.4 Reusable Component Gaps

| Component | Status | Priority |
|-----------|--------|----------|
| `ToastProvider` + `useToast` hook | ❌ Missing | HIGH |
| `SkeletonLoader` | ❌ Missing | MEDIUM |
| `ErrorBoundary` | ❌ Missing | MEDIUM |
| `ConfirmModal` (delete/cancel confirmation) | ❌ Missing | HIGH |
| `FileUpload` (drag & drop with preview) | ❌ Missing | HIGH |
| `PDFViewer` / invoice PDF download button | ❌ Missing | HIGH |
| `RichTextEditor` (for KB articles, email templates) | ❌ Missing | MEDIUM |
| `Pagination` (reusable) | ❌ Missing | MEDIUM |
| `DateRangePicker` | ❌ Missing | MEDIUM |
| `SearchBar` with debounce | ⚠️ Partial | LOW |
| `EmptyState` | ✅ Exists in tickets | — |
| `DataTable` | ✅ Exists | — |
| `StatCard` | ✅ Exists | — |
| `Modal` | ✅ Exists | — |
| `StatusBadge` | ✅ Exists | — |

---

## SECTION 6: DATABASE STRUCTURE ANALYSIS

### 6.1 Schema Quality Assessment

| Model | Quality | Issues |
|-------|---------|--------|
| User | ✅ Solid | Missing: `failedLoginAttempts`, `lockedUntil`, `notes` (admin) |
| Invoice | ✅ Excellent | Missing: `taxBreakdown` (CGST/SGST/IGST), `pdfPath` |
| Order | ✅ Excellent | `cancelOrder` uses transactions unsafely on standalone MongoDB |
| Service | ✅ Excellent | Missing: `hostingAccountId` ref to future cPanel account |
| Product | ✅ Good | `serverGroupId` ref to non-existent ServerGroup |
| Ticket | ✅ Good | Missing: `linkedServiceId` (link ticket to a service) |
| TicketMessage | ✅ Good | Missing: `isInternal: Boolean`, `attachments: []` |
| AuditLog | ⚠️ Minimal | Missing: `resource`, `resourceId`, `targetUserId`, `changes` diff |
| PromoCode | ✅ Excellent | None |
| Credit | ✅ Exists | No UI or API surface |
| Payment | ✅ Exists | No API to view payment history |

### 6.2 Missing Collections

```js
// MVP Required:
Server          — { name, hostname, ipAddress, apiKey, type:'cpanel'|'vps', status }
ServerGroup     — { name, servers: [ObjectId], fillType:'sequential'|'random' }
Domain          — { name, userId, registrar, status, registeredAt, expiresAt, autoRenew }
DomainRegistrar — { name, apiUrl, apiKey, resellerId, isActive }
TldPricing      — { tld, registerPrice, renewPrice, transferPrice }
TaxRule         — { state, cgstRate, sgstRate, igstRate, hsnCode }
KbCategory      — { name, slug, description, order, icon }
KbArticle       — { title, slug, content, categoryId, status, viewCount }
Notification    — { userId, type, title, body, isRead, link, createdAt }
EmailTemplate   — { type, subject, htmlBody, variables: [], isActive }
SystemSettings  — { key, value, group } // singleton-ish config collection

// Post-MVP:
Webhook         — { url, events: [], secret, isActive }
WebhookDelivery — { webhookId, eventType, payload, statusCode, attempts }
Quote           — { leadId, items: [], total, status, validUntil }
```

### 6.3 Index Optimization Gaps

```js
// Missing indexes that will hurt at scale:

// AuditLog — add action index for filtering by event type
auditLogSchema.index({ action: 1, createdAt: -1 });

// Ticket — add compound for dashboard queries
ticketSchema.index({ assignedTo: 1, status: 1, updatedAt: -1 });
ticketSchema.index({ department: 1, status: 1 });

// Invoice — add compound for revenue reports
invoiceSchema.index({ status: 1, datePaid: -1 });
invoiceSchema.index({ 'items.productId': 1 });

// Service — for renewal cron (critical path)
serviceSchema.index({ status: 1, nextDueDate: 1, autoRenew: 1 });
```

---

## SECTION 7: API ARCHITECTURE ANALYSIS

### 7.1 Current API Surface

```
/api/auth/*        — register, login, logout, refresh, verify-email, forgot/reset-password
/api/users/*       — profile get/update (current user)
/api/tickets/*     — full CRUD + assign + status + close + watch + rate + predefined-replies
/api/billing/products/*   — list, get, featured, by-slug, categories, CRUD (admin)
/api/billing/orders/*     — create, list, get, cancel
/api/billing/invoices/*   — list, get, admin list
/api/billing/payments/*   — create Razorpay order, verify payment
/api/billing/services     — list user services
/api/billing/promocode/*  — validate, CRUD (admin)
/api/admin/*       — stats, user CRUD, lead CRUD, analytics (mostly stubs)
/api/webhooks/*    — Razorpay webhook handler
```

### 7.2 Missing MVP API Endpoints

```
// CLIENT AREA
GET  /api/billing/services/:id              — Service detail (missing)
POST /api/billing/services/:id/cancel       — Request cancellation
GET  /api/billing/credits                   — View credit balance
POST /api/billing/credits/apply             — Apply credit to invoice
GET  /api/billing/invoices/:id/pdf          — Download invoice PDF
GET  /api/billing/payments                  — Payment history
GET  /api/billing/orders/:id                — Order detail (missing)

// ADMIN — BILLING
POST /api/billing/admin/invoices            — Create manual invoice
POST /api/billing/invoices/:id/mark-paid    — Mark paid (cash/offline)
POST /api/billing/invoices/:id/refund       — Process refund
GET  /api/billing/admin/services            — All services (admin)
POST /api/billing/admin/services/:id/suspend
POST /api/billing/admin/services/:id/unsuspend
POST /api/billing/admin/services/:id/terminate

// ADMIN — CLIENTS
POST /api/admin/clients/:id/impersonate     — Login as client
POST /api/admin/staff                       — Create staff account
PATCH /api/admin/staff/:id/permissions      — Update staff permissions
GET  /api/admin/clients/:id/full            — Client with services/invoices/tickets/orders

// ADMIN — ANALYTICS (real data)
GET  /api/admin/analytics/revenue           — Monthly revenue chart
GET  /api/admin/analytics/services          — Active/suspended counts
GET  /api/admin/analytics/tickets           — Ticket metrics

// DOMAINS
GET  /api/domains/check?domain=example.com  — Availability check
POST /api/domains/register                  — Register domain
POST /api/domains/transfer                  — Transfer domain
POST /api/domains/:id/renew                 — Renew domain
GET  /api/domains                           — Client domain list
GET  /api/admin/domains                     — Admin domain list

// SERVERS
GET  /api/admin/servers                     — Server list
POST /api/admin/servers                     — Add server
POST /api/admin/servers/:id/test            — Test WHM connection

// KNOWLEDGEBASE
GET  /api/kb/categories
GET  /api/kb/articles?category=:id
GET  /api/kb/articles/:slug
GET  /api/kb/search?q=query
POST /api/admin/kb/categories
POST /api/admin/kb/articles

// TAX
GET  /api/tax/calculate                     — Calculate GST for order
GET  /api/reports/gstr-1                    — GST report
GET  /api/admin/tax-rules                   — Tax rule CRUD

// AUTH — MISSING
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
GET  /api/auth/sessions                     — List active sessions
DELETE /api/auth/sessions/:id               — Revoke session

// NOTIFICATIONS
GET  /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

## SECTION 8: SECURITY ARCHITECTURE ANALYSIS

### 8.1 What's Implemented
- ✅ JWT with short-lived access tokens (15min typical) + refresh rotation
- ✅ Hashed refresh tokens stored in DB (not raw JWT)
- ✅ bcrypt password hashing with configurable rounds
- ✅ Helmet (CSP, HSTS, X-Frame-Options, Referrer-Policy)
- ✅ CORS restricted to `CLIENT_URL` env var
- ✅ MongoDB sanitization (NoSQL injection prevention)
- ✅ Rate limiting on API + per-endpoint for tickets
- ✅ Email verification enforced on login
- ✅ Password reset invalidates all sessions
- ✅ Razorpay webhook signature verification
- ✅ Role-based middleware on all admin routes

### 8.2 Security Gaps (MVP Critical)

| Gap | Risk | Fix |
|-----|------|-----|
| No per-user brute-force lockout (only global rate limit) | HIGH | Add `failedLoginAttempts` + `lockedUntil` to User |
| Access token stored in `localStorage` (XSS risk) | HIGH | Move to `httpOnly` cookie or add XSS hardening |
| `updateUser` in admin has no field whitelist — any field can be patched | HIGH | Whitelist allowed fields |
| No input XSS sanitization on free-text (ticket body, notes) | MEDIUM | Add `xss` or `dompurify` server-side |
| 2FA schema exists but not enforced — `twoFactorEnabled: true` does nothing | MEDIUM | Implement TOTP check in login flow |
| File uploads (planned for attachments) have no virus scan | LOW | Magic-byte validation at minimum |
| No CSRF protection on cookie-based endpoints | LOW | Add `csurf` or `SameSite=Strict` cookies |
| Admin impersonation endpoint (when built) needs audit trail | MEDIUM | Log every impersonation |
| `superadmin` role doesn't exist — can't protect system settings | HIGH | Add role + guard |

### 8.3 AuditLog Enhancement (MVP)
```js
// Extend AuditLog schema:
const auditLogSchema = new Schema({
  userId:       { type: ObjectId, ref: 'User', index: true },
  targetUserId: { type: ObjectId, ref: 'User' },   // impersonation, user edits
  action:       { type: String, required: true, index: true },
  resource:     { type: String },                  // 'invoice', 'ticket', 'service'
  resourceId:   { type: ObjectId },
  changes:      { type: Schema.Types.Mixed },      // { before: {}, after: {} }
  ip:           String,
  userAgent:    String,
}, { timestamps: { createdAt: true, updatedAt: false } });
```

---

## SECTION 9: STATE MANAGEMENT ANALYSIS

### 9.1 Current State
- **AuthContext**: User session, login/logout/refresh — ✅ solid
- **CartContext**: Cart items array, add/remove/clear — ✅ functional
- **Local component state**: All page-level data fetching uses `useState + useEffect`
- **No global server state cache**: Every page re-fetches on mount

### 9.2 Problems with Current Approach
1. **No caching** — navigating admin→clients and back re-fetches every time
2. **No loading state coordination** — race conditions in multi-fetch pages
3. **Prop drilling** — admin pages pass data down multiple levels
4. **No optimistic updates** — status changes wait for server round-trip

### 9.3 MVP Recommendation

Add **Zustand** for admin-side state (lightweight, no boilerplate):

```js
// src/stores/adminStore.js
import { create } from 'zustand';
export const useAdminStore = create((set) => ({
  clients: [], totalClients: 0,
  setClients: (clients, total) => set({ clients, totalClients: total }),
  
  tickets: [], openCount: 0,
  setTickets: (tickets, count) => set({ tickets, openCount: count }),
  
  stats: null,
  setStats: (stats) => set({ stats }),
}));
```

Add **React Query (TanStack Query)** for data fetching with automatic caching:
```js
// Replaces all useState+useEffect fetch patterns:
const { data, isLoading, refetch } = useQuery({
  queryKey: ['admin-clients', page, search],
  queryFn: () => adminService.getClients({ page, search }),
  staleTime: 30_000, // 30s cache
});
```

---

## SECTION 10: SCALABILITY & PERFORMANCE ANALYSIS

### 10.1 Current Bottlenecks

| Bottleneck | Impact | Fix |
|-----------|--------|-----|
| `setInterval` cron jobs in Node process — dies with server | HIGH | Use `node-cron` or Bull queue |
| No pagination on `getUsers` default (limit=100) | MEDIUM | Enforce max 20/page |
| `cancelOrder` MongoDB transaction on standalone DB | HIGH | Remove transaction, sequential ops |
| N+1 queries in `createOrder` — each product fetched in loop | MEDIUM | Batch with `Product.find({ _id: { $in: ids } })` |
| No response caching — product list fetched fresh on every storefront load | MEDIUM | Add Redis cache for products |
| AuditLog grows unboundedly — no TTL index | LOW | Add 90-day TTL index |
| Session collection grows unboundedly — no cleanup for expired sessions | MEDIUM | Add TTL index `expiresAt` |
| No DB connection pooling config — Mongoose defaults | LOW | Set `maxPoolSize` in db.js |

### 10.2 Quick Wins (No Architecture Change)

```js
// 1. Fix N+1 in createOrder
const productIds = items.map(i => i.productId);
const products = await Product.find({ _id: { $in: productIds } });
const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));

// 2. Add TTL indexes
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 3. Mongoose connection pool
mongoose.connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });

// 4. Replace setInterval with node-cron
import cron from 'node-cron';
cron.schedule('0 */6 * * *', processBillingRenewals);   // every 6h
cron.schedule('0 0 * * *', autoCloseTickets);            // daily midnight
cron.schedule('0 */12 * * *', suspendOverdueServicesCron); // every 12h
```

---

## SECTION 11: MVP IMPLEMENTATION ROADMAP

### Priority 1 — Critical Bug Fixes (Week 1)

| Task | File | Impact |
|------|------|--------|
| Fix `getStats()` — query real ticket/invoice data | admin.controller.js | Admin dashboard usable |
| Fix `getUser()` — populate services/invoices/tickets/orders | admin.controller.js | Client detail page |
| Fix `getRevenueAnalytics()` — aggregate Invoice model | admin.controller.js | Revenue reporting |
| Remove MongoDB transaction from `cancelOrder` | billing.service.js | Production crashes |
| Fix N+1 query in `createOrder` | billing.service.js | Performance |
| Add `technical` + `superadmin` to User role enum | User.js | Role completeness |

---

### Priority 2 — Core Missing Features (Weeks 2–4)

| Task | Effort | Impact |
|------|--------|--------|
| Internal notes on tickets (`isInternal` field) | 1 day | Support staff workflow |
| Ticket file attachments (multer + local/S3) | 2 days | Critical for support |
| Admin manual invoice creation API + UI | 2 days | Billing staff workflow |
| Admin mark-invoice-as-paid API + UI | 1 day | Billing operations |
| Service suspend/unsuspend/terminate API (admin) | 1 day | Service management |
| Service cancellation request (client) API + UI | 1 day | Client self-service |
| Admin services list page | 1 day | Admin oversight |
| Client domain management pages (placeholder) | 1 day | Navigation structure |
| Real analytics: revenue chart, service counts | 2 days | Admin dashboard |
| Active sessions list in Settings | 1 day | Security feature |
| 2FA backend implementation (TOTP) | 2 days | Security |
| Admin staff management (create/edit staff) | 2 days | Operations |
| Admin order detail page | 1 day | Order oversight |

---

### Priority 3 — New Modules (Weeks 5–9)

| Module | Effort | MVP Critical |
|--------|--------|-------------|
| GST Tax Engine (CGST/SGST/IGST) | 1 week | ✅ Legal requirement |
| Domain Management (ResellerClub API) | 3 weeks | ✅ Core business |
| cPanel/WHM Provisioning Module | 2 weeks | ✅ Automation |
| Knowledgebase System | 1 week | ✅ Support deflection |
| Email Template Management | 1 week | ✅ Professional comms |
| PDF Invoice Generation | 3 days | ✅ Client need |
| In-app Notification System | 3 days | MEDIUM |
| Admin System Settings page | 2 days | ✅ Operations |

---

### Priority 4 — Post-MVP (After Launch)

| Feature | Reason to Defer |
|---------|----------------|
| Webhook system | Not blocking launch |
| Multi-currency | INR only for India MVP |
| Affiliate system | Needs traction first |
| Ticket SLA tracking | Complex, manual is OK initially |
| Ticket merging | Rare use case |
| Email piping (ticket via email) | Needs mail server setup |
| Plesk/DirectAdmin provisioning | cPanel covers 80% market |
| Advanced fraud detection | Manual review initially |
| Reseller system | Entirely different segment |
| Marketing automation | Out of scope |
| Project management module | Not a hosting need |

---

## SECTION 12: COMPLETE GAP SUMMARY TABLE

| Module | WHMCS Score | WebGenix Score | Gap % | MVP Priority |
|--------|-------------|----------------|-------|-------------|
| Authentication | 10/10 | 8/10 | 20% | HIGH |
| RBAC / Permissions | 10/10 | 5/10 | 50% | HIGH |
| Client Management | 10/10 | 6/10 | 40% | HIGH |
| Billing / Invoicing | 10/10 | 7/10 | 30% | HIGH |
| Order Management | 10/10 | 6/10 | 40% | HIGH |
| Service Management | 10/10 | 5/10 | 50% | HIGH |
| Ticketing | 10/10 | 8/10 | 20% | MEDIUM |
| Domain Management | 10/10 | 0/10 | 100% | CRITICAL |
| Hosting Provisioning | 10/10 | 1/10 | 90% | CRITICAL |
| Analytics / Reports | 10/10 | 2/10 | 80% | HIGH |
| Tax / GST | 10/10 | 0/10 | 100% | CRITICAL (legal) |
| Knowledgebase | 10/10 | 0/10 | 100% | HIGH |
| Email Templates | 10/10 | 1/10 | 90% | HIGH |
| Admin Dashboard | 10/10 | 4/10 | 60% | HIGH |
| Settings | 10/10 | 5/10 | 50% | MEDIUM |
| **OVERALL** | **150/150** | **58/150** | **61%** | — |

---

## SECTION 13: FINAL RECOMMENDATIONS

### Immediate Actions (This Week)
1. **Fix admin.controller.js** — populate client detail, fix stats queries
2. **Fix transaction bug** — cancelOrder on standalone MongoDB crashes silently
3. **Add internal ticket notes** — 1-day task, critical for support staff
4. **Add superadmin role** — protects system settings before any staff onboarding

### Architecture Decisions for MVP
1. **Add React Query** — eliminates prop-drilling and race conditions, 1-day setup
2. **Add node-cron** — replace setInterval, prevents missed jobs on restart
3. **Add Zustand** for admin global state — lightweight, no Redux complexity
4. **Add react-hot-toast** — global notification system, 30 min setup

### Not Worth Building Yet
- **Redis caching** — premature until >1000 concurrent users
- **Microservices** — monolith is correct at this scale
- **GraphQL** — REST is perfectly adequate for this use case
- **TypeScript migration** — too expensive mid-project, post-MVP

---
*Document End — WebGenix MVP Gap Analysis v1.0*
*Files: MVP_Gap_Analysis_Part1.md | Part2.md | Part3.md*
