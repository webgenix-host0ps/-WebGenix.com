# WebGenix Context Optimization Guide

## AI Token Usage Optimization Strategy

### Overview
This guide provides strategies to reduce AI token consumption while maintaining comprehensive context awareness when working with the WebGenix project.

## Context Reduction Techniques

### 1. Module-Based Context Loading

#### Authentication Module (High Priority)
**Essential Files:**
- `webgenix-app/src/context/AuthContext.jsx` - Core auth state
- `webgenix-app/src/services/auth.service.js` - Auth API calls
- `webgenix-backend/src/modules/auth/auth.controller.js` - Auth logic
- `webgenix-backend/src/modules/auth/auth.service.js` - Auth business logic

**Context Summary:**
```
Authentication uses JWT tokens with role-based access control. AuthContext manages global state, auth.service handles API calls, and backend modules handle validation and token management.
```

#### Ticket System Module (High Priority)
**Essential Files:**
- `webgenix-app/src/pages/TicketDetail.jsx` - Main ticket interface
- `webgenix-app/src/components/tickets/TicketCard.jsx` - Ticket display
- `webgenix-app/src/services/ticket.service.js` - Ticket API
- `webgenix-backend/src/modules/tickets/ticket.controller.js` - Ticket operations

**Context Summary:**
```
Ticket system supports CRUD operations with department assignment, priority levels, and message threading. Uses real-time updates and status tracking.
```

#### Billing Module (Medium Priority)
**Essential Files:**
- `webgenix-app/src/pages/billing/BillingDashboard.jsx` - Billing overview
- `webgenix-app/src/services/billing.service.js` - Billing API
- `webgenix-backend/src/modules/billing/billing.controller.js` - Billing logic

**Context Summary:**
```
Billing system integrates with Razorpay for payments, manages invoices, orders, and service subscriptions. Supports multiple payment methods and automatic invoicing.
```

### 2. Component Grouping Strategy

#### Dashboard Components
**Group:** All dashboard-related files
**Key Files:**
- `webgenix-app/src/components/dashboard/DashboardLayout.jsx`
- `webgenix-app/src/components/dashboard/DashboardSidebar.jsx`
- `webgenix-app/src/components/dashboard/StatCard.jsx`

**Context Template:**
```
Dashboard uses modular layout with sidebar navigation, header with user profile, and stat cards for metrics. Supports role-based content display.
```

#### Admin Components
**Group:** All admin management files
**Key Files:**
- `webgenix-app/src/pages/admin/UserManagement.jsx`
- `webgenix-app/src/pages/admin/AdminTicketList.jsx`
- `webgenix-backend/src/modules/admin/admin.controller.js`

**Context Template:**
```
Admin panel provides user management, ticket oversight, billing administration, and system settings. Uses role-based permissions and audit logging.
```

### 3. API Endpoint Summaries

#### Authentication Endpoints
```
POST /api/auth/login - User authentication
POST /api/auth/register - User registration  
GET /api/auth/profile - Get user profile
POST /api/auth/logout - User logout
```

#### Ticket Endpoints
```
GET /api/tickets - List tickets with pagination
POST /api/tickets - Create new ticket
GET /api/tickets/:id - Get ticket details
PUT /api/tickets/:id - Update ticket
POST /api/tickets/:id/messages - Add message
```

#### Billing Endpoints
```
GET /api/billing/invoices - User invoices
POST /api/billing/checkout - Process payment
GET /api/billing/orders - Order history
GET /api/billing/services - Available services
```

## Search Optimization Patterns

### 1. Targeted File Searches

#### Authentication Issues
```
Search Pattern: "auth" + "login" + "token"
Priority Files:
- AuthContext.jsx
- auth.service.js  
- auth.controller.js
- auth.middleware.js
```

#### Ticket Problems
```
Search Pattern: "ticket" + "message" + "status"
Priority Files:
- TicketDetail.jsx
- ticket.service.js
- ticket.controller.js
- ticket.model.js
```

#### Billing Issues
```
Search Pattern: "payment" + "invoice" + "razorpay"
Priority Files:
- billing.service.js
- billing.controller.js
- payment.service.js
- razorpay.service.js
```

### 2. Role-Based Context Loading

#### Client Dashboard Context
```
Essential Components:
- ClientDashboard.jsx
- MyServices.jsx
- InvoicesList.jsx
- TicketsList.jsx

Context Focus: User-specific data, personal tickets, billing history
```

#### Admin Dashboard Context
```
Essential Components:
- AdminDashboard.jsx
- UserManagement.jsx
- AdminTicketList.jsx
- BillingDashboard.jsx

Context Focus: System oversight, user management, global statistics
```

