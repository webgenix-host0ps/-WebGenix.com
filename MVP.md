# WebGenix MVP - Minimum Viable Product Features

> **MVP Definition**: Core features required to launch and operate a hosting business management platform  
> **Derived from**: remaningFeatures.md  
> **Last Updated**: May 2, 2026

---

## MVP Philosophy

An MVP for a WHMCS-like hosting management system must include:
1. **Domain Management** - Essential for domain sales
2. **Server Provisioning** - Automated account creation
3. **Tax Compliance** - Legal requirement (GST for India)
4. **Communication** - Professional email templates
5. **Self-Service** - Knowledgebase for support deflection
6. **File Support** - Ticket attachments for troubleshooting

---

## MVP Feature List

### 1. Domain Management System (CRITICAL)

**Why MVP**: Cannot sell hosting without domain management. This is core to the business model.

#### 1.1 Domain Registrar Integration
| Feature | Priority | Notes |
|---------|----------|-------|
| ResellerClub/LogicBoxes API | Critical | Primary India registrar |
| Domain Availability Check | Critical | Real-time domain search |
| Domain Registration | Critical | New domain orders |
| Domain Transfer | Critical | Inbound transfers with EPP code |
| EPP Code Retrieval | Critical | Required for transfers |

#### 1.2 Domain Lifecycle
| Feature | Priority | Notes |
|---------|----------|-------|
| WHOIS Lookup Tool | High | Public availability checker |
| Grace Period Management | High | Redemption period handling |
| Domain Sync | Medium | Sync expiry dates with registrar |
| ID Protection (WHOIS Privacy) | Medium | Upsell opportunity |
| Domain Lock/Unlock | Medium | Transfer protection |

**Models Required**:
```javascript
- Domain.js              // Domain records with lifecycle tracking
- DomainRegistrar.js   // API credentials & settings
- TldPricing.js        // TLD-specific pricing tiers
- WhoisCache.js        // WHOIS lookup cache
```

**API Endpoints Required**:
- `GET /domains/check-availability` - Real-time availability
- `POST /domains/register` - Register new domain
- `POST /domains/transfer` - Initiate transfer
- `GET /domains/:id/epp-code` - Get transfer code
- `POST /domains/:id/renew` - Renew domain
- `GET /domains/:id/whois` - WHOIS lookup

**Frontend Pages**:
- Domain search/registration page
- Domain management in client area
- Admin domain list/management

**Est. Effort**: 3-4 weeks

---

### 2. Server Provisioning - cPanel Module (CRITICAL)

**Why MVP**: Manual account creation is not scalable. Automation is required from day one.

#### 2.1 cPanel/WHM Integration
| Feature | Priority | Notes |
|---------|----------|-------|
| cPanel Account Creation | Critical | Auto-create on payment |
| Package Management | Critical | Map products to cPanel packages |
| Suspension/Unsuspension | Critical | Sync billing status |
| Termination | High | Delete account on cancellation |
| Password Resets | High | Client self-service |

#### 2.2 Server Management
| Feature | Priority | Notes |
|---------|----------|-------|
| Server Configuration | Critical | WHM API credentials |
| Server Group Assignment | High | Distribute load |
| Account Status Sync | High | Keep WHM and WebGenix in sync |
| Usage Statistics | Medium | Disk, bandwidth from cPanel |

**Models Required**:
```javascript
- Server.js            // WHM server configuration
- ServerGroup.js       // Group multiple servers
- HostingAccount.js    // Link to cPanel accounts
- ModuleLog.js         // Provisioning success/failure logs
```

**Service Methods**:
- `createAccount(serviceId)` - Create cPanel account
- `suspendAccount(serviceId)` - Suspend for non-payment
- `unsuspendAccount(serviceId)` - Restore service
- `terminateAccount(serviceId)` - Delete account
- `syncUsage(serviceId)` - Get disk/bandwidth stats

