# WebGenix MVP Role & Feature Gap Analysis vs WHMCS
> **Version**: 1.0 | **Date**: May 10, 2026 | **Stack**: MERN (MongoDB, Express, React, Node.js)

---

## SECTION 1: PROJECT OVERVIEW — WHAT WE HAVE TODAY

### Backend Architecture (Current State)
- **Framework**: Express.js (ESM modules) on Node.js ≥18
- **Database**: MongoDB via Mongoose 8.5
- **Auth**: JWT (access + refresh tokens), bcrypt, hashed sessions in DB
- **Security**: Helmet, CORS, express-mongo-sanitize, rate limiting, custom security headers
- **Payments**: Razorpay (webhook + order flow), Stripe dependency exists but unused
- **Cron Jobs**: setInterval-based (auto-close tickets, renewal invoices, suspend overdue services, mark overdue invoices)
- **Validation**: Zod schemas per module
- **Logging**: Custom logger, audit.service.js for user actions

### Frontend Architecture (Current State)
- **Framework**: React 18 + Vite + React Router v6
- **State**: React Context (AuthContext, CartContext) — no Redux/Zustand
- **API Client**: Axios with request/response interceptors, automatic token refresh, queue system
- **Styling**: Vanilla CSS (index.css with design tokens)
- **Hooks**: Only `useDebounce.js` custom hook

### Roles Currently In System
| Role | Enum Value | Dashboard | Status |
|------|-----------|-----------|--------|
| Client | `client` | ClientDashboard | ✅ Exists |
| Admin | `admin` | AdminDashboard | ✅ Exists |
| Support | `support` | SupportDashboard | ✅ Exists |
| Billing | `billing` | BillingDashboard | ✅ Exists |
| Lead/Sales | `lead` | LeadDashboard | ✅ Exists |

### Database Models Currently Implemented
| Model | Location | Status |
|-------|----------|--------|
| User | src/models/User.js | ✅ Complete |
| Session | src/models/Session.js | ✅ Complete |
| AuthToken | src/models/AuthToken.js | ✅ Complete |
| AuditLog | src/models/AuditLog.js | ✅ Partial (missing resource/target fields) |
| Counter | src/models/Counter.js | ✅ Complete |
| Product | billing/models/Product.js | ✅ Complete |
| Order | billing/models/Order.js | ✅ Complete |
| Invoice | billing/models/Invoice.js | ✅ Complete |
| Service | billing/models/Service.js | ✅ Complete |
| Payment | billing/models/Payment.js | ✅ Complete |
| Credit | billing/models/Credit.js | ✅ Complete |
| PromoCode | billing/models/PromoCode.js | ✅ Complete |
| Ticket | tickets/models/Ticket.js | ✅ Complete |
| TicketMessage | tickets/models/TicketMessage.js | ✅ Complete |
| TicketActivity | tickets/models/TicketActivity.js | ✅ Complete |
| Department | tickets/models/Department.js | ✅ Complete |
| PredefinedReply | tickets/models/PredefinedReply.js | ✅ Complete |
| **Domain** | ✅ Complete | ✅ Implemented |
| **Server** | ✅ Complete | ✅ Implemented |
| **ServerGroup** | ✅ Complete | ✅ Implemented |
| **TaxRule** | ✅ Complete | ✅ Implemented |
| **KnowledgebaseArticle** | ✅ Complete | ✅ Implemented |
| **KnowledgebaseCategory** | ✅ Complete | ✅ Implemented |
| **EmailTemplate** | ✅ Complete | ✅ Implemented |
| **Notification** | ✅ Complete | ✅ Implemented |
| **ActivityLog** | ✅ Complete (Full audit) | ✅ Implemented |

---

## SECTION 2: ROLE-BY-ROLE ANALYSIS

### 2.1 ADMIN ROLE

**WHMCS Provides:**
- Full client management (view, edit, suspend, merge)
- Order management (accept, cancel, fraud flag)
- Product/pricing CRUD
- Service management (provision, suspend, terminate)
- Invoice management (create, edit, credit, refund)
- Ticket assignment and escalation
- Staff management
- Report access (revenue, products, clients)

**WebGenix Has:** ✅ Partial
- ✅ User management (list, view, toggle status, edit)
- ✅ Product CRUD (full)
- ✅ Order list view
- ✅ Invoice list view (admin)
- ✅ Ticket list + assignment
- ✅ Lead management
- ✅ Admin dashboard with basic stats
- ✅ Server Infrastructure Management (CRUD & UI)
- ✅ Domain & TLD Pricing Management (CRUD & UI)
- ✅ Tax & GST Rules Management (CRUD & UI)
- ✅ Knowledgebase CMS (CRUD & UI)

