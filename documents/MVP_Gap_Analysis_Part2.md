# WebGenix MVP Gap Analysis — Part 2: Module-by-Module Analysis

---

## SECTION 3: MODULE-BY-MODULE ANALYSIS

### 3.1 AUTHENTICATION MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Email/Password login | ✅ | ✅ | None | ✅ |
| Email verification | ✅ | ✅ | None | ✅ |
| Forgot/Reset password | ✅ | ✅ | None | ✅ |
| Refresh token rotation | ✅ | ✅ | None | ✅ |
| Session management (multi-device) | ✅ | ✅ | None | ✅ |
| Logout all sessions | ✅ | ✅ | None | ✅ |
| 2FA (TOTP) | ✅ | ⚠️ Schema only | Backend logic missing | ✅ MVP |
| OAuth (Google/GitHub) | ❌ | ❌ | N/A | ❌ Post-MVP |
| IP-based login alerts | ✅ | ⚠️ Stored only | No alert sent | Post-MVP |
| Account lockout (brute force) | ✅ | ⚠️ Rate limit only | No per-user lockout | ✅ MVP |
| Admin impersonation | ✅ | ❌ | Missing | ✅ MVP |

**Missing MVP Items:**
```js
// 1. 2FA verification middleware
// 2. Account lockout: track failed attempts on User model
// 3. Impersonation: POST /admin/clients/:id/impersonate → returns short-lived token
```

---

### 3.2 BILLING MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Product CRUD (hosting/domain/SSL/addon) | ✅ | ✅ | None | ✅ |
| Multi-cycle pricing | ✅ | ✅ | None | ✅ |
| Order creation + checkout | ✅ | ✅ | None | ✅ |
| Promo/discount codes | ✅ | ✅ | None | ✅ |
| Invoice auto-generation | ✅ | ✅ | None | ✅ |
| Renewal invoice automation | ✅ | ✅ | None | ✅ |
| Overdue invoice marking (cron) | ✅ | ✅ | None | ✅ |
| Razorpay payment integration | N/A | ✅ | None | ✅ |
| Webhook payment verification | ✅ | ✅ | None | ✅ |
| Service auto-provisioning on payment | ✅ | ✅ | None | ✅ |
| Service suspension (overdue, cron) | ✅ | ✅ | None | ✅ |
| Credit system (model) | ✅ | ✅ Schema | No UI or apply-credit API | ✅ MVP |
| Manual invoice creation (admin) | ✅ | ❌ | Missing | ✅ MVP |
| Invoice PDF download | ✅ | ❌ | Missing | ✅ MVP |
| Refund workflow | ✅ | ❌ | Missing | ✅ MVP |
| GST/Tax calculation | ✅ | ❌ | Missing | ✅ MVP (India legal) |
| GST invoice breakdown | ✅ | ❌ | Missing | ✅ MVP |
| Proration on upgrade | ✅ | ✅ Logic | No UI/API surface | Post-MVP |
| Multi-currency | ✅ | ❌ | Missing | ❌ Post-MVP |
| Service cancellation request | ✅ | ⚠️ Model only | No API endpoint | ✅ MVP |
| Admin order/invoice detail view | ✅ | ❌ | Missing | ✅ MVP |

**Critical Missing APIs:**
```
POST /billing/admin/invoices              — Create manual invoice
POST /billing/invoices/:id/mark-paid      — Admin mark invoice paid
POST /billing/invoices/:id/refund         — Process refund
GET  /billing/invoices/:id/pdf            — Download PDF
POST /billing/services/:id/cancel         — Request service cancellation
POST /billing/services/:id/unsuspend      — Manually unsuspend
GET  /billing/credits                     — Get user credit balance
POST /billing/credits/apply               — Apply credit to invoice
GET  /billing/admin/revenue               — Revenue analytics (currently empty)
GET  /billing/admin/services              — All services list for admin
```

---

