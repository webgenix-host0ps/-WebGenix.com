# Project Structure - WebGenix

> **Last Updated**: 2026-04-30  
> **Version**: 3.1.0  
> **Architecture**: MERN Stack (MongoDB, Express, React, Node.js)

---

## Root Directory

```
WebGenix/
├── documents/                 # Project documentation & design specs
├── webgenix-app/              # Frontend (React + Vite + Tailwind)
├── webgenix-backend/          # Backend (Express + MongoDB)
├── graphify-out/              # Knowledge graph outputs
├── .env.example               # Environment template
└── package.json               # Root package config
```

---

## Documentation (`/documents`)

| File | Purpose | Used By |
|------|---------|---------|
| `services.json` | Service catalog data (pricing, tiers, features) | Store.jsx, ServiceCard.jsx |
| `structure.md` | This file - project architecture documentation | Development reference |
| `THEME_SPECIFICATION.md` | Complete design system (colors, typography, components) | index.css, all components |
| `THEME_QUICK_REFERENCE.md` | Quick theme token reference | Development reference |
| `theme.js` | JavaScript theme configuration | Frontend build config |

---

## Frontend (`/webgenix-app`)

### Entry Points

| File | Purpose | Used By |
|------|---------|---------|
| `index.html` | HTML entry point, SEO metadata, font loading | Browser |
| `src/main.jsx` | React app bootstrap, Router setup | index.html |
| `src/App.jsx` | Root component, all route definitions | main.jsx |
| `src/index.css` | Tailwind directives, global styles, theme classes | main.jsx |
| `vite.config.js` | Vite build configuration | Build system |
| `eslint.config.js` | ESLint rules | Development |

### Context Providers

| File | Purpose | Used By |
|------|---------|---------|
| `context/AuthContext.jsx` | Authentication state, login/logout, token management | App.jsx, all protected routes |
| `context/CartContext.jsx` | Shopping cart state, add/remove items | App.jsx, Store.jsx, Navbar.jsx, Checkout.jsx |

### Services (API Layer)

| File | Purpose | Used By |
|------|---------|---------|
| `services/api.js` | Axios instance, interceptors, token injection | All service files |
| `services/auth.service.js` | Auth API calls (login, register, reset, verify) | AuthContext.jsx, Login.jsx, Signup.jsx |
| `services/ticket.service.js` | Ticket CRUD, messages, replies | TicketsList.jsx, TicketDetail.jsx, CreateTicket.jsx |
| `services/billing.service.js` | Products, orders, invoices, payments, services | Store.jsx, Checkout.jsx, OrdersList.jsx, InvoicesList.jsx, ServicesList.jsx |
| `services/admin.service.js` | Admin dashboard data (currently mock) | AdminDashboard.jsx, AdminTicketList.jsx |
| `services/support.service.js` | Support dashboard stats | SupportDashboard.jsx, SupportTicketList.jsx |
| `services/lead.service.js` | Lead pipeline data | LeadDashboard.jsx, LeadManagement.jsx |

### Components

#### Global Components

| File | Purpose | Used By |
|------|---------|---------|
| `components/Navbar.jsx` | Top navigation, auth links, cart badge | App.jsx (Layout) |
| `components/Footer.jsx` | Site footer, links, contact | App.jsx (Layout) |
| `components/ProtectedRoute.jsx` | Route guard, role checking | App.jsx (all protected routes) |
| `components/SectionHeader.jsx` | Page section headers with eyebrow/title | Home.jsx, Dashboard.jsx, Store.jsx |
| `components/ServiceCard.jsx` | Service/product display card | Store.jsx, Home.jsx |
| `components/Badge.jsx` | Status/label badges | Various pages |
| `components/StatsBar.jsx` | Statistics display bar | Home.jsx |

#### Auth Components

| File | Purpose | Used By |
|------|---------|---------|
| `components/auth/AuthCard.jsx` | Card wrapper for auth forms | Login.jsx, Signup.jsx, ForgotPassword.jsx |
| `components/auth/AuthInput.jsx` | Styled form input | All auth pages |
| `components/auth/AuthButton.jsx` | Styled submit button | All auth pages |

#### Dashboard Components

