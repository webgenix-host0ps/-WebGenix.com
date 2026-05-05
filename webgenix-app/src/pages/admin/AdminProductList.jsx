import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import DataTable from '../../components/dashboard/DataTable';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminService } from '../../services/admin.service';
import { Plus, Package, Edit, Trash2, ExternalLink } from 'lucide-react';

export default function AdminProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await adminService.getProducts();
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const columns = [
        { 
            key: 'name', 
            header: 'PRODUCT NAME', 
            renderCell: (r) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-dark-800 border border-header-border flex items-center justify-center text-accent">
                        <Package size={16} />
                    </div>
                    <div>
                        <p className="font-black text-white uppercase tracking-tight">{r.name}</p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{r.category || 'Standard'}</p>
                    </div>
                </div>
            )
        },
        { 
            key: 'type', 
            header: 'TYPE', 
            renderCell: (r) => (
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                    {r.type || 'Service'}
                </span>
            )
        },
        { 
            key: 'pricing', 
            header: 'BASE PRICING', 
            renderCell: (r) => (
                <span className="text-sm font-bold text-white">
                    ${r.pricing?.[0]?.price || '0.00'} <span className="text-text-muted text-[10px] uppercase font-black tracking-tighter">/mo</span>
                </span>
            )
        },
        { 
            key: 'status', 
            header: 'STATUS', 
            renderCell: (r) => <StatusBadge status={r.status || 'active'} /> 
        },
        { 
            key: 'actions', 
            header: 'CONTROL', 
            renderCell: (r) => (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(`/admin/products/${r._id}`)}
                        className="p-2 text-text-muted hover:text-accent transition-colors"
                        title="Edit Product"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        className="p-2 text-text-muted hover:text-red-400 transition-colors"
                        title="Delete Product"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ) 
        }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-[32px] animate-in fade-in duration-700">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <Package size={16} className="text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Inventory Matrix</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Product Factory</h1>
                        <p className="text-text-secondary text-sm font-bold uppercase tracking-widest opacity-60 mt-2">Design and configure service deployments for the global marketplace.</p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-accent/20 flex items-center gap-2"
                    >
                        <Plus size={14} /> New Deployment Node
                    </button>
                </div>

                {/* Table Area */}
                <div className="bg-dark-900/50 border border-header-border rounded-[40px] p-2 overflow-hidden shadow-2xl">
                    <DataTable 
                        columns={columns} 
                        data={products} 
                        isLoading={loading} 
                    />
                </div>

                <div className="h-10" />
            </div>
        </DashboardLayout>
    );
}