### 3.3 TICKETING MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Create ticket (client) | ✅ | ✅ | None | ✅ |
| Ticket list (all roles) | ✅ | ✅ | None | ✅ |
| Ticket detail + thread | ✅ | ✅ | None | ✅ |
| Reply (client + staff) | ✅ | ✅ | None | ✅ |
| Status management | ✅ | ✅ | None | ✅ |
| Priority levels | ✅ | ✅ | None | ✅ |
| Ticket assignment | ✅ | ✅ | None | ✅ |
| Department routing | ✅ | ✅ | None | ✅ |
| Predefined replies | ✅ | ✅ | None | ✅ |
| Watchers | ✅ | ✅ | None | ✅ |
| Satisfaction ratings | ✅ | ✅ | None | ✅ |
| Auto-close inactive tickets (cron) | ✅ | ✅ | None | ✅ |
| Ticket activity log | ✅ | ✅ | None | ✅ |
| Internal staff notes | ✅ | ❌ | Missing | ✅ MVP |
| File attachments | ✅ | ❌ | Missing | ✅ MVP |
| Ticket merge | ✅ | ❌ | Missing | Post-MVP |
| Ticket splitting | ✅ | ❌ | Missing | ❌ Post-MVP |
| Email-to-ticket (piping) | ✅ | ❌ | Missing | ❌ Post-MVP |
| SLA / response time tracking | ✅ | ❌ | Missing | ❌ Post-MVP |
| Tags on tickets | ✅ | ✅ Schema | No tag UI | Post-MVP |
| Client view of ticket from service | ✅ | ❌ | Missing | Post-MVP |

**Missing MVP Items:**
```js
// 1. Internal notes: add `isInternal: Boolean` to TicketMessage schema
// 2. File attachments: add `attachments: []` to TicketMessage schema + multer upload
// POST /tickets/:id/messages — already exists, extend with file upload middleware
```

---

### 3.4 CLIENT MANAGEMENT MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Client list with search/filter | ✅ | ✅ | None | ✅ |
| Client profile view | ✅ | ✅ | None | ✅ |
| Edit client profile | ✅ | ✅ | None | ✅ |
| Suspend/activate client | ✅ | ✅ | None | ✅ |
| Client's services list | ✅ | ❌ Bug | Returns [] in admin | ✅ MVP (fix) |
| Client's invoices list | ✅ | ❌ Bug | Returns [] in admin | ✅ MVP (fix) |
| Client's tickets list | ✅ | ❌ Bug | Returns [] in admin | ✅ MVP (fix) |
| Client's orders list | ✅ | ❌ | Missing from detail | ✅ MVP |
| Client credit balance | ✅ | ❌ | Missing UI | ✅ MVP |
| Login as client (impersonate) | ✅ | ❌ | Missing | ✅ MVP |
| Client notes (admin) | ✅ | ❌ | Missing | Post-MVP |
| Client merge | ✅ | ❌ | Missing | ❌ Post-MVP |

**Fix for AdminClientDetail:**
```js
// admin.controller.js — getUser must populate:
const [services, invoices, tickets, orders] = await Promise.all([
  Service.find({ userId: id }).sort({ createdAt: -1 }),
  Invoice.find({ userId: id }).sort({ dateIssued: -1 }),
  Ticket.find({ client: id }).sort({ createdAt: -1 }),
  Order.find({ userId: id }).sort({ createdAt: -1 }),
]);
```

---

### 3.5 SERVICE MANAGEMENT MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Services list (client) | ✅ | ✅ | None | ✅ |
| Service detail page | ✅ | ✅ | None | ✅ |
| Auto-provisioning on payment | ✅ | ✅ | None | ✅ |
| Auto-suspend on overdue (cron) | ✅ | ✅ | None | ✅ |
| Renewal invoice creation (cron) | ✅ | ✅ | None | ✅ |
| Manual suspend (admin) | ✅ | ❌ | No API endpoint | ✅ MVP |
| Manual unsuspend (admin) | ✅ | ❌ | No API endpoint | ✅ MVP |
| Manual terminate (admin) | ✅ | ❌ | No API endpoint | ✅ MVP |
| Service cancellation request | ✅ | ❌ | No API endpoint | ✅ MVP |
| cPanel auto-provisioning | ✅ | ❌ | Entire module missing | ✅ MVP |
| Server assignment | ✅ | ❌ | No Server model | ✅ MVP |
| Password reset (hosting) | ✅ | ❌ | No cPanel module | Post-MVP |
| Service upgrade/downgrade | ✅ | ⚠️ Proration logic | No UI/API | Post-MVP |
| Admin services overview | ✅ | ❌ | No admin services route | ✅ MVP |