| File | Purpose | Used By |
|------|---------|---------|
| `components/dashboard/DashboardLayout.jsx` | Shared dashboard wrapper | All role dashboards |
| `components/dashboard/DashboardHeader.jsx` | Dashboard top bar | DashboardLayout.jsx |
| `components/dashboard/DashboardSidebar.jsx` | Role-based sidebar nav | DashboardLayout.jsx |
| `components/dashboard/StatCard.jsx` | Metric display card | All dashboards |
| `components/dashboard/DataTable.jsx` | Data table with pagination | AdminTicketList.jsx, AdminInvoiceList.jsx |
| `components/dashboard/FilterBar.jsx` | Filter/search controls | AdminTicketList.jsx, AdminInvoiceList.jsx |
| `components/dashboard/StatusBadge.jsx` | Status indicator | DataTable.jsx, ticket lists |
| `components/dashboard/ActionMenu.jsx` | Context action dropdown | DataTable.jsx |
| `components/dashboard/Modal.jsx` | Generic modal | InvoiceFormModal.jsx |
| `components/dashboard/TicketDetailModal.jsx` | Ticket preview modal | AdminTicketList.jsx |
| `components/dashboard/InvoiceFormModal.jsx` | Create/edit invoice modal | AdminInvoiceList.jsx |
| `components/dashboard/LeadStatusUpdate.jsx` | Lead stage changer | LeadManagement.jsx |

#### Ticket Components

| File | Purpose | Used By |
|------|---------|---------|
| `components/tickets/TicketCard.jsx` | Ticket summary card | TicketsList.jsx, Dashboard.jsx |
| `components/tickets/MessageThread.jsx` | Conversation display | TicketDetail.jsx |
| `components/tickets/MessageInput.jsx` | Reply composer | TicketDetail.jsx |
| `components/tickets/TicketPriorityBadge.jsx` | Priority indicator | TicketCard.jsx, TicketDetail.jsx |
| `components/tickets/TicketStatusBadge.jsx` | Status indicator | TicketCard.jsx, TicketsList.jsx |
| `components/tickets/EmptyState.jsx` | Empty list placeholder | TicketsList.jsx |

#### Marketplace Components

| File | Purpose | Used By |
|------|---------|---------|
| `components/marketplace/Marketplace.jsx` | Marketplace/product browser | ClientDashboard.jsx |

### Pages

#### Public Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/Home.jsx` | `/` | Landing page, hero, services preview | None |
| `pages/Login.jsx` | `/login` | User login form | POST /auth/login |
| `pages/Signup.jsx` | `/signup` | Registration form | POST /auth/register |
| `pages/ForgotPassword.jsx` | `/forgot-password` | Password reset request | POST /auth/forgot-password |
| `pages/ResetPassword.jsx` | `/reset-password` | Set new password | POST /auth/reset-password |
| `pages/VerifyEmail.jsx` | `/verify-email` | Email verification | GET /auth/verify-email |

#### Client Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/Dashboard.jsx` | `/dashboard` | Client dashboard overview | GET /auth/me, GET /tickets |
| `pages/dashboards/ClientDashboard.jsx` | `/dashboard/marketplace` | Client marketplace view | GET /billing/products |
| `pages/TicketsList.jsx` | `/tickets` | User's ticket list | GET /tickets |
| `pages/TicketDetail.jsx` | `/tickets/:id` | Single ticket + messages | GET /tickets/:id, POST /tickets/:id/messages |
| `pages/CreateTicket.jsx` | `/tickets/new` | New ticket form | POST /tickets |
| `pages/Settings.jsx` | `/settings` | Account settings | PATCH /auth/profile |