**Integration Points**:
- Hook into `billing.service.js` on payment completion
- Cron job for usage sync
- WHM API v2 (JSON-API)

**Est. Effort**: 2-3 weeks

---

### 3. India GST Tax Management (CRITICAL)

**Why MVP**: Legal requirement for Indian businesses. Cannot operate without proper GST compliance.

#### 3.1 GST Calculation Engine
| Feature | Priority | Notes |
|---------|----------|-------|
| CGST/SGST/IGST Calculation | Critical | Interstate vs intrastate |
| GSTIN Validation | Critical | Verify customer GST numbers |
| HSN Code Support | Critical | Product classification |
| Tax Inclusive/Exclusive Display | High | Show prices correctly |
| Reverse Charge Mechanism | Medium | B2B handling |

#### 3.2 GST Reporting
| Feature | Priority | Notes |
|---------|----------|-------|
| GSTR-1 Report Generation | Critical | Outward supplies |
| GSTR-3B Summary | Critical | Monthly return |
| Invoice GST Breakdown | Critical | Show tax components |
| GST Audit Trail | High | Track all tax calculations |

**Models Required**:
```javascript
- TaxRule.js           // CGST/SGST/IGST rules by state
- TaxRate.js           // Rate configurations (5%, 12%, 18%, 28%)
- GstReport.js         // Filing data aggregation
- TaxExemption.js      // SEZ, export exemptions
```

**Calculation Logic**:
```
If (sellerState === buyerState):
  CGST = amount × (rate/2) / 100
  SGST = amount × (rate/2) / 100
Else:
  IGST = amount × rate / 100
```

**Integration Points**:
- Modify `Invoice.js` to store tax breakdown
- Update checkout to show GST separately
- Add GST fields to user profile (GSTIN)

**Est. Effort**: 2 weeks

---

### 4. Email Template Management (HIGH)

**Why MVP**: Hardcoded emails look unprofessional. Must have customizable templates for credibility.

#### 4.1 Template System
| Feature | Priority | Notes |
|---------|----------|-------|
| Template Editor (HTML) | High | WYSIWYG or CodeMirror |
| Merge Fields System | High | {{client.name}}, {{invoice.total}} |
| Template Categories | Medium | Organize by type |
| Template Preview | Medium | Test with sample data |

#### 4.2 Required Templates
| Template | Priority | Trigger |
|----------|----------|---------|
| Welcome Email (Hosting) | High | After hosting account creation |
| Domain Registration | High | After domain registration |
| Invoice Created | High | New invoice generated |
| Invoice Payment Reminder | High | 3 days before due |
| Invoice Overdue Notice | High | Day after due date |
| Payment Confirmation | High | Successful payment |
| Service Suspension | High | Account suspended |
| Password Reset | ✅ Exists | Already implemented |
| Ticket Reply | ✅ Exists | Already implemented |

**Models Required**:
```javascript
- EmailTemplate.js     // Template storage with HTML content
- EmailLog.js          // Sent email history for tracking
```

**Template Variables**:
```
{{company.name}} {{company.email}} {{company.phone}}
{{client.name}} {{client.email}} {{client.gstin}}
{{invoice.number}} {{invoice.total}} {{invoice.due_date}}
{{order.number}} {{order.items}}
{{service.name}} {{service.username}} {{service.password}}
{{domain.name}} {{domain.expiry_date}}
{{ticket.number}} {{ticket.subject}}
{{payment.amount}} {{payment.method}} {{payment.date}}
```

**Admin Interface**:
- Template list with categories
- HTML editor with variable insertion
- Preview with test data
- Test send functionality

**Est. Effort**: 1-2 weeks

---

### 5. Knowledgebase System (HIGH)

**Why MVP**: Reduces support ticket volume. Essential for scaling without linear support staff growth.

#### 5.1 Article Management
| Feature | Priority | Notes |
|---------|----------|-------|
| Article CRUD | High | Create, edit, delete articles |
| Category Management | High | Organize by topic |
| Article Search | High | Full-text search |
| Public/Private Articles | Medium | Internal vs customer-facing |
| Article View Count | Low | Popular articles analytics |