---

### 3.6 DOMAIN MANAGEMENT MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Domain availability check | ✅ | ❌ | Entire module missing | ✅ MVP |
| Domain registration | ✅ | ❌ | Entire module missing | ✅ MVP |
| Domain transfer (EPP code) | ✅ | ❌ | Entire module missing | ✅ MVP |
| Domain renewal | ✅ | ❌ | Entire module missing | ✅ MVP |
| WHOIS lookup | ✅ | ❌ | Entire module missing | ✅ MVP |
| DNS management | ✅ | ❌ | Entire module missing | Post-MVP |
| WHOIS privacy (ID protection) | ✅ | ❌ | Missing | Post-MVP |
| Domain lock/unlock | ✅ | ❌ | Missing | Post-MVP |
| Auto domain expiry check (cron) | ✅ | ❌ | Missing | ✅ MVP |
| Client domain list page | ✅ | ❌ | Missing | ✅ MVP |
| Admin domain management | ✅ | ❌ | Missing | ✅ MVP |

**Models Required:**
```js
Domain.js         — domain records (name, registrar, expiry, status, userId)
DomainRegistrar.js — API credentials (ResellerClub/LogicBoxes)
TldPricing.js     — TLD-specific pricing
```

---

### 3.7 ORDER MANAGEMENT MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Order creation from cart | ✅ | ✅ | None | ✅ |
| Order list (client) | ✅ | ✅ | None | ✅ |
| Order list (admin) | ✅ | ✅ | None | ✅ |
| Order detail view (admin) | ✅ | ❌ | Missing page | ✅ MVP |
| Order detail view (client) | ✅ | ❌ | Missing page | ✅ MVP |
| Order cancellation (client) | ✅ | ✅ Logic | API exists, no UI button | ✅ MVP (UI fix) |
| Fraud flag order | ✅ | ❌ | Missing | Post-MVP |
| Admin accept/reject pending orders | ✅ | ❌ | Missing workflow | ✅ MVP |

---

### 3.8 HOSTING/SERVER MANAGEMENT MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Server model + config | ✅ | ❌ | Entire module missing | ✅ MVP |
| cPanel/WHM API integration | ✅ | ❌ | Entire module missing | ✅ MVP |
| Auto account creation on payment | ✅ | ⚠️ | Service created but no cPanel | ✅ MVP |
| Account suspension/unsuspension | ✅ | ❌ | No WHM calls | ✅ MVP |
| Account termination | ✅ | ❌ | No WHM calls | ✅ MVP |
| Package mapping (product → cPanel) | ✅ | ❌ | Missing | ✅ MVP |
| Server group load balancing | ✅ | ❌ | Missing | Post-MVP |
| Disk/bandwidth usage sync | ✅ | ❌ | Missing | Post-MVP |
| Admin server list | ✅ | ❌ | Missing | ✅ MVP |

---

### 3.9 KNOWLEDGEBASE MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Article categories | ✅ | ❌ | Entire module missing | ✅ MVP |
| Article CRUD (admin) | ✅ | ❌ | Entire module missing | ✅ MVP |
| Public article browsing (client) | ✅ | ❌ | Entire module missing | ✅ MVP |
| Full-text article search | ✅ | ❌ | Missing | ✅ MVP |
| Article rating | ✅ | ❌ | Missing | Post-MVP |
| Article suggestions in ticket form | ✅ | ❌ | Missing | Post-MVP |

---