#### Store / Billing Pages (Client)

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/billing/Store.jsx` | `/store` | Product catalog, add to cart | GET /billing/products |
| `pages/billing/Checkout.jsx` | `/checkout` | Cart review, payment | POST /billing/orders, POST /billing/payments/razorpay/* |
| `pages/billing/OrdersList.jsx` | `/orders` | Order history | GET /billing/orders |
| `pages/billing/InvoicesList.jsx` | `/invoices` | Invoice list | GET /billing/invoices |
| `pages/billing/ServicesList.jsx` | `/services` (legacy) | Services list | GET /billing/services |
| `pages/services/MyServices.jsx` | `/services`, `/my-services` | Active services management | GET /billing/services |
| `pages/billing/OrderSuccess.jsx` | `/order-success` | Payment confirmation | None |

#### Admin Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/admin/AdminDashboard.jsx` | `/admin` | Admin overview | Mock data (needs /admin/stats) |
| `pages/admin/AdminTicketList.jsx` | `/admin/tickets` | All tickets management | GET /tickets (admin view) |
| `pages/admin/AdminInvoiceList.jsx` | `/admin/invoices` | Invoice management | GET /billing/admin/invoices |
| `pages/admin/AdminLeadManagement.jsx` | `/admin/leads` | Lead pipeline admin | GET /admin/leads |
| `pages/admin/UserManagement.jsx` | `/admin/clients` | User CRUD | GET /users (admin) |

#### Support Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/support/SupportDashboard.jsx` | `/support` | Support overview | GET /support/stats (mock) |
| `pages/support/SupportTicketList.jsx` | `/support/tickets` | Assigned tickets | GET /tickets (support filter) |
| `pages/dashboards/SupportDashboard.jsx` | (legacy) | Support dashboard v1 | GET /support/stats |

#### Billing Admin Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/billing/BillingDashboard.jsx` | `/billing` | Billing overview | GET /billing/stats (mock) |
| `pages/billing/BillingInvoiceList.jsx` | `/billing/invoices` | Invoice management | GET /billing/admin/invoices |
| `pages/billing/BillingTicketList.jsx` | `/billing/tickets` | Billing-related tickets | GET /tickets (billing filter) |

#### Lead Pages

| File | Route | Purpose | Backend API |
|------|-------|---------|-------------|
| `pages/leads/LeadDashboard.jsx` | `/leads` | Lead overview | GET /leads/stats (mock) |
| `pages/leads/LeadManagement.jsx` | `/leads/pipeline` | Lead pipeline Kanban | GET /admin/leads |

### Data & Hooks

| File | Purpose | Used By |
|------|---------|---------|
| `data/services.js` | Static service data (fallback) | Home.jsx (fallback) |
| `hooks/useDebounce.js` | Debounce hook for search inputs | Store.jsx (search) |

### Assets

| File | Purpose |
|------|---------|
| `assets/hero.png` | Hero section background image |
| `assets/react.svg` | React logo (dev) |
| `assets/vite.svg` | Vite logo (dev) |
| `public/favicon.svg` | Site favicon |
| `public/icons.svg` | Social icons sprite sheet |

---

## Backend (`/webgenix-backend`)

### Entry Points

| File | Purpose |
|------|---------|
| `src/server.js` | Server startup, DB connection, cron init |
| `src/app.js` | Express app setup, middleware, routes |
| `.env` | Environment variables (DB, Razorpay, email) |
| `.env.example` | Environment template |

### Configuration

| File | Purpose | Used By |
|------|---------|---------|
| `src/config/env.js` | Environment validation, .env loading | server.js, all modules |
| `src/config/db.js` | MongoDB connection | server.js |
| `src/constants/tickets.js` | Ticket statuses, priorities, roles | Ticket module, auth middleware |
| `src/constants/billing.js` | Billing constants, invoice statuses | Billing module |

### Middlewares

| File | Purpose | Used By |
|------|---------|---------|
| `src/middlewares/auth.middleware.js` | JWT verification, user attachment | All protected routes |
| `src/middlewares/role.middleware.js` | Role-based access control | Admin/billing/support routes |
| `src/middlewares/validate.middleware.js` | Zod schema validation | All CRUD routes |
| `src/middlewares/error.middleware.js` | Centralized error handling | app.js |
| `src/middlewares/rateLimit.middleware.js` | Rate limiting for auth endpoints | auth.routes.js |

### Models (Global)

| File | Purpose | Used By |
|------|---------|---------|
| `src/models/User.js` | User schema, roles, profile | Auth, all modules |
| `src/models/AuthToken.js` | Refresh token storage | auth.service.js |
| `src/models/Session.js` | User session tracking | auth.service.js |
| `src/models/AuditLog.js` | Audit trail entries | audit.service.js |
| `src/models/Counter.js` | Sequential ID generation | Invoice, Order models |

### Shared Services