#### 5.2 Client Features
| Feature | Priority | Notes |
|---------|----------|-------|
| Category Browse | High | Browse by topic |
| Search Suggestions | Medium | Auto-complete search |
| Related Articles | Medium | "You might also like" |
| SEO-friendly URLs | Low | /kb/category/article-name |

**Models Required**:
```javascript
- KnowledgebaseCategory.js  // Hierarchical categories
- KnowledgebaseArticle.js   // Article content with HTML
- ArticleView.js           // Analytics tracking
```

**Frontend Pages**:
- KB homepage (categories grid)
- Category listing
- Article detail page
- Search results

**Admin Interface**:
- Category management
- Article editor (rich text)
- Article ordering within categories

**Est. Effort**: 1-2 weeks

---

### 6. Ticket Attachments (MEDIUM)

**Why MVP**: Clients need to share screenshots, logs, documents for effective troubleshooting.

#### 6.1 File Upload
| Feature | Priority | Notes |
|---------|----------|-------|
| Client Upload | High | Attach to new ticket or reply |
| File Type Validation | High | Allow images, PDFs, logs |
| File Size Limits | Medium | Configurable max size |
| Secure Storage | High | Private file storage |
| Virus Scanning | Low | Optional security layer |

#### 6.2 File Management
| Feature | Priority | Notes |
|---------|----------|-------|
| Attachment Display | High | Show in message thread |
| Download Links | High | Secure tokenized URLs |
| Attachment List | Medium | View all files per ticket |
| Admin Delete | Low | Remove inappropriate content |

**Storage Options**:
- Local filesystem (encrypted path)
- Cloud storage (AWS S3, Cloudflare R2)
- Max file size: 10MB default

**Security**:
- Randomized filenames (UUID)
- Serve through authenticated endpoint
- Scan file types (magic bytes)

**Models Update**:
```javascript
// Add to TicketMessage.js:
attachments: [{
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  path: String, // storage path
  uploadedAt: Date
}]
```

**Est. Effort**: 3-5 days

---

### 7. Webhook System (MEDIUM)

**Why MVP**: Required for integrations (Zapier, Slack, custom apps). Modern platforms need webhook support.

#### 7.1 Webhook Management
| Feature | Priority | Notes |
|---------|----------|-------|
| Webhook Registration | High | Create endpoints |
| Event Selection | High | Choose which events to send |
| Secret/Signature | High | HMAC verification |
| Retry Logic | Medium | Exponential backoff |
| Delivery Log | Medium | Track success/failure |
| Test Payload | Low | Test webhook endpoint |

#### 7.2 Events to Support
| Event | Priority | Notes |
|-------|----------|-------|
| `invoice.created` | High | New invoice |
| `invoice.paid` | High | Payment received |
| `invoice.overdue` | Medium | Past due date |
| `order.created` | High | New order |
| `order.completed` | High | Order fulfilled |
| `service.created` | Medium | New service provisioned |
| `service.suspended` | Medium | Service suspended |
| `ticket.created` | Medium | New support ticket |
| `ticket.replied` | Low | New reply |
| `client.registered` | Low | New signup |

**Models Required**:
```javascript
- Webhook.js           // Endpoint configuration
- WebhookDelivery.js   // Delivery attempt logs
- WebhookEvent.js      // Event queue
```

**Implementation**:
- Event queue (Redis/Bull)
- Async delivery
- HMAC-SHA256 signature
- JSON payload

**Est. Effort**: 1 week

---

## MVP Implementation Order

### Sprint 1: Foundation (Weeks 1-2)
1. **Tax Management (GST)** - 1 week
   - Tax calculation engine
   - GST invoice formatting
   - GSTR reports

2. **Ticket Attachments** - 3-5 days
   - File upload
   - Secure storage
   - Display in UI

