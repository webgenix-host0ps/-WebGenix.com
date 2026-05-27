# Product Listing Workflow

## Home Page Services Section

### File
- **Component**: `webgenix-app/src/pages/Home.jsx` — `ServicesSection` (lines 135-213)
- **Data**: `webgenix-app/src/data/services.js` — exports `servicesSection` and `serviceCatalog`

### Data Flow (HARD-CODED)

```
src/data/services.js
  └── exports servicesSection (static JS object)
        └── imported by Home.jsx (line 2)
              └── ServicesSection renders via ServiceCard
                    └── Tab-based UI: Business Solutions | Infrastructure | Domains, Email & Security
```

### Structure of `servicesSection`

```
servicesSection
 ├── title, subtitle, layout, defaultTab
 └── tabs[]
      ├── id: "packages" → 4 cards (LaunchPad, Growth Engine, Ecom Power Stack, DevOps as a Service)
      ├── id: "infrastructure" → 4 cards (Shared Hosting, VPS, Dedicated, Backup)
      └── id: "addons" → 3 cards (Domain Registration, Business Email, SSL Certificates)
```

### Key Points
- **NO API calls** — data is purely static JavaScript
- Each card rendered via `<ServiceCard>` with props: `name`, `tagline`, `price`, `features`, `cta`, `badge`
- The file also contains `serviceCatalog` (630 lines) with full pricing tiers — **not used by any component**
- To update services: edit `src/data/services.js` directly

---

## Client Marketplace Page

### Files
- **Page**: `webgenix-app/src/pages/MarketplacePage.jsx` — wrapper (11 lines)
- **Component**: `webgenix-app/src/components/marketplace/Marketplace.jsx` — full listing (337 lines)
- **Service**: `webgenix-app/src/services/billing.service.js` — API calls

### Data Flow (FULLY DYNAMIC)

```
[Client Browser]
  │
  ├── Marketplace.jsx mount
  │     └── useEffect → fetchProducts()
  │           └── billingService.getProducts(filters)
  │                 └── api.get('/billing/products', { params })
  │                       │
  │                       ▼
  │                 [Backend: 5000/api]
  │                       │
  │                 billing.routes.js
  │                 GET /products → billingController.listProducts
  │                       │
  │                 product.service.js
  │                 listProducts(filters, pagination) → Product.find({ status: 'active' })
  │                       │
  │                 MongoDB Product collection
  │                       │
  │                 Returns JSON → Marketplace.jsx state
  │                       │
  │                 useMemo → categories derived from product data
  │                 Filters: search text, category pills, grid/list toggle
  │                 Add-to-cart → CartContext (localStorage persisted)
  │
  └── UI renders: search bar → category pills → product cards
```

### Backend Architecture

```
billing.routes.js
 ├── GET  /products              → listProducts (public)
 ├── GET  /products/featured     → getFeaturedProducts (public)
 ├── GET  /products/slug/:slug   → getProductBySlug (public)
 ├── GET  /products/categories   → getProductCategories (public)
 ├── GET  /products/:id          → getProduct (public)
 ├── POST /products              → createProduct (admin)
 ├── PATCH /products/:id         → updateProduct (admin)
 └── DELETE /products/:id        → deleteProduct (admin)
```

### Product Model (MongoDB)

```
Product
 ├── name, slug (unique), type (hosting/domain/ssl/addon/service)
 ├── description, category, icon, features[]
 ├── pricing[] → { cycle, price, setupFee, isDefault, isActive }
 ├── options[], featured (bool), status (active/inactive/archived)
 ├── order (int), parentProduct (for addons), taxEnabled
 └── timestamps
```

### Key Points
- **FULLY DYNAMIC** — queries MongoDB via REST API
- **No hard-coded product data** on the marketplace page
- Categories derived dynamically from product metadata via `useMemo`
- Supports search, category filtering, grid/list toggle
- Cart managed via `CartContext` persisted to `localStorage`
- Data seeded via `webgenix-backend/scripts/seedProducts.js` (20 products, 8 categories)

---

## Comparison

| Aspect | Home Page Services | Client Marketplace |
|--------|-------------------|-------------------|
| Data source | `src/data/services.js` (hard-coded) | MongoDB Product collection (API) |
| API calls | None | `GET /billing/products` |
| Managed via | Edit JS file | Admin panel or seed script |
| Cart support | No (CTA links to `#contact`) | Yes (CartContext + localStorage) |
| Search/Filter | No (tab-based only) | Yes (text search + category pills) |
| Pricing | Static display text | Multi-cycle pricing from DB |
