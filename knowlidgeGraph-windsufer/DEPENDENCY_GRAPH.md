# WebGenix Dependency Graph & Component Relationships

## Module Dependency Overview

```mermaid
graph TD
    A[AuthContext] --> B[ProtectedRoute]
    B --> C[All Protected Pages]
    A --> D[Auth Service]
    D --> E[Auth Controller]
    E --> F[Auth Middleware]
    
    G[Dashboard Layout] --> H[Dashboard Sidebar]
    G --> I[Dashboard Header]
    H --> J[Navigation Items]
    I --> K[User Profile]
    
    L[Ticket Service] --> M[Ticket Controller]
    M --> N[Ticket Models]
    L --> O[Ticket Components]
    
    P[Billing Service] --> Q[Payment Controller]
    Q --> R[Razorpay Service]
    P --> S[Invoice Models]
    
    T[Admin Dashboard] --> U[User Management]
    T --> V[Ticket Management]
    T --> W[Billing Management]
    T --> X[Lead Management]
```

## Frontend Component Dependencies

### Authentication Flow
```mermaid
graph LR
    A[Login Page] --> B[AuthContext]
    B --> C[Auth Service]
    C --> D[Backend API]
    D --> E[JWT Token]
    E --> F[ProtectedRoute]
    F --> G[Dashboard Pages]
```

### Dashboard Architecture
```mermaid
graph TB
    A[Dashboard Layout] --> B[Dashboard Sidebar]
    A --> C[Dashboard Header]
    A --> D[Main Content Area]
    
    B --> E[Navigation Items]
    B --> F[User Menu]
    
    C --> G[Search Bar]
    C --> H[Notifications]
    C --> I[User Profile]
    
    D --> J[Stat Cards]
    D --> K[Data Tables]
    D --> L[Charts]
```

### Ticket System Dependencies
```mermaid
graph TD
    A[TicketsList] --> B[TicketCard]
    A --> C[FilterBar]
    
    B --> D[TicketStatusBadge]
    B --> E[TicketPriorityBadge]
    
    F[TicketDetail] --> G[MessageThread]
    F --> H[MessageInput]
    F --> I[TicketDetailModal]
    
    G --> J[TicketMessage]
    H --> K[Ticket Service]
    K --> L[Backend API]
```

## Backend Module Dependencies

### Core Authentication Flow
```mermaid
graph LR
    A[Auth Controller] --> B[Auth Service]
    B --> C[User Model]
    B --> D[JWT Service]
    A --> E[Auth Middleware]
    E --> F[Protected Routes]
```

### Ticket System Architecture
```mermaid
graph TB
    A[Ticket Controller] --> B[Ticket Service]
    B --> C[Ticket Model]
    B --> D[TicketMessage Model]
    B --> E[TicketActivity Model]
    B --> F[Department Model]
    
    A --> G[Ticket Validation]
    A --> H[Ticket Permissions]
    
    I[PredefinedReply Service] --> J[PredefinedReply Model]
    B --> I
```

### Billing System Dependencies
```mermaid
graph TD
    A[Billing Controller] --> B[Billing Service]
    B --> C[Invoice Model]
    B --> D[Order Model]
    B --> E[Payment Model]
    B --> F[Product Model]
    B --> G[Service Model]
    
    H[Payment Controller] --> I[Payment Service]
    I --> J[Razorpay Service]
    I --> E
    
    K[Product Service] --> F
    K --> G
```

## Cross-Module Relationships

### User-Centric Dependencies
```mermaid
graph LR
    A[User Model] --> B[Ticket Model]
    A --> C[Invoice Model]
    A --> D[Order Model]
    A --> E[Lead Model]
    A --> F[Session Model]
    A --> G[AuditLog Model]
```

### Admin System Dependencies
```mermaid
graph TB
    A[Admin Dashboard] --> B[User Management]
    A --> C[Ticket Management]
    A --> D[Billing Management]
    A --> E[Lead Management]
    A --> F[System Settings]
    
    B --> G[User Controller]
    C --> H[Ticket Controller]
    D --> I[Billing Controller]
    E --> J[Lead Controller]
    F --> K[Settings Controller]
```

## Data Flow Patterns

### Authentication Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Component
    participant AC as AuthContext
    participant AS as Auth Service
    participant BC as Backend Controller
    participant DB as Database
    
    U->>L: Submit Login
    L->>AC: Set Auth State
    AC->>AS: Login Request
    AS->>BC: API Call
    BC->>DB: Verify User
    DB-->>BC: User Data
    BC-->>AS: JWT Token
    AS-->>AC: Authentication Success
    AC-->>L: Update UI
```

### Ticket Creation Flow
```mermaid
sequenceDiagram
    participant U as User
    participant TC as Ticket Component
    participant TS as Ticket Service
    participant BC as Backend Controller
    participant DB as Database
    
    U->>TC: Create Ticket
    TC->>TS: Submit Ticket Data
    TS->>BC: API Call
    BC->>DB: Save Ticket
    DB-->>BC: Ticket ID
    BC-->>TS: Ticket Created
    TS-->>TC: Update UI
    TC-->>U: Show Confirmation
```

### Payment Processing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Checkout Component
    participant PS as Payment Service
    participant RP as Razorpay
    participant WH as Webhook Handler
    participant DB as Database
    
    U->>C: Initiate Payment
    C->>PS: Create Order
    PS->>RP: Generate Payment Link
    RP-->>PS: Payment ID
    PS-->>C: Show Payment Form
    C->>U: Display Razorpay
    U->>RP: Complete Payment
    RP->>WH: Webhook Notification
    WH->>DB: Update Order Status
    WH->>PS: Notify Success
    PS-->>C: Update UI
```

## Component Hierarchy

