# WebGenix Project Knowledge Graph Analysis

## Project Overview
WebGenix is a comprehensive web hosting and service management platform with a React frontend and Node.js backend architecture.

## Architecture Summary

### Frontend (webgenix-app)
- **Framework**: React 18 with Vite build system
- **UI Components**: Modular component architecture
- **State Management**: Context API (AuthContext, CartContext)
- **Routing**: React Router with protected routes
- **Styling**: CSS with theme system

### Backend (webgenix-backend)
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: Modular MVC pattern
- **Authentication**: JWT-based with role-based access control
- **Payment**: Razorpay integration

## Module Analysis

### 1. Authentication Module
**Frontend Components:**
- `src/components/auth/` - AuthButton, AuthCard, AuthInput
- `src/context/AuthContext.jsx` - Global auth state
- `src/pages/Login.jsx`, `src/pages/Signup.jsx`, `src/pages/VerifyEmail.jsx`

**Backend Components:**
- `src/modules/auth/` - auth.controller, auth.service, auth.routes
- `src/middlewares/auth.middleware.js` - JWT verification
- `src/models/User.js` - User schema

**Relationships:** Auth flow connects to all protected routes and user-specific features.

### 2. Dashboard System
**Frontend Pages:**
- `src/pages/Dashboard.jsx` - Main dashboard
- `src/pages/dashboards/` - AdminDashboard, ClientDashboard, SupportDashboard
- `src/components/dashboard/` - DashboardLayout, DashboardSidebar, StatCard

**Backend APIs:**
- `src/modules/admin/admin.controller.js` - Admin statistics
- Various service endpoints for dashboard data

**Relationships:** Central hub connecting to all business modules (tickets, billing, leads).

### 3. Ticket System
**Frontend Components:**
- `src/pages/TicketsList.jsx`, `src/pages/CreateTicket.jsx`, `src/pages/TicketDetail.jsx`
- `src/components/tickets/` - TicketCard, MessageThread, TicketStatusBadge

**Backend Components:**
- `src/modules/tickets/` - Complete ticket management
- Models: Ticket, TicketMessage, TicketActivity, Department
- Services: ticket.service, predefinedReply.service

**Relationships:** Integrates with user management, notifications, and admin panels.

### 4. Billing & Payment System
**Frontend Pages:**
- `src/pages/billing/` - BillingDashboard, Checkout, InvoicesList
- `src/components/marketplace/Marketplace.jsx`

**Backend Components:**
- `src/modules/billing/` - Complete billing system
- Models: Invoice, Order, Payment, Product, Service
- Services: billing.service, payment.service, razorpay.service

**Relationships:** Connects to user accounts, admin management, and external payment APIs.

### 5. Lead Management
**Frontend Pages:**
- `src/pages/leads/LeadDashboard.jsx`, `src/pages/leads/LeadManagement.jsx`

**Backend Components:**
- `src/modules/leads/` - lead.controller, lead.service, lead.routes
- Model: Lead.js

**Relationships:** Integrates with admin dashboard and notification system.

### 6. Knowledge Base
**Frontend Pages:**
- `src/pages/Knowledgebase.jsx`, `src/pages/KnowledgebaseArticle.jsx`
- `src/pages/admin/KnowledgebaseManagement.jsx`

**Backend Components:**
- `src/modules/knowledgebase/` - kb.controller, kb.routes
- Models: KnowledgebaseArticle, KnowledgebaseCategory

**Relationships:** Connected to admin panel and public-facing pages.

### 7. User Management
**Frontend Pages:**
- `src/pages/admin/UserManagement.jsx`, `src/pages/admin/StaffManagement.jsx`
- `src/pages/Settings.jsx` - User profile settings

**Backend Components:**
- `src/modules/user/` - user.controller, user.service
- Model: User.js (extends base user)

**Relationships:** Core module connected to authentication, tickets, billing.

### 8. Domain & Server Management
**Frontend Pages:**
- `src/pages/admin/DomainManagement.jsx`, `src/pages/admin/ServerManagement.jsx`

