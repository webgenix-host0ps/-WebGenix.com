# WebGenix Pending Features & Tasks

This document tracks all features and tasks that are still pending, "display only", or missing from the complete WebGenix MVP.

## 1. Admin Role Pending Features
- [x] **Manual Invoice Creation**: Provide an interface in `AdminInvoiceList` to create an invoice manually.
- [x] **Invoice Management**: Add an Invoice Detail view with the ability to manually mark invoices as paid.
- [x] **Order Management**: Build an Order Detail view (currently only `AdminOrdersList` exists).
- [x] **Service Action Triggers**: UI buttons in the Admin Service Management page to Suspend, Unsuspend, and Terminate services.
- [x] **Refund Workflow**: Add UI and backend logic to issue refunds on invoices/payments.
- [ ] **Admin Settings Panel**: General settings UI (company details, payment gateway config, etc.).
- [x] **Staff Account Management**: Interface to create and manage Support, Billing, and Admin staff accounts.
- [x] **Verify Client Detail Stats**: Ensure the Admin Client Detail page is correctly consuming the updated backend APIs for services/invoices/tickets.

## 2. Billing Staff Role Pending Features
- [ ] **Billing Dashboard Analytics**: Populate `BillingDashboard` with real revenue data instead of placeholders.
- [x] **Manual Invoice Creation**: Add a "Create Invoice" button and form to the billing panel.
- [x] **Invoice Management**: Add a "Mark as Paid" button and manual payment recording.
- [ ] **Credit Management**: UI for billing staff to view, add, or deduct client credits.
- [ ] **Refund Workflow**: UI and logic for billing staff to process refunds.
- [ ] **Orders Access**: Grant billing staff access to the orders list and order details.

## 3. Support Staff Role Pending Features
- [x] **Client Context in Tickets**: Display the client's active services and invoices directly within the ticket view.
- [ ] **Ticket Merging**: Functionality to merge two or more tickets.
- [ ] **Department Transfer**: UI to transfer an active ticket to another department.
- [x] **Support Dashboard Analytics**: Replace placeholders with real metrics (open count, average response time, etc.).
- [x] **Internal Staff Notes**: Add a toggle in the ticket reply form to post internal notes visible only to staff.
- [x] **File Attachments**: Support uploading attachments to tickets and replies.

## 4. Sales/Lead Role Pending Features (Lower Priority)
- [ ] **Pipeline Management**: Implement visual pipeline stages (Contact → Qualified → Proposal → Closed).
- [ ] **Lead Conversion**: Add a "Convert to Client" workflow.
- [ ] **Lead Sources**: Track where leads came from.
- [ ] **Quotes/Proposals**: Generate and send quotes to leads.

## 5. Client Role Pending Features
- [ ] **Domain Management**: Client-facing page to manage domains, nameservers, WHOIS, and transfer locks.
- [x] **Invoice PDF Download**: Generate and serve PDF versions of invoices.
- [x] **Credit Balance Display**: Show available credit balance in the client dashboard.
- [x] **Service Cancellation**: Complete the workflow for a client to request service cancellation.
- [x] **Knowledgebase Access**: Client-facing UI to browse and search KB articles.
- [x] **Ticket File Attachments**: Allow clients to upload files when submitting or replying to tickets.
- [x] **2FA Integration**: Connect the frontend 2FA setup UI with the backend `twoFactorSecret` logic for real authentication.