import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/modules/billing/models/Product.js';

dotenv.config();

const billingCycles = ['monthly', 'quarterly', 'semi_annual', 'annual', 'biennial'];

// Helper to generate pricing for all cycles with discounts
const generatePricing = (basePrice) => {
    return billingCycles.map((cycle, index) => ({
        cycle,
        price: Math.round(basePrice * (index === 0 ? 1 : 1 - (index * 0.1))), // 10% discount per longer cycle
        setupFee: index === 0 ? 0 : Math.round(basePrice * 0.1 * (index)),
        isDefault: cycle === 'monthly',
        isActive: true,
    }));
};

// Complete Services Catalog
const servicesCatalog = [
    // === SHARED HOSTING ===
    {
        name: 'Starter Hosting',
        slug: 'starter-hosting',
        type: 'hosting',
        description: 'Perfect for beginners. 1 website, 10GB SSD storage, unmetered bandwidth.',
        category: 'Web Hosting',
        icon: 'server',
        status: 'active',
        featured: false,
        price: 99,
        features: [
            '1 Website',
            '10 GB SSD Storage',
            'Unmetered Bandwidth',
            'Free SSL Certificate',
            'cPanel Control Panel',
            '1 Email Account',
            'Daily Backups',
            '99.9% Uptime Guarantee'
        ]
    },
    {
        name: 'Business Hosting',
        slug: 'business-hosting',
        type: 'hosting',
        description: 'Ideal for small businesses. Unlimited websites, 50GB SSD, priority support.',
        category: 'Web Hosting',
        icon: 'server',
        status: 'active',
        featured: true,
        price: 299,
        features: [
            'Unlimited Websites',
            '50 GB NVMe SSD Storage',
            'Unmetered Bandwidth',
            'Free SSL Certificate',
            'cPanel Control Panel',
            'Unlimited Email Accounts',
            'Daily Backups',
            'Priority Support',
            'Free Domain (Annual)',
            '99.9% Uptime Guarantee'
        ]
    },
    {
        name: 'Pro Hosting',
        slug: 'pro-hosting',
        type: 'hosting',
        description: 'Maximum performance for professionals. 100GB NVMe SSD, dedicated resources.',
        category: 'Web Hosting',
        icon: 'server',
        status: 'active',
        featured: false,
        price: 599,
        features: [
            'Unlimited Websites',
            '100 GB NVMe SSD Storage',
            'Unmetered Bandwidth',
            'Free SSL Certificate',
            'cPanel Control Panel',
            'Unlimited Email Accounts',
            'Hourly Backups',
            '24/7 Priority Support',
            'Free Domain Forever',
            'Dedicated IP Address',
            '99.99% Uptime SLA'
        ]
    },
    
    // === VPS HOSTING ===
    {
        name: 'VPS Basic',
        slug: 'vps-basic',
        type: 'hosting',
        description: 'Entry-level VPS with 1 CPU, 2GB RAM, 40GB SSD. Full root access.',
        category: 'VPS Hosting',
        icon: 'hard-drive',
        status: 'active',
        featured: false,
        price: 499,
        features: [
            '1 vCPU Core',
            '2 GB RAM',
            '40 GB SSD Storage',
            '1 TB Bandwidth',
            'Full Root Access',
            'Choice of OS (Ubuntu/CentOS/Debian)',
            'DDoS Protection',
            '99.9% Uptime Guarantee',
            '24/7 Support'
        ]
    },
    {
        name: 'VPS Standard',
        slug: 'vps-standard',
        type: 'hosting',
        description: 'Balanced VPS with 2 CPU, 4GB RAM, 80GB SSD. Perfect for growing apps.',
        category: 'VPS Hosting',
        icon: 'hard-drive',
        status: 'active',
        featured: true,
        price: 999,
        features: [
            '2 vCPU Cores',
            '4 GB RAM',
            '80 GB SSD Storage',
            '2 TB Bandwidth',
            'Full Root Access',
            'Choice of OS',
            'DDoS Protection',
            'Managed Backups',
            '99.9% Uptime Guarantee',
            'Priority 24/7 Support'
        ]
    },
    {
        name: 'VPS Premium',
        slug: 'vps-premium',
        type: 'hosting',
        description: 'High-performance VPS with 4 CPU, 8GB RAM, 160GB NVMe. Enterprise ready.',
        category: 'VPS Hosting',
        icon: 'hard-drive',
        status: 'active',
        featured: false,
        price: 1999,
        features: [
            '4 vCPU Cores',
            '8 GB RAM',
            '160 GB NVMe Storage',
            '5 TB Bandwidth',
            'Full Root Access',
            'Choice of OS',
            'Advanced DDoS Protection',
            'Automated Daily Backups',
            '99.99% Uptime SLA',
            'Dedicated Account Manager'
        ]
    },
    
    // === DOMAIN REGISTRATION ===
    {
        name: '.COM Domain',
        slug: 'domain-com',
        type: 'domain',
        description: 'Register a .COM domain name. Includes free WHOIS privacy.',
        category: 'Domains',
        icon: 'globe',
        status: 'active',
        featured: true,
        price: 899, // Annual
        features: [
            '1 Year Registration',
            'Free WHOIS Privacy',
            'DNS Management',
            'Domain Forwarding',
            'Email Forwarding',
            'Theft Protection',
            '24/7 Support'
        ]
    },
    {
        name: '.IN Domain',
        slug: 'domain-in',
        type: 'domain',
        description: 'Indian domain extension. Perfect for India-focused businesses.',
        category: 'Domains',
        icon: 'globe',
        status: 'active',
        featured: false,
        price: 499, // Annual
        features: [
            '1 Year Registration',
            'Free WHOIS Privacy',
            'DNS Management',
            'Domain Forwarding',
            'Email Forwarding',
            'Theft Protection'
        ]
    },
    {
        name: '.NET Domain',
        slug: 'domain-net',
        type: 'domain',
        description: 'Alternative to .COM. Great for tech companies.',
        category: 'Domains',
        icon: 'globe',
        status: 'active',
        featured: false,
        price: 999, // Annual
        features: [
            '1 Year Registration',
            'Free WHOIS Privacy',
            'DNS Management',
            'Domain Forwarding',
            'Email Forwarding',
            'Theft Protection'
        ]
    },
    
    // === SSL CERTIFICATES ===
    {
        name: 'Free SSL Certificate',
        slug: 'ssl-free',
        type: 'ssl',
        description: 'Basic SSL certificate. Auto-renews. Domain validated.',
        category: 'SSL Certificates',
        icon: 'shield',
        status: 'active',
        featured: false,
        price: 0,
        features: [
            'Domain Validation',
            '2048-bit Encryption',
            'Auto-Renewal',
            'Browser Padlock',
            'HTTPS Support',
            'Universal Browser Support'
        ]
    },
    {
        name: 'Premium SSL',
        slug: 'ssl-premium',
        type: 'ssl',
        description: 'Organization validated SSL with $50,000 warranty.',
        category: 'SSL Certificates',
        icon: 'shield',
        status: 'active',
        featured: true,
        price: 1499, // Annual
        features: [
            'Organization Validation',
            '256-bit Encryption',
            '$50,000 Warranty',
            'Site Seal',
            'Browser Padlock',
            'HTTPS Support',
            'Universal Browser Support',
            'Priority Support'
        ]
    },
    {
        name: 'Wildcard SSL',
        slug: 'ssl-wildcard',
        type: 'ssl',
        description: 'Secure unlimited subdomains with one certificate.',
        category: 'SSL Certificates',
        icon: 'shield',
        status: 'active',
        featured: false,
        price: 3999, // Annual
        features: [
            'Covers *.yourdomain.com',
            'Unlimited Subdomains',
            'Organization Validation',
            '256-bit Encryption',
            '$100,000 Warranty',
            'Site Seal',
            'Universal Browser Support'
        ]
    },
    
    // === EMAIL SERVICES ===
    {
        name: 'Business Email Basic',
        slug: 'email-basic',
        type: 'service',
        description: 'Professional email with your domain. 10GB storage per mailbox.',
        category: 'Email Hosting',
        icon: 'mail',
        status: 'active',
        featured: false,
        price: 99,
        features: [
            '5 Email Accounts',
            '10 GB Storage Each',
            'Webmail Access',
            'Mobile Sync',
            'Anti-Spam Protection',
            'Ad-Free Interface',
            'IMAP/POP3 Support'
        ]
    },
    {
        name: 'Business Email Pro',
        slug: 'email-pro',
        type: 'service',
        description: 'Advanced business email with 50GB storage and collaboration tools.',
        category: 'Email Hosting',
        icon: 'mail',
        status: 'active',
        featured: true,
        price: 199,
        features: [
            'Unlimited Email Accounts',
            '50 GB Storage Each',
            'Webmail + Desktop Client',
            'Mobile Sync',
            'Advanced Anti-Spam',
            'Shared Calendars',
            'Shared Contacts',
            'Email Groups',
            'Priority Support'
        ]
    },
    {
        name: 'Microsoft 365 Email',
        slug: 'email-microsoft',
        type: 'service',
        description: 'Enterprise-grade email powered by Microsoft 365.',
        category: 'Email Hosting',
        icon: 'mail',
        status: 'active',
        featured: false,
        price: 599,
        features: [
            '1 Mailbox (50GB)',
            'Outlook Web & Desktop',
            'Exchange ActiveSync',
            '1TB OneDrive Storage',
            'Office Online Apps',
            'Teams Integration',
            'Advanced Security',
            '24/7 Support'
        ]
    },
    
    // === SECURITY & ADDONS ===
    {
        name: 'SiteLock Security',
        slug: 'sitelock-basic',
        type: 'addon',
        description: 'Daily malware scanning and automatic malware removal.',
        category: 'Security',
        icon: 'shield-check',
        status: 'active',
        featured: false,
        price: 299,
        features: [
            'Daily Malware Scan',
            'Automatic Malware Removal',
            'Blacklist Monitoring',
            'File Change Monitoring',
            'Email Alerts',
            'SiteLock Trust Seal'
        ]
    },
    {
        name: 'CodeGuard Basic',
        slug: 'codeguard-basic',
        type: 'addon',
        description: 'Automated website backup with 1-click restore.',
        category: 'Backup',
        icon: 'database',
        status: 'active',
        featured: false,
        price: 199,
        features: [
            'Daily Automated Backups',
            '5GB Storage',
            '1-Click Restore',
            'File Change Monitoring',
            'Download Backups',
            'Email Notifications'
        ]
    },
    {
        name: 'Cloudflare CDN',
        slug: 'cdn-cloudflare',
        type: 'addon',
        description: 'Global CDN to speed up your website worldwide.',
        category: 'Performance',
        icon: 'zap',
        status: 'active',
        featured: false,
        price: 399,
        features: [
            'Global CDN Network',
            'DDoS Protection',
            'Image Optimization',
            'Mobile Optimization',
            'Analytics Dashboard',
            'Free SSL Included'
        ]
    },
    
    // === DEDICATED SERVERS ===
    {
        name: 'Dedicated Server - Basic',
        slug: 'dedicated-basic',
        type: 'hosting',
        description: 'Full server control with Xeon CPU, 16GB RAM, 1TB SSD.',
        category: 'Dedicated Servers',
        icon: 'cpu',
        status: 'active',
        featured: false,
        price: 4999,
        features: [
            'Intel Xeon E3-1230',
            '16 GB RAM',
            '1 TB SSD Storage',
            '10 TB Bandwidth',
            '5 Dedicated IPs',
            'Full Root Access',
            'IPMI Access',
            'Hardware RAID',
            '99.99% Uptime SLA'
        ]
    },
    {
        name: 'Dedicated Server - Pro',
        slug: 'dedicated-pro',
        type: 'hosting',
        description: 'High-performance dedicated server with dual Xeon, 32GB RAM.',
        category: 'Dedicated Servers',
        icon: 'cpu',
        status: 'active',
        featured: true,
        price: 8999,
        features: [
            'Dual Intel Xeon E5-2630',
            '32 GB RAM',
            '2x 1TB SSD (RAID 1)',
            'Unmetered Bandwidth',
            '10 Dedicated IPs',
            'Full Root Access',
            'IPMI Access',
            'Managed Support Included',
            '99.99% Uptime SLA'
        ]
    },
    
    // === RESELLER HOSTING ===
    {
        name: 'Reseller Starter',
        slug: 'reseller-starter',
        type: 'hosting',
        description: 'Start your hosting business. Create up to 10 cPanel accounts.',
        category: 'Reseller Hosting',
        icon: 'users',
        status: 'active',
        featured: false,
        price: 999,
        features: [
            '10 cPanel Accounts',
            '50 GB SSD Storage',
            'Unmetered Bandwidth',
            'WHM Control Panel',
            'White Label Branding',
            'Free Billing Software',
            'Private Nameservers',
            '24/7 Support'
        ]
    },
    {
        name: 'Reseller Pro',
        slug: 'reseller-pro',
        type: 'hosting',
        description: 'Scale your hosting business with 50 cPanel accounts.',
        category: 'Reseller Hosting',
        icon: 'users',
        status: 'active',
        featured: true,
        price: 2499,
        features: [
            '50 cPanel Accounts',
            '200 GB NVMe SSD',
            'Unmetered Bandwidth',
            'WHM Control Panel',
            'White Label Branding',
            'Free Billing Software',
            'Private Nameservers',
            'Free Domain Reseller Account',
            'Priority Support'
        ]
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        console.log('Seeding WebGenix Services Catalog...\n');

        const products = [];

        // Process each service
        for (const service of servicesCatalog) {
            const productData = {
                name: service.name,
                slug: service.slug,
                type: service.type,
                description: service.description,
                category: service.category,
                icon: service.icon,
                status: service.status,
                featured: service.featured,
                pricing: service.type === 'domain' || service.type === 'ssl' 
                    ? [{ cycle: 'annual', price: service.price, setupFee: 0, isDefault: true, isActive: true }]
                    : generatePricing(service.price),
                features: service.features.map(f => ({
                    name: f,
                    value: 'Included',
                    included: true,
                })),
                parentProduct: null,
                requiresParent: false,
            };

            // Check if product already exists
            const existing = await Product.findOne({ slug: productData.slug });
            if (existing) {
                console.log(`  🔄 Updating: ${productData.name}`);
                Object.assign(existing, productData);
                await existing.save();
                products.push(existing);
            } else {
                console.log(`  ✨ Creating: ${productData.name}`);
                const product = await Product.create(productData);
                products.push(product);
            }
        }

        console.log(`\n✅ Successfully seeded ${products.length} products!`);
        console.log('\n📦 Service Categories:');
        const categories = [...new Set(servicesCatalog.map(s => s.category))];
        categories.forEach(cat => {
            const count = servicesCatalog.filter(s => s.category === cat).length;
            console.log(`   • ${cat}: ${count} products`);
        });
        
    } catch (error) {
        console.error('❌ Error seeding products:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

seedProducts();