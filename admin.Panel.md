# WebGenix Admin Panel - Comprehensive Feature Specification

This document outlines the required features and modules for the WebGenix Admin Panel to achieve parity with enterprise-grade hosting management systems like WHMCS.

---

## 1. Dashboard & Analytics (Global Overview)
*   **System Health Snapshot**: Real-time monitoring of Cron Jobs, API status, and server loads.
*   **Income Statistics**: Daily, weekly, monthly income graphs (Current Month vs Last Month).
*   **Activity Feed**: Live log of admin and client actions.
*   **Pending Items Badge**: Quick count of pending orders, open tickets, and overdue invoices.
*   **Quick Search**: Global search bar for Clients, Invoices, Tickets, and Services.

## 2. Client Management (CRM)
*   **Client Profile**: Detailed view of user data, services, invoices, and ticket history.
*   **Account Actions**: Login as client, Reset password, Close account, Merge accounts.
*   **Credit Management**: Add/Remove account credits for future payments.
*   **Internal Notes**: Private notes visible only to staff members.
*   **Audit Log**: Full history of changes made to the client profile.

## 3. Order & Provisioning Management
*   **Order Review**: Process pending orders, verify payment, and fraud check (MaxMind/CleanTalk).
*   **Manual Provisioning**: Force create/suspend/terminate services on remote servers (cPanel, WHM, etc.).
*   **Custom Fields**: Manage configuration-specific data for each order.

## 4. Billing & Financial Control
*   **Invoice Management**: Create manual invoices, apply credits, record manual payments.
*   **Recurring Billing Engine**: Management of next due dates and automated generation.
*   **Refund System**: Process refunds through payment gateways (Razorpay, PayPal, Stripe).
*   **Tax Rules**: Global and regional tax configurations (GST/VAT).
*   **Promotions/Coupons**: Create percentage or fixed-amount discount codes.

## 5. Support Ticketing System
*   **Department Management**: Create departments (Sales, Technical, Billing) and assign staff.
*   **Predefined Replies**: Standardized templates for common support queries.
*   **Ticket Escalation**: Move tickets between departments or priority levels.
*   **Spam Filters**: Block specific email addresses or keywords.
*   **Internal Chat**: Staff-only communication on specific tickets.

## 6. Product & Service Configuration
*   **Product Groups**: Categorize services (e.g., Shared Hosting, VPS, Dedicated).
*   **Pricing Matrix**: Configure Monthly, Quarterly, Semi-Annual, and Annual pricing.
*   **Welcome Emails**: Assign specific email templates to trigger after purchase.
*   **Configurable Options**: Add-ons like Extra RAM, IP addresses, or Backups.

## 7. Domain Management
*   **Registrar Integration**: Connect with Namecheap, Enom, ResellerClub.
*   **TLD Pricing**: Import and manage pricing for hundreds of domain extensions.
*   **WHOIS Management**: Tool to check and update domain contact information.
*   **Renewal Tracking**: Automatic reminders and renewal invoice generation.

## 8. Setup & System Settings
*   **Administrator Roles**: Granular permissions (Full Admin, Support Only, Billing Only).
*   **Email Templates**: Visual editor for all system-generated emails.
*   **Payment Gateways**: Configure API keys and settings for payment processors.
*   **Automation Settings**: Define when to suspend/terminate overdue services.
*   **Backup Manager**: Configure database and file backups.

## 9. Reports & Business Intelligence
*   **Financial Reports**: Tax summaries, Income by product, Transaction logs.
*   **Support Reports**: Ticket volume, Average response time, Staff performance.
*   **Client Reports**: Retention rate, New signups, Top spending clients.
