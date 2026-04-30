export const BILLING_CYCLE = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    SEMI_ANNUAL: 'semi_annual',
    ANNUAL: 'annual',
    BIENNIAL: 'biennial'
};

export const BILLING_CYCLE_MONTHS = {
    [BILLING_CYCLE.MONTHLY]: 1,
    [BILLING_CYCLE.QUARTERLY]: 3,
    [BILLING_CYCLE.SEMI_ANNUAL]: 6,
    [BILLING_CYCLE.ANNUAL]: 12,
    [BILLING_CYCLE.BIENNIAL]: 24
};

export const PRODUCT_TYPE = {
    HOSTING: 'hosting',
    DOMAIN: 'domain',
    SSL: 'ssl',
    ADDON: 'addon',
    SERVICE: 'service'
};

export const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived'
};

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FRAUD: 'fraud',
    REFUNDED: 'refunded'
};

export const INVOICE_STATUS = {
    DRAFT: 'draft',
    UNPAID: 'unpaid',
    PAID: 'paid',
    PARTIAL: 'partial',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed'
};

export const PAYMENT_GATEWAY = {
    RAZORPAY: 'razorpay',
    PAYPAL: 'paypal',
    STRIPE: 'stripe',
    OFFLINE: 'offline'
};

export const INVOICE_TYPE = {
    NEW: 'new',
    RECURRING: 'recurring',
    UPGRADE: 'upgrade',
    RENEWAL: 'renewal',
    REFUND: 'refund',
    CREDIT: 'credit'
};

export const DOMAIN_REGISTRATION_YEARS = [1, 2, 3, 5, 10];

export const PRORATION_BILLING = {
    DAILY: 'daily',
    MONTHLY: 'monthly',
    NONE: 'none'
};