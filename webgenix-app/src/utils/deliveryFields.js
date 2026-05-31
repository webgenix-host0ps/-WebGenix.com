// Field templates for service delivery details per product type/category
// Each template defines what fields staff see when provisioning a service

const TEXT = 'text';
const PASSWORD = 'password';
const TEXTAREA = 'textarea';

const SHARED_HOSTING_FIELDS = [
    { key: 'serverName', label: 'Server Name', type: TEXT, placeholder: 'srv01.webgenix.host' },
    { key: 'cpanelUrl', label: 'cPanel URL', type: TEXT, placeholder: 'https://cpanel.webgenix.host:2083' },
    { key: 'username', label: 'Username', type: TEXT, placeholder: 'webgenix_user' },
    { key: 'password', label: 'Password', type: PASSWORD, placeholder: '••••••••' },
    { key: 'phpVersion', label: 'PHP Version', type: TEXT, placeholder: '8.2' },
    { key: 'dbName', label: 'Database Name', type: TEXT, placeholder: 'webgenix_db' },
    { key: 'dbUsername', label: 'Database Username', type: TEXT, placeholder: 'webgenix_db_user' },
    { key: 'dbPassword', label: 'Database Password', type: PASSWORD, placeholder: '••••••••' },
    { key: 'nameserver1', label: 'Nameserver 1', type: TEXT, placeholder: 'ns1.webgenix.host' },
    { key: 'nameserver2', label: 'Nameserver 2', type: TEXT, placeholder: 'ns2.webgenix.host' },
];

const VPS_FIELDS = [
    { key: 'hostname', label: 'Hostname', type: TEXT, placeholder: 'vps01.webgenix.host' },
    { key: 'ipAddress', label: 'IP Address', type: TEXT, placeholder: '192.168.1.100' },
    { key: 'sshPort', label: 'SSH Port', type: TEXT, placeholder: '22' },
    { key: 'sshUsername', label: 'SSH Username', type: TEXT, placeholder: 'root' },
    { key: 'sshPassword', label: 'SSH Password', type: PASSWORD, placeholder: '••••••••' },
    { key: 'os', label: 'Operating System', type: TEXT, placeholder: 'Ubuntu 22.04 LTS' },
    { key: 'cpuCores', label: 'CPU Cores', type: TEXT, placeholder: '4' },
    { key: 'ram', label: 'RAM', type: TEXT, placeholder: '8 GB' },
    { key: 'diskSpace', label: 'Disk Space', type: TEXT, placeholder: '160 GB NVMe' },
    { key: 'bandwidth', label: 'Bandwidth', type: TEXT, placeholder: '4 TB' },
    { key: 'ns1', label: 'Nameserver 1', type: TEXT, placeholder: 'ns1.webgenix.host' },
    { key: 'ns2', label: 'Nameserver 2', type: TEXT, placeholder: 'ns2.webgenix.host' },
];

const DEDICATED_SERVER_FIELDS = [
    ...VPS_FIELDS,
    { key: 'iloIp', label: 'iLO / BMC IP', type: TEXT, placeholder: '192.168.1.200' },
    { key: 'iloUsername', label: 'iLO Username', type: TEXT, placeholder: 'Administrator' },
    { key: 'iloPassword', label: 'iLO Password', type: PASSWORD, placeholder: '••••••••' },
    { key: 'rackLocation', label: 'Rack Location', type: TEXT, placeholder: 'DC1-R04-U12' },
];

const EMAIL_HOSTING_FIELDS = [
    { key: 'serverName', label: 'Mail Server', type: TEXT, placeholder: 'mail.webgenix.host' },
    { key: 'webmailUrl', label: 'Webmail URL', type: TEXT, placeholder: 'https://mail.webgenix.host' },
    { key: 'imapServer', label: 'IMAP Server', type: TEXT, placeholder: 'mail.webgenix.host' },
    { key: 'imapPort', label: 'IMAP Port', type: TEXT, placeholder: '993' },
    { key: 'smtpServer', label: 'SMTP Server', type: TEXT, placeholder: 'mail.webgenix.host' },
    { key: 'smtpPort', label: 'SMTP Port', type: TEXT, placeholder: '465' },
    { key: 'username', label: 'Email Username', type: TEXT, placeholder: 'you@webgenix.host' },
    { key: 'password', label: 'Email Password', type: PASSWORD, placeholder: '••••••••' },
];

