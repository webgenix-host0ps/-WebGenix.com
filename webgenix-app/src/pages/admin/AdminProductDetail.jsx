import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { ArrowLeft, Save, Package, Info, Tag, Settings, Zap } from 'lucide-react';

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
        pricing: [{ cycle: 'monthly', price: '' }]
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
                        pricing: prod.pricing || [{ cycle: 'monthly', price: '' }]
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

                        {/* Integration Hint */}
                        <div className="p-8 rounded-[32px] bg-gradient-to-br from-accent/20 to-purple-600/10 border border-accent/20">
                            <Zap className="text-accent mb-4" size={24} />
                            <h4 className="text-white font-black text-sm mb-2 uppercase tracking-tight">Provisioning Matrix</h4>
                            <p className="text-[10px] text-text-secondary leading-relaxed font-bold uppercase tracking-widest opacity-60">
                                This node is set for automated deployment via cPanel/WHM API. Ensure server nodes are configured in System Settings.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