#### Support Dashboard Context
```
Essential Components:
- SupportDashboard.jsx
- SupportTicketList.jsx
- TicketDetail.jsx

Context Focus: Ticket management, customer support, issue resolution
```

## Code Pattern Recognition

### 1. Common Component Patterns

#### Form Components
```
Pattern: AuthInput.jsx, MessageInput.jsx
Structure: Label + Input + Validation + Error handling
Usage: Replace with generic FormInput component
```

#### Modal Components
```
Pattern: ConfirmModal.jsx, InvoiceFormModal.jsx, TicketDetailModal.jsx
Structure: Overlay + Content + Actions + Close handler
Usage: Standardize modal interface
```

#### Badge Components
```
Pattern: StatusBadge.jsx, TicketPriorityBadge.jsx, TicketStatusBadge.jsx
Structure: Color-coded status indicators
Usage: Consolidate into unified Badge system
```

### 2. Service Layer Patterns

#### API Service Structure
```
Pattern: *.service.js files
Structure: Base API client + Endpoint methods + Error handling
Usage: Standardize service interface
```

#### Controller Patterns
```
Pattern: *.controller.js files
Structure: Request validation + Business logic + Response formatting
Usage: Consistent controller interface
```

## Database Schema Optimization

### 1. Core Model Relationships
```
User Model (Central)
├── Tickets (1:N)
├── Invoices (1:N)
├── Orders (1:N)
├── Sessions (1:N)
└── AuditLogs (1:N)

Ticket Model
├── Messages (1:N)
├── Activities (1:N)
└── Department (N:1)
```

### 2. Query Optimization Patterns
```
User Dashboard:
- Get user tickets (status: open)
- Get recent invoices (limit: 5)
- Get unread notifications

Admin Dashboard:
- Get system statistics
- Get recent tickets (all users)
- Get revenue summary

Support Dashboard:
- Get assigned tickets
- Get ticket priority distribution
- Get response time metrics
```

## Development Workflow Optimization

### 1. Feature Development Context

#### New Feature Template
```
1. Frontend Component (Pages/Components)
2. Service Layer (API calls)
3. Backend Controller (Business logic)
4. Backend Model (Data structure)
5. Routes (API endpoints)
6. Middleware (Validation/Authorization)
```

#### Bug Fix Template
```
1. Identify affected module
2. Load relevant components
3. Check API endpoints
4. Verify data flow
5. Test edge cases
```

### 2. Testing Strategy Context

#### Unit Testing Focus
```
Frontend: Component rendering, state management, API calls
Backend: Controller logic, service methods, model validation
Integration: API endpoints, database operations, authentication
```

#### E2E Testing Scenarios
```
User Journey: Login → Dashboard → Create Ticket → View Details
Admin Journey: Login → Admin Panel → Manage Users → View Stats
Payment Flow: Browse → Checkout → Payment → Confirmation
```

## Performance Optimization Context

### 1. Frontend Optimization
```
Component Memoization: React.memo for expensive renders
Lazy Loading: Routes and heavy components
State Management: Context optimization, reducer patterns
API Optimization: Request batching, caching strategies
```

### 2. Backend Optimization
```
Database Indexing: Query performance
Caching: Redis for frequent data
Pagination: Large dataset handling
Rate Limiting: API protection
```

## Security Context Summary

### 1. Authentication Security
```
JWT tokens with expiration
Role-based access control
Input validation and sanitization
Rate limiting on sensitive endpoints
```

### 2. Data Security
```
Audit logging for admin actions
Secure payment processing
User data isolation
Session management
```

## Quick Reference Commands

### 1. Find Related Files
```bash
# Find all auth-related files
find . -name "*auth*" -type f

# Find ticket components
find . -path "*/tickets/*" -name "*.jsx"

# Find billing services
find . -path "*/billing/*" -name "*.js"
```

### 2. Search Patterns
```bash
# Search for authentication logic
grep -r "authenticate\|login\|jwt" --include="*.js" --include="*.jsx"

# Search for ticket operations
grep -r "ticket\|message\|department" --include="*.js" --include="*.jsx"

# Search for payment processing
grep -r "payment\|invoice\|razorpay" --include="*.js" --include="*.jsx"
```

## Context Loading Priorities

### High Priority (Always Load)
1. AuthContext.jsx - Authentication state
2. api.js - Base API configuration
3. main.jsx - Application entry point
4. App.jsx - Main application component

### Medium Priority (Load as Needed)
1. Module-specific components
2. Service layer files
3. Backend controllers
4. Model definitions

### Low Priority (Load on Demand)
1. Configuration files
2. Utility functions
3. Test files
4. Documentation

This optimization guide enables efficient AI assistance by providing structured context loading strategies for the WebGenix project.