### Sprint 2: Core Business (Weeks 3-5)
3. **Email Templates** - 1 week
   - Template model & editor
   - Replace hardcoded emails
   - All required templates

4. **cPanel Provisioning** - 2 weeks
   - WHM API integration
   - Account lifecycle
   - Auto-provisioning hooks

### Sprint 3: Growth (Weeks 6-8)
5. **Domain Management** - 3 weeks
   - ResellerClub API
   - Availability checker
   - Registration/transfer
   - Client domain UI

6. **Knowledgebase** - 1 week
   - Article system
   - Categories
   - Search

### Sprint 4: Integration (Week 9)
7. **Webhook System** - 1 week
   - Event system
   - Delivery mechanism
   - Admin UI

**Total MVP Timeline**: 9 weeks (2 months)

---

## What is NOT in MVP (Post-MVP)

These features are important but not required for initial launch:

| Feature | Reason |
|---------|--------|
| Affiliate System | Can add after initial traction |
| Multi-language | Start with English only |
| Advanced Reports | Basic reporting is sufficient |
| Announcements | Can use email initially |
| Network Status | Manual status updates work initially |
| Live Chat | Third-party widgets can bridge gap |
| Project Management | Not core to hosting business |
| App Installer | Softaculous integration post-MVP |
| Fraud Protection | Manual review initially |
| Multi-currency | INR focus initially |
| Plesk/DirectAdmin | cPanel covers 80% market |
| Advanced Server Monitoring | Basic WHM sync sufficient |

---

## MVP Success Criteria

A successful MVP should allow:

✅ **Domain Registration**: Customer can search, register, and manage domains  
✅ **Hosting Provisioning**: Automatic cPanel account creation on payment  
✅ **GST Compliance**: Proper tax calculation and invoice formatting  
✅ **Professional Communication**: Custom-branded email templates  
✅ **Self-Service Support**: Knowledgebase deflects common questions  
✅ **File Sharing**: Clients can attach files to support tickets  
✅ **Integration Ready**: Webhooks allow third-party integrations  

---

## Architecture Notes

### New Database Collections
```
domains
domain_registrars
tld_pricing
whois_cache
servers
server_groups
hosting_accounts
module_logs
tax_rules
tax_rates
gst_reports
email_templates
email_logs
knowledgebase_categories
knowledgebase_articles
webhooks
webhook_deliveries
```

### New API Routes
```
POST   /api/domains/check
POST   /api/domains/register
POST   /api/domains/transfer
GET    /api/domains/:id/epp-code

POST   /api/servers/:id/accounts
POST   /api/services/:id/provision
POST   /api/services/:id/suspend

GET    /api/tax/calculate
GET    /api/reports/gstr-1
GET    /api/reports/gstr-3b

GET    /api/kb/categories
GET    /api/kb/articles
GET    /api/kb/search

POST   /api/admin/email-templates
GET    /api/admin/email-templates

POST   /api/admin/webhooks
GET    /api/admin/webhooks/:id/deliveries
```

### New Frontend Routes
```
/client/domains              // Domain management
/client/domains/register     // Domain search/register
/kb                          // Knowledgebase
/kb/:category/:article       // Article
/admin/domains               // Admin domain list
/admin/servers               // Server management
/admin/email-templates       // Template editor
/admin/tax-settings          // Tax configuration
/admin/kb                    // KB management
/admin/webhooks              // Webhook configuration
```

---

## Summary

**7 MVP Features** | **9 Weeks Timeline** | **Critical for Launch**

1. Domain Management - Sell and manage domains
2. cPanel Provisioning - Automated hosting accounts
3. GST Tax System - Legal compliance
4. Email Templates - Professional communication
5. Knowledgebase - Self-service support
6. Ticket Attachments - Effective troubleshooting
7. Webhooks - Integration capability

These features transform WebGenix from a billing/ticket system into a complete hosting management platform ready for production use.
