import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { svcService } from '../services/svc.service';
import SectionHeader from '../components/SectionHeader';
import Badge from '../components/Badge';

const tabs = [
    { id: 'web-development', label: 'Web Development', icon: '' },
    { id: 'web-security', label: 'Web Security', icon: '' },
    { id: 'package', label: 'Packages', icon: '', comingSoon: true },
];

const serviceIcons = {
    'startup-website': '',
    'business-growth-website': '',
    'ecommerce-store': '',
    'custom-web-application': '',
    'managed-hosting-solutions': '',
    'seo-digital-growth': '',
    'enterprise-saas-portal': '',
    'dedicated-developer-team': '',
};

function ServiceCard({ service }) {
    const icon = serviceIcons[service.slug] || '';

    return (
        <Link
            to={`/services/${service.slug}`}
            className="card-webgenix card-webgenix-hover flex flex-col h-full animate-fade-in-webgenix group"
        >
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-xl shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-primary mb-1">{service.name}</h3>
                    {service.badge && (
                        <Badge
                            type={
                                service.badge === 'Most Popular' ? 'popular'
                                : service.badge === 'Enterprise' ? 'ai'
                                : service.badge === 'comingSoon' ? 'comingSoon'
                                : 'default'
                            }
                            label={service.badge}
                        />
                    )}
                </div>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3 flex-1">
                {service.description}
            </p>

            {service.pricingLabel && (
                <div className="mb-4">
                    <span className="text-xs font-bold text-accent uppercase tracking-widest">
                        {service.pricingLabel}
                    </span>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-5">
                {(service.techStack || []).slice(0, 4).map((tech) => (
                    <span
                        key={tech}
                        className="px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-600 text-[11px] font-medium text-text-muted"
                    >
                        {tech}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-4 border-t border-dark-600">
                <span className="text-sm font-semibold text-accent group-hover:underline">
                    View Details →
                </span>
            </div>
        </Link>
    );
}

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState('web-development');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const params = activeTab === 'package' ? { type: 'package' } : { type: activeTab };
                const res = await svcService.list(params);
                setServices(res.data || []);
            } catch {
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [activeTab]);

    const activeTabConfig = tabs.find((t) => t.id === activeTab);

    return (
        <main className="main-webgenix">
            <section className="section-webgenix pt-32">
                <div className="container-webgenix">
                    <SectionHeader
                        eyebrow="Our Services"
                        title="Complete Digital Solutions for Your Business"
                        subtitle="From web development to enterprise infrastructure — we provide end-to-end digital services to help you build, grow, and scale."
                    />

                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-14" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={tab.id === activeTab}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-2xl text-[14px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    tab.id === activeTab
                                        ? 'bg-accent text-white shadow-xl shadow-accent/25 scale-105'
                                        : 'text-text-secondary hover:text-text-primary bg-dark-800 border border-dark-600'
                                }`}
                            >
                                {tab.icon} {tab.label}
                                {tab.comingSoon && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                                        Soon
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab description */}
                    {activeTabConfig?.comingSoon ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-6">📦</div>
                            <h3 className="text-2xl font-bold text-text-primary mb-3">Packages — Coming Soon</h3>
                            <p className="text-text-muted max-w-md mx-auto">
                                We're crafting curated service packages that bundle our most popular offerings at special pricing. Stay tuned!
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-text-muted text-lg">No services available in this category yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((svc) => (
                                <ServiceCard key={svc._id} service={svc} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-16">
                        <p className="text-text-muted text-sm mb-4">
                            Need something custom or have a specific requirement?
                        </p>
                        <Link
                            to="/#contact"
                            className="btn-webgenix btn-primary-webgenix btn-lg-webgenix inline-flex"
                        >
                            Talk to Our Team →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
