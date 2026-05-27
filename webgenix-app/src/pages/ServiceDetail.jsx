import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { svcService } from '../services/svc.service';
import Badge from '../components/Badge';

function CheckIcon() {
    return (
        <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function DotIcon() {
    return (
        <svg className="w-4 h-4 text-text-muted shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" fill="currentColor" />
        </svg>
    );
}

export default function ServiceDetail() {
    const { slug } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await svcService.getBySlug(slug);
                setService(res.data);
            } catch {
                setService(null);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [slug]);

    if (loading) {
        return (
            <main className="main-webgenix">
                <div className="flex justify-center py-32">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
            </main>
        );
    }

    if (!service) {
        return (
            <main className="main-webgenix">
                <div className="container-webgenix py-32 text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">Service Not Found</h1>
                    <Link to="/services" className="text-accent hover:underline">← Back to Services</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="main-webgenix">
            {/* Hero */}
            <section className="relative overflow-hidden pt-32 pb-20">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
                    style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(59,130,246,0.12) 0%, transparent 80%)' }}
                />
                <div className="container-webgenix relative z-10">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent mb-8 transition-colors">
                        ← Back to Services
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl shrink-0">
                                {service.icon === 'rocket' && ''}
                                {service.icon === 'trending-up' && ''}
                                {service.icon === 'shopping-cart' && ''}
                                {service.icon === 'layout' && ''}
                                {service.icon === 'server' && ''}
                                {service.icon === 'search' && ''}
                                {service.icon === 'building' && ''}
                                {service.icon === 'users' && ''}
                                {(!service.icon || !['rocket','trending-up','shopping-cart','layout','server','search','building','users'].includes(service.icon)) && '✨'}
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight">{service.name}</h1>
                                {service.badge && (
                                    <div className="mt-2">
                                        <Badge
                                            type={service.badge === 'Most Popular' ? 'popular' : service.badge === 'Enterprise' ? 'ai' : 'default'}
                                            label={service.badge}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-lg text-text-secondary leading-relaxed mt-6 max-w-3xl">
                            {service.fullDescription || service.description}
                        </p>

                        {service.pricingLabel && (
                            <div className="mt-8 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-accent/5 border border-accent/20">
                                <span className="text-sm font-bold text-text-muted uppercase tracking-widest">Pricing:</span>
                                <span className="text-2xl font-extrabold text-accent">{service.pricingLabel}</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features & Details */}
            <section className="section-webgenix pt-0">
                <div className="container-webgenix">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Features */}
                            {service.features?.length > 0 && (
                                <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full bg-accent" />
                                        What's Included
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {service.features.map((f, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/50">
                                                {f.included !== false ? <CheckIcon /> : <DotIcon />}
                                                <span className={`text-sm ${f.included !== false ? 'text-text-primary' : 'text-text-muted'}`}>
                                                    {f.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Deliverables */}
                            {service.deliverables?.length > 0 && (
                                <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full bg-accent" />
                                        Deliverables
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {service.deliverables.map((d, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
                                                <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm text-text-primary">{d}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tech Stack */}
                            {service.techStack?.length > 0 && (
                                <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <span className="w-1 h-5 rounded-full bg-accent" />
                                        Tech Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {service.techStack.map((tech) => (
                                            <span key={tech} className="px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-600 text-xs font-medium text-text-muted">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8 text-center">
                                <h3 className="text-lg font-bold text-text-primary mb-2">Interested in this service?</h3>
                                <p className="text-sm text-text-secondary mb-6">
                                    Get in touch with our team for a custom quote and consultation.
                                </p>
                                <Link
                                    to="/#contact"
                                    className="btn-webgenix btn-primary-webgenix btn-md-webgenix w-full"
                                >
                                    Get a Quote →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
