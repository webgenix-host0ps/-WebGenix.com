# WebGenix Complete File Path Index

## Frontend Files (webgenix-app)

### Core Application Files
- `webgenix-app/src/main.jsx` - Application entry point
- `webgenix-app/src/App.jsx` - Main application component
- `webgenix-app/vite.config.js` - Vite configuration
- `webgenix-app/package.json` - Dependencies and scripts

### Components Directory

#### Shared Components
- `webgenix-app/src/components/Badge.jsx` - Generic badge component
- `webgenix-app/src/components/ConfirmModal.jsx` - Confirmation dialog
- `webgenix-app/src/components/ErrorBoundary.jsx` - Error handling wrapper
- `webgenix-app/src/components/Footer.jsx` - Application footer
- `webgenix-app/src/components/Navbar.jsx` - Navigation bar
- `webgenix-app/src/components/ProtectedRoute.jsx` - Route protection wrapper
- `webgenix-app/src/components/SectionHeader.jsx` - Section headers
- `webgenix-app/src/components/ServiceCard.jsx` - Service display card
- `webgenix-app/src/components/SkeletonLoader.jsx` - Loading skeleton
- `webgenix-app/src/components/StatsBar.jsx` - Statistics display

#### Authentication Components
- `webgenix-app/src/components/auth/AuthButton.jsx` - Auth action buttons
- `webgenix-app/src/components/auth/AuthCard.jsx` - Auth form container
- `webgenix-app/src/components/auth/AuthInput.jsx` - Styled input fields

#### Dashboard Components
- `webgenix-app/src/components/dashboard/ActionMenu.jsx` - Dropdown action menu
- `webgenix-app/src/components/dashboard/DashboardHeader.jsx` - Dashboard header
- `webgenix-app/src/components/dashboard/DashboardLayout.jsx` - Dashboard layout wrapper
- `webgenix-app/src/components/dashboard/DashboardSidebar.jsx` - Navigation sidebar
- `webgenix-app/src/components/dashboard/DataTable.jsx` - Data table component
- `webgenix-app/src/components/dashboard/FilterBar.jsx` - Filter controls
- `webgenix-app/src/components/dashboard/InvoiceFormModal.jsx` - Invoice creation modal
- `webgenix-app/src/components/dashboard/LeadStatusUpdate.jsx` - Lead status controls
- `webgenix-app/src/components/dashboard/Modal.jsx` - Generic modal
- `webgenix-app/src/components/dashboard/StatCard.jsx` - Statistics card
- `webgenix-app/src/components/dashboard/StatusBadge.jsx` - Status indicator
- `webgenix-app/src/components/dashboard/TicketDetailModal.jsx` - Ticket details modal

#### Marketplace Components
- `webgenix-app/src/components/marketplace/Marketplace.jsx` - Marketplace interface

#### Ticket Components
- `webgenix-app/src/components/tickets/EmptyState.jsx` - Empty state display
- `webgenix-app/src/components/tickets/MessageInput.jsx` - Message composition
- `webgenix-app/src/components/tickets/MessageThread.jsx` - Conversation display
- `webgenix-app/src/components/tickets/TicketCard.jsx` - Ticket list item
- `webgenix-app/src/components/tickets/TicketPriorityBadge.jsx` - Priority indicator
- `webgenix-app/src/components/tickets/TicketStatusBadge.jsx` - Status indicator

### Context and State Management
- `webgenix-app/src/context/AuthContext.jsx` - Authentication state
- `webgenix-app/src/context/CartContext.jsx` - Shopping cart state

### Data and Hooks
- `webgenix-app/src/data/services.js` - Services data
- `webgenix-app/src/hooks/useDebounce.js` - Debounce hook

### Pages Directory

