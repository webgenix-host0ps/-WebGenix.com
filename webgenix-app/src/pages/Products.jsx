import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import ServiceCard from '../components/ServiceCard';
import { productService } from '../services/product.service';

const comingSoonCategories = ['Domains', 'Email Hosting', 'Dedicated Servers'];

const toCard = (p) => {
    const isComingSoon = comingSoonCategories.includes(p.category);
    return {
        id: p._id,
        name: p.name,
        tagline: p.description?.slice(0, 100) + (p.description?.length > 100 ? '...' : '') || '',
        target: '',
        price: p.pricing?.[0] ? {
            startingFrom: p.pricing[0].price,
            setup: p.pricing[0].setupFee || undefined,
            currency: '\u20B9',
            period: `/${p.pricing[0].cycle === 'monthly' ? 'mo' : p.pricing[0].cycle}`,
        } : undefined,
        features: p.features?.map(f => f.name || f.value || f)?.slice(0, 5) || [],
        cta: isComingSoon ? { label: 'Coming Soon', link: '#contact' } : { label: 'View Details', link: '/marketplace' },
        badge: isComingSoon ? 'Coming Soon' : p.badge || undefined,
        isRecommended: false,
    };
};

const categories = ['All', 'Web Hosting', 'VPS Hosting', 'Domains', 'SSL Certificates', 'Email Hosting', 'Security', 'Dedicated Servers', 'Reseller Hosting'];

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.getAll();
                setProducts(res.data || []);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filtered = activeCategory === 'All'
        ? products
        : products.filter(p => p.category === activeCategory);

    return (
        <main className="main-webgenix">
            <section className="section-webgenix pt-32">
                <div className="container-webgenix">
                    <SectionHeader
                        eyebrow="Our Products"
                        title="Infrastructure & Hosting Products"
                        subtitle="Reliable, high-performance infrastructure products for your websites, applications, and business operations."
                    />

                    <div className="flex flex-wrap justify-center gap-2 mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    activeCategory === cat
                                        ? 'bg-accent text-white shadow-lg shadow-accent/25'
                                        : 'bg-dark-800 text-text-secondary hover:text-text-primary border border-dark-600'
                                }`}
                            >
                                {cat}
                                {comingSoonCategories.includes(cat) && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                                        Soon
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-text-muted text-lg">No products found in this category.</p>
                            <p className="text-text-muted text-sm mt-2">Check back soon for new additions!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p, idx) => (
                                <ServiceCard key={p._id} card={toCard(p)} index={idx} />
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-16">
                        <p className="text-text-muted text-sm mb-4">
                            Need a custom infrastructure solution?
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
