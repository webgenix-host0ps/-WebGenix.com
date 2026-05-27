import { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import SectionHeader from '../components/SectionHeader';
import StatsBar from '../components/StatsBar';
import { homepageService } from '../services/homepage.service';

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center grid-pattern-webgenix overflow-hidden pt-20"
    >
      {/* Dynamic gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -5%, rgba(59,130,246,0.15) 0%, transparent 80%)',
        }}
      />
      
      {/* Animated glass orbs */}
      <div
        className="absolute top-1/4 right-[10%] w-96 h-96 rounded-full pointer-events-none animate-pulse-glow"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-1/4 left-[5%] w-64 h-64 rounded-full pointer-events-none animate-bounce-slow"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="container-webgenix section-webgenix relative z-10 w-full py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md mb-8 animate-fade-in-webgenix shadow-lg shadow-accent/5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[13px] font-semibold text-accent uppercase tracking-widest">
              Trusted by 10,000+ businesses across India
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-text-primary leading-[1.05] tracking-tight mb-8 animate-slide-up-webgenix delay-100"
            style={{ letterSpacing: '-0.04em' }}
          >
            Build Faster.{' '}
            <span className="text-gradient-webgenix">Scale Smarter.</span>
            <br />
            Go Further.
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary max-w-2xl mx-auto mb-12 animate-slide-up-webgenix delay-200 leading-relaxed font-medium">
            Enterprise-grade hosting, security, and digital infrastructure — delivered with the simplicity 
            your business deserves.
          </p>

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-up-webgenix delay-300">
            <a
              id="hero-cta-primary"
              href="#services"
              className="btn-webgenix btn-primary-webgenix btn-lg-webgenix gap-3 px-10 py-5 rounded-2xl shadow-xl shadow-accent/30 hover:scale-105"
            >
              Explore Services
              <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              id="hero-cta-secondary"
              href="#contact"
              className="btn-webgenix btn-secondary-webgenix btn-lg-webgenix px-10 py-5 rounded-2xl backdrop-blur-sm"
            >
              Talk to Sales
            </a>
          </div>

          {/* Stats bar */}
          <div className="animate-slide-up-webgenix delay-400 mt-20 lg:mt-24">
            <StatsBar />
          </div>
        </div>
      </div>

      {/* Bottom transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to top, var(--color-dark-900), transparent)' }}
      />
    </section>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabButton({ tab, isActive, onClick }) {
  return (
    <button
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      onClick={() => onClick(tab.id)}
      className={`
        whitespace-nowrap px-6 py-3 rounded-2xl text-[14px] font-bold transition-all duration-300 cursor-pointer flex items-center gap-2
        ${isActive
          ? 'bg-accent text-white shadow-xl shadow-accent/25 scale-105'
          : 'text-text-secondary hover:text-text-primary hover:bg-white/5 bg-dark-800 border border-dark-600'
        }
      `}
      style={{ border: isActive ? 'none' : '1px solid var(--color-dark-600)' }}
    >
      {tab.id === 'business' && <span>🚀</span>}
      {tab.id === 'infra' && <span>🏢</span>}
      {tab.id === 'domains' && <span>🌐</span>}
      {tab.label}
    </button>
  );
}

const toServiceCard = (p) => ({
  id: p._id,
  name: p.name,
  tagline: p.tagline || '',
  target: p.target || '',
  price: p.pricing?.[0] ? {
    startingFrom: p.pricing[0].price,
    setup: p.pricing[0].setupFee || undefined,
    currency: '₹',
    period: `/${p.pricing[0].cycle === 'monthly' ? 'mo' : p.pricing[0].cycle}`,
  } : undefined,
  startingPrice: p.pricing?.[0] ? undefined : undefined,
  features: p.features?.map(f => f.name || f.value || f) || [],
  cta: { label: 'Coming Soon', link: '#contact' },
  badge: 'Coming Soon',
  isRecommended: false,
});

const tabConfig = [
  { id: 'solutions', label: '🚀 Business Solutions', desc: 'All-in-one packages designed for real business outcomes — coming soon' },
  { id: 'infrastructure', label: '🧱 Infrastructure', desc: 'Powerful, scalable building blocks for your projects — coming soon' },
  { id: 'addons', label: '🔐 Domains, Email & Security', desc: 'Essential services to complete your online presence — coming soon' },
];

function ServicesSection() {
  const [groups, setGroups] = useState({ solutions: [], infrastructure: [], addons: [] });
  const [activeTab, setActiveTab] = useState('solutions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await homepageService.getProducts();
        setGroups(res.data);
      } catch {
        setGroups({ solutions: [], infrastructure: [], addons: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentCards = groups[activeTab] || [];

  return (
    <section id="services" className="section-webgenix">
      <div className="container-webgenix">
        <SectionHeader
          eyebrow="Our Services"
          title="Solutions Built for Your Growth"
          subtitle="From launching your first website to scaling enterprise infrastructure — we've got you covered."
        />

        <div
          className="flex flex-wrap justify-center gap-2 mb-10"
          role="tablist"
          aria-label="Service categories"
        >
          {tabConfig.map((tab) => (
            <TabButton
              key={tab.id}
              tab={{ id: tab.id, label: tab.label }}
              isActive={tab.id === activeTab}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {!loading && tabConfig.find(t => t.id === activeTab)?.desc && (
          <p className="text-center text-text-muted text-sm mb-8">
            {tabConfig.find(t => t.id === activeTab)?.desc}
          </p>
        )}

        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className={`grid gap-6 ${
                currentCards.length === 4
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
                  : currentCards.length === 3
                  ? 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {currentCards.map((card, idx) => (
                <ServiceCard key={card._id} card={toServiceCard(card)} index={idx} />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-14">
          <p className="text-text-muted text-sm mb-4">
            Need something custom? We've got you covered.
          </p>
          <a
            id="services-contact-cta"
            href="#contact"
            className="btn-webgenix btn-secondary-webgenix btn-md-webgenix"
          >
            Request Custom Quote →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Why Webgenix Section ─────────────────────────────────────────────────────
const whyFeatures = [
  {
    icon: '⚡',
    title: 'Lightning-Fast NVMe',
    desc: 'All plans run on enterprise NVMe SSDs delivering up to 7000 MB/s read speeds.',
  },
  {
    icon: '🛡️',
    title: '99.9% Uptime SLA',
    desc: 'Backed by redundant data centers and a rock-solid SLA with financial guarantees.',
  },
  {
    icon: '🌍',
    title: 'Global CDN',
    desc: 'Serve content from edge nodes worldwide for ultra-low latency everywhere.',
  },
  {
    icon: '🔒',
    title: 'Free SSL & Security',
    desc: 'Every plan includes a free SSL certificate and advanced DDoS protection.',
  },
  {
    icon: '📞',
    title: '24/7 Expert Support',
    desc: "Real engineers, not bots. We're available around the clock to help you succeed.",
  },
  {
    icon: '💳',
    title: '30-Day Money Back',
    desc: 'Not happy? Get a full refund within 30 days, no questions asked.',
  },
];

function WhySection() {
  return (
    <section id="about" className="section-webgenix" style={{ background: 'var(--color-dark-800)' }}>
      <div className="container-webgenix">
        <SectionHeader
          eyebrow="Why Webgenix"
          title="Built for Performance. Designed for Growth."
          subtitle="Everything you need to launch, manage, and scale your online presence — in one place."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyFeatures.map((f, idx) => (
            <div
              key={f.title}
              className="card-webgenix card-webgenix-hover animate-fade-in-webgenix"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: 'rgba(59,130,246,0.1)' }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA / Contact Section ────────────────────────────────────────────────────
function ContactSection() {
  return (
    <section id="contact" className="section-webgenix">
      <div className="container-webgenix">
        <div
          className="card-glass-webgenix text-center relative overflow-hidden"
          style={{ background: 'var(--color-dark-800)' }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)',
            }}
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="badge-webgenix badge-ai-webgenix inline-flex mb-4">
              🚀 Get Started Today
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold text-text-primary mb-4"
              style={{ letterSpacing: '-0.02em' }}
            >
              Ready to launch your
              <br />
              <span className="text-gradient-webgenix">next big thing?</span>
            </h2>
            <p className="text-text-secondary mb-8">
              Talk to a Webgenix expert and get a custom solution tailored to your business goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                id="contact-cta-primary"
                href="mailto:sales@webgenix.com"
                className="btn-webgenix btn-primary-webgenix btn-lg-webgenix"
              >
                Email Us
              </a>
              <a
                id="contact-cta-phone"
                href="tel:+911800123456"
                className="btn-webgenix btn-secondary-webgenix btn-lg-webgenix"
              >
                +91 1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="main-webgenix" id="main-content">
      <HeroSection />
      <ServicesSection />
      <WhySection />
      <ContactSection />
    </main>
  );
}
