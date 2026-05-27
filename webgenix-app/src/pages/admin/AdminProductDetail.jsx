import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { ArrowLeft, Save, Package, Info, Tag, Settings, Zap, Globe } from 'lucide-react';

export default function AdminProductDetail() {
    const { id } = useParams();
    const isNew = id === 'new';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Shared Hosting',
        type: 'hosting',
        status: 'active',
        pricing: [{ cycle: 'monthly', price: '' }],
        showOnHomepage: false,
        homepageGroup: '',
        homepageOrder: 0,
        tagline: '',
        target: '',
        ctaLabel: 'Get Started',
        ctaLink: '#contact',
        badge: '',
        isRecommended: false,
    });

    useEffect(() => {
        if (!isNew) {
            const fetchProduct = async () => {
                try {
                    const response = await adminService.getProduct(id);
                    const prod = response.data.product;
                    setFormData({
                        name: prod.name || '',
                        description: prod.description || '',
                        category: prod.category || 'Shared Hosting',
                        type: prod.type || 'hosting',
                        status: prod.status || 'active',
                        pricing: prod.pricing || [{ cycle: 'monthly', price: '' }],
                        showOnHomepage: prod.showOnHomepage || false,
                        homepageGroup: prod.homepageGroup || '',
                        homepageOrder: prod.homepageOrder || 0,
                        tagline: prod.tagline || '',
                        target: prod.target || '',
                        ctaLabel: prod.ctaLabel || 'Get Started',
                        ctaLink: prod.ctaLink || '#contact',
                        badge: prod.badge || '',
                        isRecommended: prod.isRecommended || false,
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isNew]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await adminService.createProduct(formData);
            } else {
                await adminService.updateProduct(id, formData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="animate-fade-in-webgenix">
                <button 
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} /> Back to Factory
                </button>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {isNew ? 'New Deployment Node' : 'Edit Configuration'}
                            </h1>
                        </div>
                        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60">
                            {isNew ? 'Initialize a new service type for the marketplace' : `Modifying node: ${formData.name}`}
                        </p>
                    </div>
                    
                    <button 
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-8 py-3 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                        Save Node Configuration
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Info size={16} className="text-accent" /> Core Data
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Product Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                        placeholder="e.g. Genesis Pro Hosting"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Service Specification (Description)</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all min-h-[120px]"
                                        placeholder="Outline the features and limits of this service..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Tag size={16} className="text-accent" /> Pricing Matrix
                            </h3>
                            <div className="space-y-4">
                                {formData.pricing.map((p, index) => (
                                    <div key={index} className="flex gap-4 items-center">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Billing Cycle</label>
                                            <select 
                                                value={p.cycle}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white outline-none"
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="annually">Annually</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Price (USD)</label>
                                            <input 
                                                type="number" 
                                                value={p.price}
                                                onChange={(e) => {
                                                    const newPricing = [...formData.pricing];
                                                    newPricing[index].price = e.target.value;
                                                    setFormData({...formData, pricing: newPricing});
                                                }}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Categorization */}
                        <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Settings size={16} className="text-accent" /> Classification
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Category</label>
                                    <select 
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white outline-none"
                                    >
                                        <option value="Shared Hosting">Shared Hosting</option>
                                        <option value="VPS Hosting">VPS Hosting</option>
                                        <option value="Cloud Hosting">Cloud Hosting</option>
                                        <option value="Dedicated Servers">Dedicated Servers</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Node Status</label>
                                    <div className="flex gap-2">
                                        {['active', 'hidden', 'retired'].map(s => (
                                            <button 
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData({...formData, status: s})}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    formData.status === s ? 'bg-accent text-white' : 'bg-dark-800 text-text-muted border border-header-border'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Homepage Visibility */}
                        <div className="bg-dark-900/50 border border-header-border rounded-[32px] p-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Globe size={16} className="text-accent" /> Homepage Display
                            </h3>
                            <div className="space-y-5">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showOnHomepage}
                                        onChange={(e) => setFormData({...formData, showOnHomepage: e.target.checked})}
                                        className="checkbox-webgenix"
                                    />
                                    <span className="text-sm text-text-primary font-medium">Show on Homepage</span>
                                </label>

                                {formData.showOnHomepage && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Tab Group</label>
                                            <select
                                                value={formData.homepageGroup}
                                                onChange={(e) => setFormData({...formData, homepageGroup: e.target.value})}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white outline-none"
                                            >
                                                <option value="solutions">Business Solutions</option>
                                                <option value="infrastructure">Infrastructure</option>
                                                <option value="addons">Domains, Email & Security</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Order</label>
                                            <input
                                                type="number"
                                                value={formData.homepageOrder}
                                                onChange={(e) => setFormData({...formData, homepageOrder: parseInt(e.target.value) || 0})}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Tagline</label>
                                            <input
                                                type="text"
                                                value={formData.tagline}
                                                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                placeholder="Brief one-liner"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Target Audience</label>
                                            <input
                                                type="text"
                                                value={formData.target}
                                                onChange={(e) => setFormData({...formData, target: e.target.value})}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                placeholder="e.g. Startups, SMEs"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">CTA Label</label>
                                                <input
                                                    type="text"
                                                    value={formData.ctaLabel}
                                                    onChange={(e) => setFormData({...formData, ctaLabel: e.target.value})}
                                                    className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">CTA Link</label>
                                                <input
                                                    type="text"
                                                    value={formData.ctaLink}
                                                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                                                    className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block">Badge</label>
                                            <input
                                                type="text"
                                                value={formData.badge}
                                                onChange={(e) => setFormData({...formData, badge: e.target.value})}
                                                className="w-full bg-dark-800 border border-header-border rounded-xl p-4 text-white focus:border-accent outline-none transition-all"
                                                placeholder="e.g. Most Popular, Best for Beginners"
                                            />
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isRecommended}
                                                onChange={(e) => setFormData({...formData, isRecommended: e.target.checked})}
                                                className="checkbox-webgenix"
                                            />
                                            <span className="text-sm text-text-primary font-medium">Recommended</span>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                <div className="h-10" />
                </div>
            </div>
        </DashboardLayout>
    );
}