**Missing for MVP:**
- [ ] Revenue analytics (currently returns empty array `[]`)
- [ ] Service analytics (currently returns empty array `[]`)
- [ ] Admin client detail page does NOT load services/invoices/tickets (hardcoded `[]`)
- [ ] Manual invoice creation (AdminInvoiceList has no create button)
- [ ] Invoice detail + manual mark-as-paid from admin
- [ ] Order detail page (AdminOrdersList exists, no detail view)
- [ ] Service management page (suspend/unsuspend/terminate from admin)
- [ ] Refund workflow
- [ ] Admin settings panel (company details, payment gateway config)
- [ ] Staff account creation and management (Super Admin tasks merged into Admin)

**Critical Bug:** `admin.controller.js` line 107-109 — `getUser` returns empty arrays for services/invoices/tickets. Must be populated.

---

### 2.3 BILLING STAFF ROLE

**WHMCS Provides:**
- View and manage all invoices
- Create manual invoices
- Apply credits and refunds
- View all orders
- Mark invoices paid (for offline payments)
- View billing-related tickets

**WebGenix Has:** ✅ Partial
- ✅ BillingDashboard page
- ✅ BillingInvoiceList page
- ✅ BillingTicketList page
- ✅ Admin invoice list endpoint (`GET /billing/admin/invoices`)

**Missing for MVP:**
- [ ] BillingDashboard shows no real data (placeholder only)
- [ ] Cannot create manual invoice from billing panel
- [ ] No "Mark as Paid" button in billing invoice list
- [ ] No credit management UI
- [ ] No refund workflow UI
- [ ] No access to orders list (routes missing for billing role)
- [ ] No revenue summary in billing dashboard

---

### 2.4 SUPPORT STAFF ROLE

**WHMCS Provides:**
- View and reply to all assigned tickets
- Change ticket status, priority, department
- Assign tickets to staff members
- Access client profile from ticket
- Predefined replies (canned responses)
- Merge tickets
- View client's service details from ticket context

**WebGenix Has:** ✅ Good foundation
- ✅ SupportDashboard
- ✅ SupportTicketList with tabs
- ✅ Ticket assignment (`PATCH /tickets/:id/assign`)
- ✅ Status change (`PATCH /tickets/:id/status`)
- ✅ Predefined replies (full CRUD)
- ✅ Watchers system
- ✅ Satisfaction ratings

**Missing for MVP:**
- [x] Cannot see client's services/invoices from ticket context
- [ ] No ticket merge functionality
- [ ] No ticket transfer between departments from UI
- [ ] SupportDashboard shows no real metrics (open count, avg response time, etc.)
- [x] No internal notes system (messages visible to staff only, not client)
- [x] File attachments on tickets

---

### 2.5 SALES/LEAD STAFF ROLE

**WHMCS Provides:**
- Lead tracking with pipeline stages
- Convert lead to client
- Quote generation

**WebGenix Has:** ✅ Basic
- ✅ LeadDashboard page
- ✅ LeadManagement page (CRUD on leads via admin.controller)
- ✅ Lead stored as User with role=`lead`

**Missing for MVP:**
- [ ] Lead pipeline stages (contact → qualified → proposal → closed)
- [ ] Lead-to-client conversion workflow
- [ ] Lead source tracking
- [ ] No quote/proposal generation

**MVP Priority:** LOW (basic lead CRUD is sufficient for MVP)

---

### 2.5 CLIENT ROLE

**WHMCS Provides:**
- Self-service portal: invoices, services, domains, tickets
- Order new services from store
- Manage domain settings (DNS, WHOIS, transfer)
- Cancel service requests
- Account profile with billing address, GSTIN
- Download invoices as PDF
- 2FA setup
- Credit balance visibility

**WebGenix Has:** ✅ Strong
- ✅ ClientDashboard with stats
- ✅ MyServices page (list + detail)
- ✅ InvoicesList + InvoiceDetail
- ✅ OrdersList + OrderSuccess
- ✅ Checkout with promo codes
- ✅ Tickets (create/list/detail/reply/rate)
- ✅ Settings page (profile, password, 2FA fields in schema)
- ✅ ServiceDetail page

**Missing for MVP:**
- [ ] No domain management page for clients
- [ ] Cannot download invoice as PDF (no PDF generation)
- [x] No credit balance display in client area
- [x] Service cancellation request (UI partially exists but workflow incomplete)
- [x] No knowledgebase access
- [x] No ticket file attachments
- [ ] 2FA UI exists in Settings but backend `twoFactorSecret` unused

---