#### Main Pages
- `webgenix-app/src/pages/Home.jsx` - Landing page
- `webgenix-app/src/pages/Login.jsx` - Login page
- `webgenix-app/src/pages/Signup.jsx` - Registration page
- `webgenix-app/src/pages/VerifyEmail.jsx` - Email verification
- `webgenix-app/src/pages/ForgotPassword.jsx` - Password recovery
- `webgenix-app/src/pages/ResetPassword.jsx` - Password reset
- `webgenix-app/src/pages/Dashboard.jsx` - Main dashboard
- `webgenix-app/src/pages/Settings.jsx` - User settings
- `webgenix-app/src/pages/CreateTicket.jsx` - Ticket creation
- `webgenix-app/src/pages/TicketsList.jsx` - Ticket listing
- `webgenix-app/src/pages/TicketDetail.jsx` - Individual ticket view

#### Knowledge Base Pages
- `webgenix-app/src/pages/Knowledgebase.jsx` - KB main page
- `webgenix-app/src/pages/KnowledgebaseArticle.jsx` - Article view
- `webgenix-app/src/pages/KnowledgebaseCategory.jsx` - Category view

#### Billing Pages
- `webgenix-app/src/pages/billing/BillingDashboard.jsx` - Billing overview
- `webgenix-app/src/pages/billing/BillingInvoiceList.jsx` - Invoice listing
- `webgenix-app/src/pages/billing/BillingTicketList.jsx` - Billing tickets
- `webgenix-app/src/pages/billing/Checkout.jsx` - Payment checkout
- `webgenix-app/src/pages/billing/InvoiceDetail.jsx` - Invoice details
- `webgenix-app/src/pages/billing/InvoicesList.jsx` - User invoices
- `webgenix-app/src/pages/billing/OrdersList.jsx` - Order history
- `webgenix-app/src/pages/billing/OrderSuccess.jsx` - Payment confirmation
- `webgenix-app/src/pages/billing/ServicesList.jsx` - Available services

#### Admin Pages
- `webgenix-app/src/pages/admin/AdminDashboard.jsx` - Admin main dashboard
- `webgenix-app/src/pages/admin/AdminClientDetail.jsx` - Client management
- `webgenix-app/src/pages/admin/AdminInvoiceDetail.jsx` - Invoice management
- `webgenix-app/src/pages/admin/AdminInvoiceList.jsx` - Invoice listing
- `webgenix-app/src/pages/admin/AdminOrderDetail.jsx` - Order details
- `webgenix-app/src/pages/admin/AdminOrdersList.jsx` - Order management
- `webgenix-app/src/pages/admin/AdminProductDetail.jsx` - Product management
- `webgenix-app/src/pages/admin/AdminProductList.jsx` - Product listing
- `webgenix-app/src/pages/admin/AdminServicesList.jsx` - Service management
- `webgenix-app/src/pages/admin/AdminSettings.jsx` - Admin settings
- `webgenix-app/src/pages/admin/AdminTicketList.jsx` - Ticket management
- `webgenix-app/src/pages/admin/DomainManagement.jsx` - Domain administration
- `webgenix-app/src/pages/admin/KnowledgebaseManagement.jsx` - KB administration
- `webgenix-app/src/pages/admin/LeadManagement.jsx` - Lead administration
- `webgenix-app/src/pages/admin/ServerManagement.jsx` - Server administration
- `webgenix-app/src/pages/admin/StaffManagement.jsx` - Staff management
- `webgenix-app/src/pages/admin/TaxSettings.jsx` - Tax configuration
- `webgenix-app/src/pages/admin/UserManagement.jsx` - User administration

#### Role-Specific Dashboards
- `webgenix-app/src/pages/dashboards/AdminDashboard.jsx` - Admin dashboard
- `webgenix-app/src/pages/dashboards/ClientDashboard.jsx` - Client dashboard
- `webgenix-app/src/pages/dashboards/SupportDashboard.jsx` - Support dashboard

#### Lead Management Pages
- `webgenix-app/src/pages/leads/LeadDashboard.jsx` - Lead overview
- `webgenix-app/src/pages/leads/LeadManagement.jsx` - Lead operations