**Backend Components:**
- `src/modules/domains/` - Domain management
- `src/modules/servers/` - Server management
- Models: Domain, Server, ServerGroup

**Relationships:** Admin-only features connected to billing and user services.

## Data Flow Patterns

### 1. Authentication Flow
```
Login → AuthContext → ProtectedRoute → Component → API Call → Backend Auth Middleware
```

### 2. Ticket Creation Flow
```
CreateTicket → TicketService → Backend API → TicketController → Database → Notification
```

### 3. Payment Flow
```
Checkout → Razorpay Service → Payment Gateway → Webhook → Order Creation → User Update
```

## Component Dependencies

### High-Level Dependencies
- All pages depend on AuthContext for authentication
- Dashboard components depend on multiple service modules
- Admin pages have additional role-based dependencies

### Shared Components
- `DashboardLayout` - Used by all dashboard variants
- `StatCard` - Reused across admin and client dashboards
- `Modal` - Generic modal component used throughout
- `StatusBadge` - Used for tickets, orders, and lead status

## API Architecture

### Route Structure
```
/api/auth/*      - Authentication endpoints
/api/admin/*    - Admin management
/api/billing/*  - Payment and invoices
/api/tickets/*  - Ticket system
/api/leads/*    - Lead management
/api/kb/*       - Knowledge base
/api/user/*     - User management
```

### Middleware Stack
1. `auth.middleware.js` - JWT verification
2. `role.middleware.js` - Role-based access
3. `validate.middleware.js` - Input validation
4. `sanitize.middleware.js` - Data sanitization
5. `rateLimit.middleware.js` - Rate limiting

## Database Schema Relationships

### Core Models
- **User** → Central to all modules (tickets, billing, leads)
- **Ticket** → Belongs to User, Department
- **Invoice** → Belongs to User, linked to Orders
- **Lead** → Assigned to staff, tracked through status updates

### Foreign Key Relationships
```
User (1:N) Ticket
User (1:N) Invoice  
User (1:N) Order
Department (1:N) Ticket
Staff (1:N) Lead
```

## Context Optimization Strategy

### 1. Module Grouping
- Group related files by functionality
- Create module-specific context summaries
- Use dependency graphs to understand relationships

### 2. Token Reduction Techniques
- Focus on high-level architecture over implementation details
- Use component summaries instead of full file contents
- Leverage existing documentation

### 3. Query Optimization
- Search by module name first
- Use file path patterns for targeted searches
- Cross-reference with dependency relationships

## Key Files for Quick Reference

### Configuration Files
- `webgenix-app/package.json` - Frontend dependencies
- `webgenix-backend/package.json` - Backend dependencies
- `webgenix-backend/src/config/db.js` - Database configuration

### Entry Points
- `webgenix-app/src/main.jsx` - Frontend entry
- `webgenix-backend/src/server.js` - Backend entry
- `webgenix-backend/src/app.js` - Express app setup

### Core Services
- `webgenix-app/src/services/api.js` - API client
- `webgenix-backend/src/services/audit.service.js` - Audit logging
- `webgenix-backend/src/modules/auth/auth.service.js` - Authentication logic

## Development Patterns

### Frontend Patterns
- Component composition with shared UI elements
- Context-based state management
- Protected route wrappers
- Service layer for API calls

### Backend Patterns
- Modular MVC architecture
- Middleware chain for cross-cutting concerns
- Service layer for business logic
- Model layer for data access

## Security Considerations

### Authentication Security
- JWT tokens with expiration
- Role-based access control
- Input validation and sanitization
- Rate limiting on sensitive endpoints

### Data Security
- Audit logging for admin actions
- Secure payment processing
- User data isolation
- Session management

## Performance Optimizations

### Frontend Optimizations
- Lazy loading for routes
- Debounced search inputs
- Skeleton loading states
- Component memoization where needed

### Backend Optimizations
- Database indexing
- Pagination for large datasets
- Caching strategies
- Efficient query patterns

This knowledge graph provides a comprehensive overview of the WebGenix project structure, enabling efficient navigation and context-aware development assistance.