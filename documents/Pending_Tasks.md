# WebGenix Pending Features & Tasks
> Last updated: May 11, 2026 | Status against MVP_Gap_Analysis_Part1.md

---

## ✅ COMPLETED (since MVP doc was written)

### Admin Role
- [x] **Revenue analytics** — `getRevenueAnalytics()` now aggregates real data from Invoice model
- [x] **Service analytics** — `getServiceAnalytics()` now returns real active/suspended/cancelled counts + byType breakdown
- [x] **Admin client detail page** — `getUser()` populates services, invoices, tickets, orders from DB (was hardcoded `[]`)
- [x] **Admin dashboard stats** — `getStats()` uses real DB queries (openTickets, unpaidInvoices, activeServices, etc.)
- [x] **Manual invoice creation** — API `POST /billing/admin/invoices` + frontend `admin.service.js createInvoice()`
- [x] **Invoice mark-as-paid** — API `PATCH /billing/admin/invoices/:id/status` + frontend `updateInvoiceStatus()`
- [x] **Service management (suspend/unsuspend/terminate)** — API `PATCH /billing/admin/services/:id/status` + frontend `updateServiceStatus()`
- [x] **Refund workflow** — API `POST /billing/admin/invoices/:id/refund` + frontend `refundInvoice()`
- [x] **Order detail page** — `AdminOrderDetail.jsx` route exists at `/admin/orders/:id`
- [x] **Admin settings panel** — `AdminSettings.jsx` + system settings API (`GET/PATCH /admin/settings`)
- [x] **Staff account management** — `StaffManagement.jsx` + `POST /admin/users` for creating staff

### Billing Staff Role
- [x] **BillingDashboard real data** — Now fetches from `GET /billing/stats` (monthlyRevenue, outstandingBalance, overdueInvoices, paidToday, activeServices)
- [x] **Manual invoice creation** — API + frontend `adminService.createInvoice()` works
- [x] **Mark as Paid** — API + frontend `adminService.updateInvoiceStatus()`
- [x] **Credit balance API** — `GET /billing/credits` returns balance + transaction history
- [x] **Orders list access** — `GET /billing/orders` is accessible to billing role (before admin-only roleMiddleware)
- [x] **Revenue summary** — Monthly revenue displayed in BillingDashboard

### Support Staff Role
- [x] **SupportDashboard real metrics** — Uses real ticket data from `getTickets()` API
- [x] **Internal staff notes** — `TicketMessage` schema has `isInternal: Boolean` field
- [x] **File attachments on tickets** — multer middleware + `attachments[]` schema field + `uploads/tickets/` directory
- [x] **Client context in tickets** — Implemented in existing codebase

### Client Role
- [x] **Credit balance display** — `ClientDashboard.jsx` shows credit balance from `user.creditBalance`
- [x] **Service cancellation request** — API `POST /billing/services/:id/cancel` + frontend `requestCancellation()`
- [x] **Knowledgebase access** — 3 frontend pages (KB home, category, article) connected to backend
- [x] **Ticket file attachments** — Upload middleware + schema fully implemented
- [x] **2FA setup/verify/disable** — Backend endpoints exist (mock TOTP verification), frontend Settings.jsx wired

---

## 🚫 SKIPPED (by explicit instruction — not pending)

| Feature | Reason |
|---------|--------|
| Domain Management (client + admin) | Skipped — entire module |
| Hosting/Server provisioning (cPanel/WHM) | Skipped — entire module |
| Email templates & delivery | Skipped — entire module |
| RBAC / Permissions system | Skipped — entire module |
| Technical Admin / Super Admin role | Skipped — not needed |

---

## ⬜ TRULY PENDING (not completed, not skipped)

### Admin Role
- [ ] **Invoice PDF download** — No backend endpoint or frontend download button anywhere. Invoice model has `pdfPath` field but it's never populated.
- [ ] **AdminServicesList page — verify suspend/unsuspend/terminate UI buttons exist** — Backend API works, but need to verify the frontend page has functional action buttons

### Support Staff Role
- [ ] **Ticket merge from UI** — Backend `POST /tickets/:id/merge` exists, need frontend "Merge Tickets" button on TicketDetail
- [ ] **Ticket department transfer from UI** — Backend `PATCH /tickets/:id/transfer` exists, need frontend "Transfer Department" UI

### Sales/Lead Role (Low Priority)
- [ ] **Lead pipeline stages** — Visual Kanban-like pipeline (Contact → Qualified → Proposal → Closed)
- [ ] **Lead-to-client conversion** — "Convert to Client" button/flow
- [ ] **Lead source tracking** — Source field + analytics
- [ ] **Quote/proposal generation** — Create and send quotes

### Client Role
- [ ] **Invoice PDF download** — Same as Admin — no PDF generation anywhere in the app
- [ ] **2FA with real TOTP library** — Current implementation accepts any 6-digit token as valid (mock). Install `speakeasy` and implement real TOTP verification

### Infrastructure / Quality of Life
- [ ] **Replace `setInterval` cron with `node-cron`** — Current cron jobs (`cron.service.js`) use `setInterval`, not crash-safe
- [ ] **Add database indexes** — Missing compound indexes on AuditLog, Ticket, Invoice, Service for performance at scale
- [ ] **XSS sanitization** — No input sanitization on free-text fields (ticket body, KB articles)
- [ ] **AuditLog schema enhancement** — Missing `resource`, `resourceId`, `targetUserId`, `changes` fields

---

## Summary

| Category | Total Items | ✅ Done | 🚫 Skipped | ⬜ Pending |
|----------|------------|---------|------------|-----------|
| Admin Role | 11 | 11 | 0 | 1 (PDF + verify) |
| Billing Role | 7 | 7 | 0 | 0 |
| Support Role | 6 | 4 | 0 | 2 (merge + transfer) |
| Lead/Sales | 4 | 0 | 0 | 4 (low priority) |
| Client Role | 7 | 5 | 1 (domains) | 2 (PDF + real 2FA) |
| Infrastructure | 4 | 0 | 0 | 4 (cron, indexes, xss, audit) |
| **TOTAL** | **39** | **27** | **1** | **13** |