### Frontend Component Tree
```
App.jsx
├── Navbar.jsx
├── Routes
│   ├── Public Routes
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Knowledgebase.jsx
│   └── Protected Routes (ProtectedRoute.jsx)
│       ├── Dashboard.jsx
│       │   ├── DashboardLayout.jsx
│       │   │   ├── DashboardSidebar.jsx
│       │   │   ├── DashboardHeader.jsx
│       │   │   └── Main Content
│       │   │       ├── StatCard.jsx
│       │   │       ├── DataTable.jsx
│       │   │       └── FilterBar.jsx
│       │   └── Role-Specific Dashboards
│       │       ├── AdminDashboard.jsx
│       │       ├── ClientDashboard.jsx
│       │       └── SupportDashboard.jsx
│       ├── TicketsList.jsx
│       │   ├── TicketCard.jsx
│       │   ├── FilterBar.jsx
│       │   └── EmptyState.jsx
│       ├── TicketDetail.jsx
│       │   ├── MessageThread.jsx
│       │   ├── MessageInput.jsx
│       │   └── TicketDetailModal.jsx
│       ├── Billing Pages
│       │   ├── BillingDashboard.jsx
│       │   ├── Checkout.jsx
│       │   ├── InvoicesList.jsx
│       │   └── OrdersList.jsx
│       └── Admin Pages
│           ├── UserManagement.jsx
│           ├── AdminTicketList.jsx
│           ├── LeadManagement.jsx
│           └── Settings.jsx
├── Footer.jsx
└── ErrorBoundary.jsx
```

### Backend Module Tree
```
server.js
├── app.js
├── Middleware Stack
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   ├── sanitize.middleware.js
│   ├── rateLimit.middleware.js
│   └── error.middleware.js
├── Routes
│   ├── /api/auth
│   │   ├── auth.routes.js
│   │   ├── auth.controller.js
│   │   └── auth.service.js
│   ├── /api/tickets
│   │   ├── ticket.routes.js
│   │   ├── ticket.controller.js
│   │   ├── ticket.service.js
│   │   └── Models (Ticket, TicketMessage, etc.)
│   ├── /api/billing
│   │   ├── billing.routes.js
│   │   ├── billing.controller.js
│   │   ├── billing.service.js
│   │   ├── payment.routes.js
│   │   ├── payment.controller.js
│   │   └── Models (Invoice, Order, Payment, etc.)
│   ├── /api/admin
│   │   ├── admin.routes.js
│   │   ├── admin.controller.js
│   │   └── Models (SystemSetting)
│   ├── /api/leads
│   │   ├── lead.routes.js
│   │   ├── lead.controller.js
│   │   ├── lead.service.js
│   │   └── Model (Lead)
│   ├── /api/user
│   │   ├── user.routes.js
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   └── Model (User)
│   └── /api/kb
│       ├── kb.routes.js
│       ├── kb.controller.js
│       └── Models (KnowledgebaseArticle, Category)
├── Core Models
│   ├── User.js
│   ├── Session.js
│   ├── AuditLog.js
│   └── AuthToken.js
└── Services
    ├── audit.service.js
    └── cron.service.js
```

## Import/Export Relationships

### Frontend Service Dependencies
```mermaid
graph LR
    A[api.js] --> B[auth.service.js]
    A --> C[ticket.service.js]
    A --> D[billing.service.js]
    A --> E[admin.service.js]
    A --> F[lead.service.js]
    A --> G[support.service.js]
    A --> H[kb.service.js]
    
    B --> I[AuthContext]
    C --> J[Ticket Components]
    D --> K[Billing Components]
    E --> L[Admin Components]
```

### Backend Service Dependencies
```mermaid
graph TB
    A[auth.service.js] --> B[User Model]
    A --> C[JWT Utils]
    
    D[ticket.service.js] --> E[Ticket Model]
    D --> F[TicketMessage Model]
    D --> G[Department Model]
    
    H[billing.service.js] --> I[Invoice Model]
    H --> J[Order Model]
    H --> K[Payment Model]
    H --> L[Razorpay Service]
    
    M[lead.service.js] --> N[Lead Model]
    M --> O[User Model]
```

## State Management Flow

### Context Provider Dependencies
```mermaid
graph TD
    A[App.jsx] --> B[AuthContext Provider]
    A --> C[CartContext Provider]
    
    B --> D[Auth State]
    B --> E[Login/Logout Functions]
    
    C --> F[Cart State]
    C --> G[Cart Operations]
    
    H[Protected Components] --> B
    I[Billing Components] --> C
    J[User Components] --> B
```

## API Endpoint Relationships

### RESTful API Structure
```mermaid
graph TB
    A[/api/auth] --> B[POST /login]
    A --> C[POST /register]
    A --> D[POST /logout]
    A --> E[GET /profile]
    
    F[/api/tickets] --> G[GET /]
    F --> H[POST /]
    F --> I[GET /:id]
    F --> J[PUT /:id]
    F --> K[POST /:id/messages]
    
    L[/api/billing] --> M[GET /invoices]
    L --> N[GET /orders]
    L --> O[POST /checkout]
    L --> P[GET /services]
    
    Q[/api/admin] --> R[GET /stats]
    Q --> S[GET /users]
    Q --> T[PUT /users/:id]
```

## Error Handling Dependencies

### Error Propagation Flow
```mermaid
graph LR
    A[Component Error] --> B[ErrorBoundary]
    B --> C[Error Logging]
    C --> D[Audit Service]
    D --> E[Database]
    
    F[API Error] --> G[Error Middleware]
    G --> H[Error Response]
    G --> I[Audit Logging]
```

This dependency graph provides a comprehensive view of how components and modules interact throughout the WebGenix application, enabling efficient navigation and understanding of system relationships.