| File | Purpose | Used By |
|------|---------|---------|
| `src/services/email.service.js` | Email sending (Nodemailer) | auth.service.js, billing.service.js |
| `src/services/crypto.service.js` | Token hashing, random generation | auth.service.js, token.service.js |
| `src/services/token.service.js` | Token generation/verification | auth.service.js |
| `src/services/audit.service.js` | Audit log creation | All controllers |
| `src/services/cron.service.js` | Scheduled tasks (billing renewals, suspensions) | server.js |

### Utilities

| File | Purpose | Used By |
|------|---------|---------|
| `src/utils/asyncHandler.js` | Express async wrapper | All controllers |
| `src/utils/ApiError.js` | Custom error class | All services/controllers |
| `src/utils/logger.js` | Logging utility | server.js, services |

---

### Module: Auth (`/src/modules/auth`)

| File | Purpose | Used By |
|------|---------|---------|
| `auth.routes.js` | Auth endpoint definitions | routes/index.js |
| `auth.controller.js` | Request handlers (login, register, reset) | auth.routes.js |
| `auth.service.js` | Business logic (token generation, password hashing) | auth.controller.js |
| `auth.validation.js` | Zod schemas for auth inputs | auth.routes.js |
| `auth.service.update.js` | Updated auth service (if different) | N/A (development) |

**API Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Set new password
- `GET /auth/verify-email` - Verify email address
- `POST /auth/logout` - Logout current session
- `POST /auth/logout-all` - Logout all sessions
- `GET /auth/me` - Get current user
- `PATCH /auth/profile` - Update profile

---

### Module: User (`/src/modules/user`)

| File | Purpose | Used By |
|------|---------|---------|
| `user.routes.js` | User endpoint definitions | routes/index.js |
| `user.controller.js` | User CRUD handlers | user.routes.js |
| `user.service.js` | User business logic | user.controller.js |