### 3.10 ANALYTICS & REPORTING MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Total clients count | ✅ | ✅ | None | ✅ |
| Open tickets count | ✅ | ⚠️ Hardcoded 0 | Needs real query | ✅ MVP |
| Unpaid invoices count | ✅ | ⚠️ Hardcoded 0 | Needs real query | ✅ MVP |
| Revenue this month | ✅ | ❌ Empty array | Missing | ✅ MVP |
| Revenue chart (monthly) | ✅ | ❌ | Missing | ✅ MVP |
| New clients this month | ✅ | ✅ | None | ✅ |
| Active services count | ✅ | ❌ | Missing | ✅ MVP |
| Tickets by status | ✅ | ❌ | Missing | ✅ MVP |
| Top products by revenue | ✅ | ❌ | Missing | Post-MVP |
| Churn rate | ✅ | ❌ | Missing | ❌ Post-MVP |
| GSTR-1 / GSTR-3B reports | ✅ | ❌ | Missing (India legal) | ✅ MVP |

**Fix for Admin Dashboard Stats:**
```js
// admin.controller.js — getStats must query real data:
const [openTickets, unpaidInvoices, activeServices, monthRevenue] = await Promise.all([
  Ticket.countDocuments({ status: { $in: ['OPEN','ANSWERED'] }, isClosed: false }),
  Invoice.countDocuments({ status: 'unpaid' }),
  Service.countDocuments({ status: 'active' }),
  Invoice.aggregate([
    { $match: { status: 'paid', datePaid: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]),
]);
```

---

### 3.11 SETTINGS MODULE

| Feature | WHMCS | WebGenix | Gap | MVP? |
|---------|-------|----------|-----|------|
| Client profile update | ✅ | ✅ | None | ✅ |
| Password change | ✅ | ✅ | None | ✅ |
| Company/billing details | ✅ | ✅ Schema | UI exists in Settings.jsx | ✅ |
| GSTIN field | ✅ | ✅ Schema | In clientProfile | ✅ |
| 2FA enable/disable | ✅ | ⚠️ UI only | Backend logic missing | ✅ MVP |
| Active sessions list | ✅ | ❌ | Missing UI | ✅ MVP |
| System settings (admin) | ✅ | ❌ | No SystemSettings model | ✅ MVP |
| Payment gateway config (admin) | ✅ | ❌ | Hardcoded in .env | ✅ MVP |
| Tax configuration (admin) | ✅ | ❌ | Missing | ✅ MVP |
| Email template editor | ✅ | ❌ | Missing | ✅ MVP |

---

### 3.12 RBAC ARCHITECTURE

**WHMCS:**
- Fine-grained per-feature permissions per staff role
- Admin can customize each staff member's access
- Separate Admin, Support, Reports, Billing permission groups

**WebGenix Current:**
- `role.middleware.js` — role-based guard (`roleMiddleware(...roles)`)
- `permissionMiddleware(permission)` — granular permission check
- `user.permissions: [String]` — array of custom permissions per user
- `user.hasPermission(permission)` — method to check

**What's Good:** The RBAC infrastructure is well-designed.

**What's Missing:**
- [ ] No UI to assign custom permissions to staff users
- [ ] No permission groups/presets (e.g., "Billing Staff permissions")
- [ ] Permissions array is never populated in registration/creation flow
- [ ] `permissionMiddleware` exists but is never used in any route
- [ ] No super-admin guard for system settings routes

**MVP Implementation Plan:**
```js
// 1. Define permission constants
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_INVOICES: 'manage_invoices',
  MANAGE_TICKETS: 'manage_tickets',
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SERVERS: 'manage_servers',
  MANAGE_DOMAINS: 'manage_domains',
};

// 2. Default permissions per role (applied on staff creation)
export const ROLE_DEFAULT_PERMISSIONS = {
  support: ['manage_tickets'],
  billing: ['manage_invoices', 'view_reports'],
  lead: ['manage_leads'],
  technical: ['manage_servers', 'manage_domains'],
};

// 3. Admin UI: POST /admin/staff/:id/permissions to override
```
---
