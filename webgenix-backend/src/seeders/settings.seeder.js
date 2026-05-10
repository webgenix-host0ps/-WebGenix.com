import SystemSetting from '../modules/admin/models/SystemSetting.js';

const defaultSettings = [
    // GENERAL
    { key: 'COMPANY_NAME', value: 'WebGenix Hosting', group: 'GENERAL', description: 'Display name of the platform' },
    { key: 'COMPANY_EMAIL', value: 'support@webgenix.com', group: 'GENERAL', description: 'System-wide contact email' },
    { key: 'SITE_URL', value: 'http://localhost:5173', group: 'GENERAL', description: 'Root URL of the application' },
    
    // BILLING
    { key: 'CURRENCY_CODE', value: 'INR', group: 'BILLING', description: 'System base currency' },
    { key: 'CURRENCY_SYMBOL', value: '₹', group: 'BILLING', description: 'Display symbol for currency' },
    { key: 'TAX_ENABLED', value: 'true', group: 'BILLING', description: 'Whether to apply tax to invoices' },
    
    // TICKETING
    { key: 'TICKET_AUTO_CLOSE_DAYS', value: '3', group: 'TICKETING', description: 'Days after which answered tickets are closed' },
    { key: 'MAX_ATTACHMENT_SIZE_MB', value: '10', group: 'TICKETING', description: 'Max size for file uploads' },
];

export const seedSettings = async () => {
    try {
        for (const setting of defaultSettings) {
            await SystemSetting.findOneAndUpdate(
                { key: setting.key },
                { $setOnInsert: setting },
                { upsert: true }
            );
        }
        console.log('System settings seeded successfully');
    } catch (error) {
        console.error('Error seeding settings:', error);
    }
};