**API Endpoints**:
- `GET /users` - List users (admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

---

### Module: Tickets (`/src/modules/tickets`)

| File | Purpose | Used By |
|------|---------|---------|
| `ticket.routes.js` | Ticket endpoint definitions | routes/index.js |
| `ticket.controller.js` | Ticket request handlers | ticket.routes.js |
| `ticket.service.js` | Ticket business logic | ticket.controller.js |
| `ticket.validation.js` | Zod schemas for ticket inputs | ticket.routes.js |
| `ticket.permissions.js` | Ticket access control logic | ticket.controller.js |
| `predefinedReply.controller.js` | Canned reply handlers | ticket.routes.js |
| `predefinedReply.service.js` | Canned reply logic | predefinedReply.controller.js |

#### Ticket Models

| File | Purpose | Used By |
|------|---------|---------|
| `models/Ticket.js` | Ticket schema, status, priority | ticket.service.js |
| `models/TicketMessage.js` | Message/reply schema | ticket.service.js |
| `models/TicketActivity.js` | Activity log schema | ticket.service.js |
| `models/Department.js` | Department routing schema | ticket.service.js |
| `models/PredefinedReply.js` | Canned reply schema | predefinedReply.service.js |

**API Endpoints**:
- `POST /tickets` - Create ticket
- `GET /tickets` - List user's tickets
- `GET /tickets/:id` - Get ticket with messages
- `POST /tickets/:id/messages` - Reply to ticket
- `PATCH /tickets/:id/status` - Change status (support/admin)
- `PATCH /tickets/:id/assign` - Assign ticket (support/admin)
- `POST /tickets/:id/close` - Close ticket
- `POST /tickets/:id/watch` - Toggle watcher
- `POST /tickets/:id/rate` - Submit rating
- `GET /tickets/settings/predefined-replies` - List canned replies
- `POST /tickets/settings/predefined-replies` - Create canned reply
- `PATCH /tickets/settings/predefined-replies/:id` - Update canned reply
- `DELETE /tickets/settings/predefined-replies/:id` - Delete canned reply

---

### Module: Billing (`/src/modules/billing`)

| File | Purpose | Used By |
|------|---------|---------|
| `billing.routes.js` | Billing endpoint definitions | routes/index.js |
| `billing.controller.js` | Billing request handlers | billing.routes.js |
| `billing.validation.js` | Zod schemas for billing inputs | billing.routes.js |
| `payment.routes.js` | Payment endpoint definitions | billing.routes.js |
| `payment.controller.js` | Payment request handlers | payment.routes.js |

#### Billing Services

| File | Purpose | Used By |
|------|---------|---------|
| `services/billing.service.js` | Order/invoice/service business logic | billing.controller.js |
| `services/product.service.js` | Product catalog logic | billing.controller.js |
| `services/payment.service.js` | Payment processing (Stripe/PayPal) | payment.controller.js |
| `services/razorpay.service.js` | Razorpay integration, webhooks | payment.controller.js |

#### Billing Models

| File | Purpose | Used By |
|------|---------|---------|
| `models/Product.js` | Product schema, pricing tiers | product.service.js |
| `models/Order.js` | Order schema, items, totals | billing.service.js |
| `models/Invoice.js` | Invoice schema, line items | billing.service.js |
| `models/Payment.js` | Payment record schema | payment.service.js |
| `models/Service.js` | Active service schema | billing.service.js |
| `models/PromoCode.js` | Promo/discount code schema | billing.service.js |
| `models/Credit.js` | Account credit schema | billing.service.js |
| `models/index.js` | Model exports | N/A |

**API Endpoints (Products)**:
- `GET /billing/products` - List products (public)
- `GET /billing/products/featured` - Featured products
- `GET /billing/products/slug/:slug` - Get by slug
- `GET /billing/products/categories` - List categories
- `GET /billing/products/:id` - Get single product
- `POST /billing/products` - Create product (admin)
- `PATCH /billing/products/:id` - Update product (admin)
- `DELETE /billing/products/:id` - Delete product (admin)
- `POST /billing/products/:id/toggle` - Toggle active (admin)
- `POST /billing/products/:id/duplicate` - Duplicate product (admin)

**API Endpoints (Orders/Invoices)**:
- `POST /billing/orders` - Create order (checkout)
- `GET /billing/orders` - User's orders
- `GET /billing/orders/:id` - Single order
- `POST /billing/orders/:id/cancel` - Cancel order
- `GET /billing/invoices` - User's invoices
- `GET /billing/invoices/:id` - Single invoice
- `POST /billing/promocode/validate` - Validate promo code
- `GET /billing/services` - User's active services
- `GET /billing/services/:id/proration` - Proration calc (admin)

**API Endpoints (Payments)**:
- `POST /billing/payments/webhook/razorpay` - Razorpay webhook
- `POST /billing/payments/razorpay/create-order` - Create payment order
- `POST /billing/payments/razorpay/verify` - Verify payment
- `POST /billing/payments/offline/payment` - Offline payment request
- `GET /billing/payments/payments` - User payment history
- `GET /billing/payments/payments/:id` - Single payment
- `GET /billing/payments/admin/payments` - All payments (admin)
- `POST /billing/payments/payments/:id/refund` - Process refund (admin)

**API Endpoints (Promo Codes - Admin)**:
- `POST /billing/promocode` - Create promo
- `GET /billing/promocode` - List promos
- `PATCH /billing/promocode/:id` - Update promo
- `DELETE /billing/promocode/:id` - Delete promo

---

### Module: Payments (Webhooks) (`/src/modules/payments`)

| File | Purpose | Used By |
|------|---------|---------|
| `razorpay.webhook.js` | Razorpay webhook handlers | payment.routes.js |

---

### Routes (`/src/routes`)

| File | Purpose |
|------|---------|
| `index.js` | Main router, mounts all module routes |

**Route Mounting**:
```
/api/auth     → auth.routes.js
/api/users    → user.routes.js
/api/tickets  → ticket.routes.js
/api/billing  → billing.routes.js
/api/health   → Health check
```

---

### Scripts

| File | Purpose | Run Command |
|------|---------|-------------|
| `scripts/seedDepartments.js` | Seed ticket departments | `npm run seed` |
| `scripts/seedProducts.js` | Seed billing products | `npm run seed:products` |
| `seedReplies.js` | Seed predefined replies | `node seedReplies.js` |
| `sync-counters.js` | Sync database counters | `node sync-counters.js` |

---

## Module Dependency Map

```
Frontend (webgenix-app)
├── Auth Flow
│   ├── AuthContext.jsx → auth.service.js → POST /auth/*
│   ├── Login.jsx → auth.service.js
│   ├── Signup.jsx → auth.service.js
│   └── ProtectedRoute.jsx → AuthContext.jsx
│
├── Ticket Flow
│   ├── TicketsList.jsx → ticket.service.js → GET /tickets
│   ├── TicketDetail.jsx → ticket.service.js → GET/POST /tickets/:id
│   └── CreateTicket.jsx → ticket.service.js → POST /tickets
│
├── Store/Billing Flow
│   ├── Store.jsx → billing.service.js → GET /billing/products
│   ├── CartContext.jsx → (local state)
│   ├── Checkout.jsx → billing.service.js → POST /billing/orders, /billing/payments/*
│   ├── OrdersList.jsx → billing.service.js → GET /billing/orders
│   ├── InvoicesList.jsx → billing.service.js → GET /billing/invoices
│   ├── ServicesList.jsx → billing.service.js → GET /billing/services
│   └── MyServices.jsx → billing.service.js → GET /billing/services
│
├── Admin Flow
│   ├── AdminDashboard.jsx → admin.service.js (mock)
│   ├── AdminTicketList.jsx → admin.service.js → GET /tickets
│   ├── AdminInvoiceList.jsx → billing.service.js → GET /billing/admin/invoices
│   └── UserManagement.jsx → admin.service.js → GET /users
│
├── Support Flow
│   ├── SupportDashboard.jsx → support.service.js (mock)
│   └── SupportTicketList.jsx → ticket.service.js → GET /tickets
│
├── Billing Admin Flow
│   ├── BillingDashboard.jsx → billing.service.js (mock)
│   ├── BillingInvoiceList.jsx → billing.service.js → GET /billing/admin/invoices
│   └── BillingTicketList.jsx → ticket.service.js → GET /tickets
│
└── Lead Flow
    ├── LeadDashboard.jsx → lead.service.js (mock)
    └── LeadManagement.jsx → lead.service.js → GET /admin/leads

Backend (webgenix-backend)
├── Auth Module
│   ├── auth.routes.js → auth.controller.js → auth.service.js
│   ├── auth.service.js → email.service.js, crypto.service.js, token.service.js
│   └── Models: User.js, AuthToken.js, Session.js
│
├── User Module
│   ├── user.routes.js → user.controller.js → user.service.js
│   └── Uses: User.js
│
├── Ticket Module
│   ├── ticket.routes.js → ticket.controller.js → ticket.service.js
│   ├── ticket.service.js → Models: Ticket.js, TicketMessage.js, TicketActivity.js, Department.js
│   ├── predefinedReply.controller.js → predefinedReply.service.js → PredefinedReply.js
│   └── ticket.permissions.js → role-based access
│
├── Billing Module
│   ├── billing.routes.js → billing.controller.js → billing.service.js, product.service.js
│   ├── payment.routes.js → payment.controller.js → razorpay.service.js, payment.service.js
│   ├── Models: Product.js, Order.js, Invoice.js, Payment.js, Service.js, PromoCode.js, Credit.js
│   └── Uses: Counter.js (sequential IDs), email.service.js
│
└── Shared
    ├── audit.service.js → AuditLog.js
    ├── cron.service.js → billing.service.js (renewals, suspensions)
    └── email.service.js → Nodemailer
```

---

## Role-Based Route Access

| Role | Available Routes |
|------|-----------------|
| **Client** | `/`, `/store`, `/dashboard`, `/tickets`, `/orders`, `/invoices`, `/services`, `/settings` |
| **Support** | `/support`, `/support/tickets` |
| **Billing** | `/billing`, `/billing/invoices`, `/billing/tickets` |
| **Lead** | `/leads`, `/leads/pipeline` |
| **Admin** | All routes + `/admin`, `/admin/tickets`, `/admin/invoices`, `/admin/leads`, `/admin/clients` |

---

## Key Technologies

- **Frontend**: React 18, Vite 5, Tailwind CSS v4, React Router v6, Lucide React, Axios
- **Backend**: Node.js 18+, Express 4, MongoDB (Mongoose 8), JWT, Bcrypt, Zod
- **Payments**: Razorpay (India), Stripe/PayPal (configured, not primary)
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Express Rate Limit, MongoDB Sanitize
- **Design**: Dark theme, Glassmorphism, Responsive layout, Inter font
