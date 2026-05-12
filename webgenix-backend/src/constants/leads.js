export const LEAD_STAGES = {
    NEW: 'new',
    CONTACTED: 'contacted',
    QUALIFIED: 'qualified',
    PROPOSAL: 'proposal',
    NEGOTIATION: 'negotiation',
    WON: 'won',
    LOST: 'lost',
};

export const LEAD_SOURCES = {
    WEBSITE: 'website',
    REFERRAL: 'referral',
    SOCIAL_MEDIA: 'social_media',
    EMAIL: 'email',
    PHONE: 'phone',
    WALK_IN: 'walk_in',
    EVENT: 'event',
    PARTNER: 'partner',
    OTHER: 'other',
};

export const LEAD_PIPELINE_ORDER = [
    LEAD_STAGES.NEW,
    LEAD_STAGES.CONTACTED,
    LEAD_STAGES.QUALIFIED,
    LEAD_STAGES.PROPOSAL,
    LEAD_STAGES.NEGOTIATION,
    LEAD_STAGES.WON,
    LEAD_STAGES.LOST,
];