const DOMAIN_FIELDS = [
    { key: 'registrar', label: 'Registrar', type: TEXT, placeholder: 'GoDaddy / Namecheap' },
    { key: 'ns1', label: 'Nameserver 1', type: TEXT, placeholder: 'ns1.webgenix.host' },
    { key: 'ns2', label: 'Nameserver 2', type: TEXT, placeholder: 'ns2.webgenix.host' },
    { key: 'dnsManagerUrl', label: 'DNS Manager URL', type: TEXT, placeholder: 'https://dns.webgenix.host' },
    { key: 'eppCode', label: 'EPP / Auth Code', type: PASSWORD, placeholder: '••••••••' },
    { key: 'whoisProtection', label: 'WHOIS Protection', type: TEXT, placeholder: 'Enabled' },
];

const SSL_FIELDS = [
    { key: 'certificateType', label: 'Certificate Type', type: TEXT, placeholder: 'Wildcard SSL' },
    { key: 'issuer', label: 'Issuer', type: TEXT, placeholder: 'Let\'s Encrypt / Sectigo' },
    { key: 'validFrom', label: 'Valid From', type: TEXT, placeholder: '2026-01-01' },
    { key: 'validUntil', label: 'Valid Until', type: TEXT, placeholder: '2027-01-01' },
    { key: 'crtFile', label: 'Certificate (CRT)', type: TEXTAREA, placeholder: '-----BEGIN CERTIFICATE-----...' },
    { key: 'keyFile', label: 'Private Key', type: PASSWORD, placeholder: '-----BEGIN PRIVATE KEY-----...' },
    { key: 'caBundle', label: 'CA Bundle', type: TEXTAREA, placeholder: '-----BEGIN CERTIFICATE-----...' },
];

const WEB_DEV_FIELDS = [
    { key: 'projectUrl', label: 'Project URL', type: TEXT, placeholder: 'https://client-project.com' },
    { key: 'stagingUrl', label: 'Staging URL', type: TEXT, placeholder: 'https://staging.client-project.com' },
    { key: 'gitRepo', label: 'Git Repository', type: TEXT, placeholder: 'https://github.com/org/project' },
    { key: 'adminUrl', label: 'Admin Panel URL', type: TEXT, placeholder: 'https://client-project.com/admin' },
    { key: 'adminUsername', label: 'Admin Username', type: TEXT, placeholder: 'admin' },
    { key: 'adminPassword', label: 'Admin Password', type: PASSWORD, placeholder: '••••••••' },
    { key: 'ftpHost', label: 'FTP/SFTP Host', type: TEXT, placeholder: 'sftp.client-project.com' },
    { key: 'ftpUsername', label: 'FTP Username', type: TEXT, placeholder: 'project_ftp' },
    { key: 'ftpPassword', label: 'FTP Password', type: PASSWORD, placeholder: '••••••••' },
];

const DEFAULT_FIELDS = [
    { key: 'notes', label: 'Provisioning Notes', type: TEXTAREA, placeholder: 'Any additional notes about this service...' },
];

// Map product categories to their field sets
export const CATEGORY_FIELDS = {
    'shared-hosting': SHARED_HOSTING_FIELDS,
    'shared hosting': SHARED_HOSTING_FIELDS,
    'vps': VPS_FIELDS,
    'vps hosting': VPS_FIELDS,
    'dedicated-server': DEDICATED_SERVER_FIELDS,
    'dedicated servers': DEDICATED_SERVER_FIELDS,
    'dedicated server': DEDICATED_SERVER_FIELDS,
    'email-hosting': EMAIL_HOSTING_FIELDS,
    'email hosting': EMAIL_HOSTING_FIELDS,
    'domains': DOMAIN_FIELDS,
    'domain': DOMAIN_FIELDS,
    'ssl': SSL_FIELDS,
    'ssl certificates': SSL_FIELDS,
    'web-development': WEB_DEV_FIELDS,
    'web development': WEB_DEV_FIELDS,
};

// Map product types to their field sets (fallback)
export const TYPE_FIELDS = {
    'hosting': SHARED_HOSTING_FIELDS,
    'vps': VPS_FIELDS,
    'dedicated': DEDICATED_SERVER_FIELDS,
    'email': EMAIL_HOSTING_FIELDS,
    'domain': DOMAIN_FIELDS,
    'ssl': SSL_FIELDS,
    'webdev': WEB_DEV_FIELDS,
    'service': WEB_DEV_FIELDS,
};

export function getFieldsForService(service) {
    const category = (service.productId?.category || service.category || '').toLowerCase();
    const type = (service.productId?.type || service.productType || '').toLowerCase();

    const fields = CATEGORY_FIELDS[category] || TYPE_FIELDS[type] || DEFAULT_FIELDS;
    return [...fields, ...DEFAULT_FIELDS];
}