#### Service Pages
- `webgenix-app/src/pages/services/MyServices.jsx` - User services
- `webgenix-app/src/pages/services/ServiceDetail.jsx` - Service details

#### Support Pages
- `webgenix-app/src/pages/support/SupportDashboard.jsx` - Support dashboard
- `webgenix-app/src/pages/support/SupportTicketList.jsx` - Support tickets

#### Marketplace
- `webgenix-app/src/pages/MarketplacePage.jsx` - Marketplace interface

### Services Directory
- `webgenix-app/src/services/admin.service.js` - Admin API calls
- `webgenix-app/src/services/adminSettings.service.js` - Admin settings API
- `webgenix-app/src/services/api.js` - Base API client
- `webgenix-app/src/services/auth.service.js` - Authentication API
- `webgenix-app/src/services/billing.service.js` - Billing API
- `webgenix-app/src/services/kb.service.js` - Knowledge base API
- `webgenix-app/src/services/lead.service.js` - Lead management API
- `webgenix-app/src/services/support.service.js` - Support API
- `webgenix-app/src/services/ticket.service.js` - Ticket system API

### Store Management
- `webgenix-app/src/store/useAdminStore.js` - Admin state management

## Backend Files (webgenix-backend)

### Core Application Files
- `webgenix-backend/src/server.js` - Server entry point
- `webgenix-backend/src/app.js` - Express application setup
- `webgenix-backend/package.json` - Dependencies and scripts

### Configuration
- `webgenix-backend/src/config/backup.js` - Backup configuration
- `webgenix-backend/src/config/db.js` - Database configuration
- `webgenix-backend/src/config/env.js` - Environment variables

### Constants
- `webgenix-backend/src/constants/billing.js` - Billing constants
- `webgenix-backend/src/constants/leads.js` - Lead management constants
- `webgenix-backend/src/constants/tickets.js` - Ticket system constants

### Middleware
- `webgenix-backend/src/middlewares/auth.middleware.js` - Authentication middleware
- `webgenix-backend/src/middlewares/error.middleware.js` - Error handling
- `webgenix-backend/src/middlewares/rateLimit.middleware.js` - Rate limiting
- `webgenix-backend/src/middlewares/role.middleware.js` - Role-based access
- `webgenix-backend/src/middlewares/sanitize.middleware.js` - Input sanitization
- `webgenix-backend/src/middlewares/ticketRateLimit.middleware.js` - Ticket rate limiting
- `webgenix-backend/src/middlewares/upload.middleware.js` - File upload handling
- `webgenix-backend/src/middlewares/validate.middleware.js` - Input validation

### Models (Data Layer)
- `webgenix-backend/src/models/AuditLog.js` - Audit trail model
- `webgenix-backend/src/models/AuthToken.js` - Authentication tokens
- `webgenix-backend/src/models/Counter.js` - Auto-increment counters
- `webgenix-backend/src/models/Session.js` - User sessions
- `webgenix-backend/src/models/User.js` - User model

### Module Structure

#### Admin Module
- `webgenix-backend/src/modules/admin/admin.controller.js` - Admin operations
- `webgenix-backend/src/modules/admin/admin.routes.js` - Admin routes
- `webgenix-backend/src/modules/admin/models/SystemSetting.js` - System settings

#### Authentication Module
- `webgenix-backend/src/modules/auth/auth.controller.js` - Auth controller
- `webgenix-backend/src/modules/auth/auth.routes.js` - Auth routes
- `webgenix-backend/src/modules/auth/auth.service.js` - Auth business logic
- `webgenix-backend/src/modules/auth/auth.validation.js` - Input validation

#### Billing Module
- `webgenix-backend/src/modules/billing/billing.controller.js` - Billing operations
- `webgenix-backend/src/modules/billing/billing.routes.js` - Billing routes
- `webgenix-backend/src/modules/billing/billing.validation.js` - Validation rules
- `webgenix-backend/src/modules/billing/payment.controller.js` - Payment processing
- `webgenix-backend/src/modules/billing/payment.routes.js` - Payment routes

