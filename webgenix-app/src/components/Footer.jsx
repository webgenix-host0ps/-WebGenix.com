import { serviceCatalog } from '../data/services';

const guarantees = serviceCatalog.metadata.guarantees;
const support    = serviceCatalog.metadata.support;

const footerLinks = {
  Services: ['Shared Hosting', 'VPS Servers', 'Dedicated Servers', 'Backup Solutions'],
  Company:  ['About Us', 'Blog', 'Careers', 'Press'],
  Support:  ['Help Center', 'Contact Us', 'Status Page', 'SLA'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

export default function Footer() {
  return (
    <footer className="border-t border-dark-600" style={{ background: 'var(--color-dark-900)' }}>
      {/* Guarantee bar */}
      <div className="border-b border-dark-700">
        <div className="container-webgenix py-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {guarantees.map((g) => (
              <div key={g} className="flex items-center gap-2">
                <ShieldIcon />
                <span className="text-sm text-text-secondary">{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-webgenix py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="col-span-2 lg:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4" aria-label="Webgenix">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
              >
                W
              </div>
              <span className="text-base font-semibold text-text-primary">
                Web<span className="text-gradient-webgenix">genix</span>
              </span>
            </a>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              Powering your digital presence with enterprise-grade infrastructure.
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-text-muted">
              <a href={`mailto:${support.email}`} className="hover:text-accent transition-colors">
                {support.email}
              </a>
              <span>{support.phone}</span>
              <span className="text-success text-xs font-medium">{support.hours}</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wide">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-muted hover:text-text-secondary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 mt-10 border-t border-dark-700">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Webgenix. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
              <a key={s} href="#" className="text-sm text-text-muted hover:text-accent transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 text-success shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L2 4v4c0 3.3 2.5 5.8 6 7 3.5-1.2 6-3.7 6-7V4L8 1.5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M5.5 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