##### Billing Models
- `webgenix-backend/src/modules/billing/models/Credit.js` - Credit system
- `webgenix-backend/src/modules/billing/models/Invoice.js` - Invoice model
- `webgenix-backend/src/modules/billing/models/Order.js` - Order model
- `webgenix-backend/src/modules/billing/models/Payment.js` - Payment records
- `webgenix-backend/src/modules/billing/models/Product.js` - Product catalog
- `webgenix-backend/src/modules/billing/models/PromoCode.js` - Promotional codes
- `webgenix-backend/src/modules/billing/models/Service.js` - Service offerings
- `webgenix-backend/src/modules/billing/models/index.js` - Model exports

##### Billing Services
- `webgenix-backend/src/modules/billing/services/billing.service.js` - Billing logic
- `webgenix-backend/src/modules/billing/services/payment.service.js` - Payment processing
- `webgenix-backend/src/modules/billing/services/product.service.js` - Product management
- `webgenix-backend/src/modules/billing/services/razorpay.service.js` - Razorpay integration

#### Domain Management Module
- `webgenix-backend/src/modules/domains/domain.controller.js` - Domain operations
- `webgenix-backend/src/modules/domains/domain.routes.js` - Domain routes
- `webgenix-backend/src/modules/domains/models/Domain.js` - Domain model
- `webgenix-backend/src/modules/domains/models/DomainRegistrar.js` - Registrar integration
- `webgenix-backend/src/modules/domains/models/TldPricing.js` - TLD pricing

#### Email Module
- `webgenix-backend/src/modules/email/models/EmailTemplate.js` - Email templates

#### Knowledge Base Module
- `webgenix-backend/src/modules/knowledgebase/kb.controller.js` - KB operations
- `webgenix-backend/src/modules/knowledgebase/kb.routes.js` - KB routes
- `webgenix-backend/src/modules/knowledgebase/models/KnowledgebaseArticle.js` - Article model
- `webgenix-backend/src/modules/knowledgebase/models/KnowledgebaseCategory.js` - Category model

#### Lead Management Module
- `webgenix-backend/src/modules/leads/lead.controller.js` - Lead operations
- `webgenix-backend/src/modules/leads/lead.routes.js` - Lead routes
- `webgenix-backend/src/modules/leads/lead.service.js` - Lead business logic
- `webgenix-backend/src/modules/leads/models/Lead.js` - Lead model

#### Notification Module
- `webgenix-backend/src/modules/notifications/models/Notification.js` - Notification model

#### Payment Module
- `webgenix-backend/src/modules/payments/razorpay.webhook.js` - Razorpay webhooks

#### Server Management Module
- `webgenix-backend/src/modules/servers/models/Server.js` - Server model
- `webgenix-backend/src/modules/servers/models/ServerGroup.js` - Server grouping
- `webgenix-backend/src/modules/servers/server.controller.js` - Server operations
- `webgenix-backend/src/modules/servers/server.routes.js` - Server routes

#### Tax Module
- `webgenix-backend/src/modules/tax/models/TaxRule.js` - Tax configuration
- `webgenix-backend/src/modules/tax/tax.controller.js` - Tax operations
- `webgenix-backend/src/modules/tax/tax.routes.js` - Tax routes

#### Ticket Module
- `webgenix-backend/src/modules/tickets/ticket.controller.js` - Ticket operations
- `webgenix-backend/src/modules/tickets/ticket.routes.js` - Ticket routes
- `webgenix-backend/src/modules/tickets/ticket.service.js` - Ticket business logic
- `webgenix-backend/src/modules/tickets/ticket.validation.js` - Input validation
- `webgenix-backend/src/modules/tickets/ticket.permissions.js` - Access control
- `webgenix-backend/src/modules/tickets/predefinedReply.controller.js` - Quick replies
- `webgenix-backend/src/modules/tickets/predefinedReply.service.js` - Reply logic

##### Ticket Models
- `webgenix-backend/src/modules/tickets/models/Department.js` - Department model
- `webgenix-backend/src/modules/tickets/models/PredefinedReply.js` - Quick replies
- `webgenix-backend/src/modules/tickets/models/Ticket.js` - Ticket model
- `webgenix-backend/src/modules/tickets/models/TicketActivity.js` - Activity tracking
- `webgenix-backend/src/modules/tickets/models/TicketMessage.js` - Message model

#### User Module
- `webgenix-backend/src/modules/user/user.controller.js` - User operations
- `webgenix-backend/src/modules/user/user.routes.js` - User routes
- `webgenix-backend/src/modules/user/user.service.js` - User business logic

### Routes
- `webgenix-backend/src/routes/index.js` - Main route configuration

### Services
- `webgenix-backend/src/services/audit.service.js` - Audit logging
- `webgenix-backend/src/services/cron.service.js` - Scheduled tasks

### Seeders
- `webgenix-backend/src/seeders/department.seeder.js` - Department data
- `webgenix-backend/src/seeders/settings.seeder.js` - System settings

## Scripts and Utilities

### Backend Scripts
- `webgenix-backend/scripts/check-users.js` - User verification
- `webgenix-backend/scripts/fix2fa.js` - 2FA fixes
- `webgenix-backend/scripts/seed.js` - Database seeding
- `webgenix-backend/scripts/seedDepartments.js` - Department seeding
- `webgenix-backend/scripts/seedProducts.js` - Product seeding
- `webgenix-backend/scripts/smoke-test.js` - System testing
- `webgenix-backend/scripts/test-ticket-creation.js` - Ticket testing
- `webgenix-backend/scripts/verifyUser.js` - User verification

### Utility Scripts
- `webgenix-backend/seedReplies.js` - Reply seeding
- `webgenix-backend/sync-counters.js` - Counter synchronization

### Development Scripts
- `webgenix-backend/scratch/verify_admin_stats.js` - Admin verification
- `webgenix-backend/scratch/verify_implementation.js` - Implementation testing

## Documentation and Configuration

### Project Documentation
- `MVP.md` - Minimum viable product specification
- `documents/MVP_Gap_Analysis_Part1.md` - Gap analysis part 1
- `documents/MVP_Gap_Analysis_Part2.md` - Gap analysis part 2
- `documents/MVP_Gap_Analysis_Part3.md` - Gap analysis part 3
- `documents/Pending_Tasks.md` - Task tracking
- `documents/THEME_QUICK_REFERENCE.md` - Theme reference
- `documents/THEME_SPECIFICATION.md` - Theme documentation
- `documents/structure.md` - Project structure

### Configuration Files
- `documents/services.json` - Services configuration
- `documents/theme.js` - Theme configuration
- `landing-page/script.js` - Landing page scripts
- `landing-page/services-data.js` - Services data
- `landing-page/ui.md` - UI documentation
- `start-server.ps1` - Server startup script

### Package Management
- `package-lock.json` - Root package lock
- `webgenix-app/package-lock.json` - Frontend package lock

## File Usage Patterns

### High-Frequency Files (Development Focus)
- Authentication: `AuthContext.jsx`, `auth.service.js`, `auth.controller.js`
- Dashboard: `Dashboard.jsx`, various dashboard components
- Tickets: `TicketDetail.jsx`, `ticket.service.js`, `ticket.controller.js`
- Billing: `BillingDashboard.jsx`, `billing.service.js`, `billing.controller.js`

### Configuration Files (Setup Focus)
- `package.json` files for dependency management
- `vite.config.js` for build configuration
- `db.js` for database setup
- `env.js` for environment configuration

### Model Files (Data Structure Focus)
- `User.js` - Core user model
- `Ticket.js` - Ticket system model
- `Invoice.js` - Billing model
- `Lead.js` - Lead management model

This comprehensive index provides quick access to any file in the WebGenix project for efficient development and maintenance.