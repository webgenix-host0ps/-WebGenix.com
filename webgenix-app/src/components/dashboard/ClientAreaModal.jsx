import { useState, useEffect } from 'react';
import { getClientSummary } from '../../services/ticket.service';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import {
    Package, FileText, ShoppingCart, Search,
    XCircle, AlertCircle, Clock, CheckCircle, ArrowLeft,
    Calendar, DollarSign, Hash, Repeat, Globe, User,
    CreditCard, Tag, Layers, Info, Mail, Phone, Building,
    Zap, Shield
} from 'lucide-react';

const TABS = [
    { key: 'services', label: 'Services', icon: Package },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
];

const CYCLE_LABELS = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    semi_annual: 'Semi-Annual',
    annual: 'Annual',
    biennial: 'Biennial',
};

const STATUS_COLORS = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    terminated: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function DetailRow({ icon: Icon, label, value, highlight }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-dark-700/50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-text-muted" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
                <p className={`text-sm mt-0.5 break-words ${highlight ? 'text-accent font-semibold' : 'text-white'}`}>
                    {value || '-'}
                </p>
            </div>
        </div>
    );
}

function InfoCard({ title, children, className = '' }) {
    return (
        <div className={`bg-dark-900/50 border border-dark-600 rounded-xl p-5 ${className}`}>
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 pb-2 border-b border-dark-700">
                {title}
            </h4>
            {children}
        </div>
    );
}

function StatusIcon({ status }) {
    const icon = status === 'active' ? CheckCircle : status === 'pending' || status === 'open' ? Clock : XCircle;
    const color = status === 'active' || status === 'paid' ? 'text-green-400' :
                  status === 'pending' || status === 'unpaid' ? 'text-amber-400' :
                  status === 'suspended' || status === 'cancelled' || status === 'terminated' || status === 'refunded' ? 'text-red-400' :
                  'text-gray-400';
    return <icon size={10} className={color} />;
}

// ====================== DETAIL VIEWS ======================

function ServiceDetail({ service, onBack }) {
    return (
        <div className="space-y-5">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
                <ArrowLeft size={14} /> Back to Services
            </button>

            <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-600 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        service.status === 'active' ? 'bg-green-500/10' :
                        service.status === 'suspended' ? 'bg-red-500/10' :
                        service.status === 'pending' ? 'bg-amber-500/10' : 'bg-gray-500/10'
                    }`}>
                        <Package size={22} className={
                            service.status === 'active' ? 'text-green-400' :
                            service.status === 'suspended' ? 'text-red-400' :
                            service.status === 'pending' ? 'text-amber-400' : 'text-gray-400'
                        } />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-white">{service.productName}</h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                STATUS_COLORS[service.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                                <StatusIcon status={service.status} />
                                {service.status}
                            </span>
                        </div>
                        {service.productId?.name && (
                            <p className="text-sm text-text-muted mt-1">{service.productId.name}</p>
                        )}
                        {service.productId?.category && (
                            <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider">{service.productId.category} {service.productId.type ? `/ ${service.productId.type}` : ''}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard title="Billing Information">
                    <DetailRow icon={DollarSign} label="Recurring Amount" value={`$${(service.recurringAmount || 0).toFixed(2)}`} highlight />
                    {service.firstPaymentAmount > 0 && (
                        <DetailRow icon={CreditCard} label="First Payment" value={`$${service.firstPaymentAmount.toFixed(2)}`} />
                    )}
                    {service.setupFee > 0 && (
                        <DetailRow icon={Zap} label="Setup Fee" value={`$${service.setupFee.toFixed(2)}`} />
                    )}
                    <DetailRow icon={Repeat} label="Billing Cycle" value={CYCLE_LABELS[service.cycle] || service.cycle || '-'} />
                    <DetailRow icon={Hash} label="Registration Period" value={service.registrationPeriod ? `${service.registrationPeriod} year(s)` : '-'} />
                    <DetailRow icon={Shield} label="Auto Renew" value={service.autoRenew !== false ? 'Enabled' : 'Disabled'} />
                </InfoCard>

                <InfoCard title="Service Details">
                    <DetailRow icon={Globe} label="Domain" value={service.domain} />
                    <DetailRow icon={Calendar} label="Next Due Date" value={service.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'} />
                    <DetailRow icon={Calendar} label="Next Invoice Date" value={service.nextInvoiceDate ? new Date(service.nextInvoiceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'} />
                    <DetailRow icon={Calendar} label="Created" value={service.createdAt ? new Date(service.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'} />
                    {service.productId?.slug && (
                        <DetailRow icon={Tag} label="Product Slug" value={service.productId.slug} />
                    )}
                </InfoCard>
            </div>

            {service.configuration && Object.keys(service.configuration).length > 0 && (
                <InfoCard title="Configuration">
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(service.configuration).map(([key, val]) => (
                            <div key={key} className="bg-dark-800 rounded-lg px-3 py-2">
                                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{key}</p>
                                <p className="text-sm text-white mt-0.5">{String(val)}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

            {service.notes && (
                <InfoCard title="Notes">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{service.notes}</p>
                </InfoCard>
            )}

            <div className="flex items-center gap-3 text-[10px] text-text-muted">
                {service.orderId?.orderNumber && (
                    <span>Order: #{service.orderId.orderNumber}</span>
                )}
                <span>Service ID: {service._id}</span>
            </div>
        </div>
    );
}

function InvoiceDetail({ invoice, onBack }) {
    const subtotal = invoice.items?.reduce((s, i) => s + (i.total || i.unitPrice * i.quantity || 0), 0) || 0;
    const hasItems = invoice.items?.length > 0;

    return (
        <div className="space-y-5">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
                <ArrowLeft size={14} /> Back to Invoices
            </button>

            <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-600 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <FileText size={22} className="text-accent" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-white">Invoice #{invoice.invoiceId || invoice._id?.substring(0, 8).toUpperCase()}</h3>
                                <StatusBadge status={invoice.status} />
                            </div>
                            <p className="text-sm text-text-muted mt-1">
                                Issued: {invoice.dateIssued ? new Date(invoice.dateIssued).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}
                                {invoice.dueDate && ` | Due: ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">${(invoice.total || invoice.amountDue || 0).toFixed(2)}</p>
                        {invoice.amountPaid > 0 && (
                            <p className="text-xs text-green-400">${invoice.amountPaid.toFixed(2)} paid</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard title="Payment Info">
                    <DetailRow icon={DollarSign} label="Total" value={`$${(invoice.total || 0).toFixed(2)}`} highlight />
                    <DetailRow icon={DollarSign} label="Amount Due" value={`$${(invoice.amountDue || 0).toFixed(2)}`} />
                    <DetailRow icon={DollarSign} label="Amount Paid" value={`$${(invoice.amountPaid || 0).toFixed(2)}`} />
                    <DetailRow icon={CreditCard} label="Payment Method" value={invoice.paymentMethod || '-'} />
                    <DetailRow icon={Hash} label="Transaction ID" value={invoice.transactionId || '-'} />
                    <DetailRow icon={Calendar} label="Date Paid" value={invoice.datePaid ? new Date(invoice.datePaid).toLocaleDateString() : '-'} />
                </InfoCard>

                <InfoCard title="Invoice Details">
                    <DetailRow icon={Tag} label="Invoice Type" value={invoice.type || '-'} />
                    <DetailRow icon={Calendar} label="Due Date" value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'} />
                    <DetailRow icon={User} label="Currency" value={invoice.currency || 'USD'} />
                    <DetailRow icon={Info} label="Invoice ID" value={invoice._id} />
                </InfoCard>
            </div>

            {hasItems && (
                <InfoCard title={`Invoice Items (${invoice.items.length})`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-dark-700">
                                    <th className="text-left py-2 pr-3">Description</th>
                                    <th className="text-right py-2 px-3">Qty</th>
                                    <th className="text-right py-2 px-3">Unit Price</th>
                                    <th className="text-right py-2 pl-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-dark-700/30">
                                        <td className="py-2.5 pr-3 text-white">{item.description || item.productId?.name || 'Item'}</td>
                                        <td className="py-2.5 px-3 text-right text-text-muted">{item.quantity || 1}</td>
                                        <td className="py-2.5 px-3 text-right text-text-muted">${(item.unitPrice || 0).toFixed(2)}</td>
                                        <td className="py-2.5 pl-3 text-right font-mono text-white">${(item.total || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-right pt-3 pr-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Subtotal</td>
                                    <td className="text-right pt-3 pl-3 font-mono text-white">${subtotal.toFixed(2)}</td>
                                </tr>
                                {invoice.discountAmount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-right pt-1 pr-3 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                            Discount{invoice.discountType ? ` (${invoice.discountType})` : ''}
                                        </td>
                                        <td className="text-right pt-1 pl-3 font-mono text-red-400">-${invoice.discountAmount.toFixed(2)}</td>
                                    </tr>
                                )}
                                {invoice.taxAmount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-right pt-1 pr-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                            Tax{invoice.taxName ? ` (${invoice.taxName} ${invoice.taxRate || ''}%)` : ''}
                                        </td>
                                        <td className="text-right pt-1 pl-3 font-mono text-text-muted">${invoice.taxAmount.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="3" className="text-right pt-2 pr-3 text-xs font-bold text-white uppercase tracking-wider border-t border-dark-700">Total</td>
                                    <td className="text-right pt-2 pl-3 font-mono text-white font-bold text-base border-t border-dark-700">${(invoice.total || 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </InfoCard>
            )}

            {invoice.notes && (
                <InfoCard title="Notes">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{invoice.notes}</p>
                </InfoCard>
            )}
        </div>
    );
}

function OrderDetail({ order, onBack }) {
    const hasItems = order.items?.length > 0;
    const subtotal = hasItems ? order.items.reduce((s, i) => s + (i.total || 0), 0) : 0;

    return (
        <div className="space-y-5">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors font-medium">
                <ArrowLeft size={14} /> Back to Orders
            </button>

            <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-600 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <ShoppingCart size={22} className="text-accent" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-white">Order #{order.orderNumber || order._id?.substring(0, 8).toUpperCase()}</h3>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-text-muted mt-1">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">${(order.total || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">
                            {order.paymentStatus || order.status}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard title="Payment Info">
                    <DetailRow icon={DollarSign} label="Total" value={`$${(order.total || 0).toFixed(2)}`} highlight />
                    <DetailRow icon={DollarSign} label="Subtotal" value={`$${(order.subtotal || subtotal || 0).toFixed(2)}`} />
                    {order.discount > 0 && (
                        <DetailRow icon={Tag} label="Discount" value={`-$${(order.discount || order.discountAmount || 0).toFixed(2)}`} />
                    )}
                    {order.tax > 0 && (
                        <DetailRow icon={Layers} label="Tax" value={`$${(order.tax || 0).toFixed(2)}`} />
                    )}
                    <DetailRow icon={CreditCard} label="Payment Method" value={order.paymentMethod || '-'} />
                    <DetailRow icon={Hash} label="Payment Status" value={order.paymentStatus || '-'} />
                    <DetailRow icon={Info} label="Promo Code" value={order.promoCode || '-'} />
                </InfoCard>

                <InfoCard title="Order Details">
                    <DetailRow icon={Calendar} label="Order Date" value={order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'} />
                    <DetailRow icon={Globe} label="Client IP" value={order.clientIp || '-'} />
                    <DetailRow icon={User} label="User Agent" value={order.userAgent ? order.userAgent.substring(0, 50) + '...' : '-'} />
                    {order.invoiceId && (
                        <DetailRow icon={FileText} label="Invoice" value={typeof order.invoiceId === 'object' ? `#${order.invoiceId.invoiceId || order.invoiceId._id?.substring(0,8)}` : String(order.invoiceId)} />
                    )}
                </InfoCard>
            </div>

            {hasItems && (
                <InfoCard title={`Order Items (${order.items.length})`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-dark-700">
                                    <th className="text-left py-2 pr-3">Product</th>
                                    <th className="text-left py-2 px-3">Cycle</th>
                                    <th className="text-left py-2 px-3">Domain</th>
                                    <th className="text-right py-2 px-3">Setup</th>
                                    <th className="text-right py-2 pl-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="border-b border-dark-700/30">
                                        <td className="py-2.5 pr-3">
                                            <span className="text-white font-medium">{item.productName || item.productId?.name || 'Product'}</span>
                                            {item.productId?.type && (
                                                <p className="text-[10px] text-text-muted">{item.productId.type}</p>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 text-text-muted">{CYCLE_LABELS[item.cycle] || item.cycle || item.billingCycle || '-'}</td>
                                        <td className="py-2.5 px-3 text-text-muted max-w-[120px] truncate">{item.domain || '-'}</td>
                                        <td className="py-2.5 px-3 text-right text-text-muted">${(item.setupFee || 0).toFixed(2)}</td>
                                        <td className="py-2.5 pl-3 text-right font-mono text-white">${(item.total || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" className="text-right pt-3 pr-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Subtotal</td>
                                    <td className="text-right pt-3 pl-3 font-mono text-white">${(order.subtotal || subtotal || 0).toFixed(2)}</td>
                                </tr>
                                {order.discount > 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-right pt-1 pr-3 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                                            Discount{order.discountType ? ` (${order.discountType})` : ''}
                                        </td>
                                        <td className="text-right pt-1 pl-3 font-mono text-red-400">-${(order.discount || order.discountAmount || 0).toFixed(2)}</td>
                                    </tr>
                                )}
                                {order.tax > 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-right pt-1 pr-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">Tax</td>
                                        <td className="text-right pt-1 pl-3 font-mono text-text-muted">${(order.tax || 0).toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="4" className="text-right pt-2 pr-3 text-xs font-bold text-white uppercase tracking-wider border-t border-dark-700">Total</td>
                                    <td className="text-right pt-2 pl-3 font-mono text-white font-bold text-base border-t border-dark-700">${(order.total || 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </InfoCard>
            )}

            {order.notes && (
                <InfoCard title="Notes">
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{order.notes}</p>
                </InfoCard>
            )}
        </div>
    );
}

// ====================== MAIN MODAL ======================

export default function ClientAreaModal({ isOpen, onClose, ticketId }) {
    const [activeTab, setActiveTab] = useState('services');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (isOpen && ticketId) {
            setLoading(true);
            setError(null);
            setSelected(null);
            getClientSummary(ticketId)
                .then(res => setData(res.data))
                .catch(err => setError(err.message || 'Failed to load client data'))
                .finally(() => setLoading(false));
        }
    }, [isOpen, ticketId]);

    const client = data?.client;
    const services = data?.services || [];
    const invoices = data?.invoices || [];
    const orders = data?.orders || [];

    const filteredServices = services.filter(s => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                (s.productName || '').toLowerCase().includes(q) ||
                (s.domain || '').toLowerCase().includes(q)
            );
        }
        return true;
    });

    const handleViewService = (s) => setSelected({ type: 'service', item: s });
    const handleViewInvoice = (inv) => setSelected({ type: 'invoice', item: inv });
    const handleViewOrder = (o) => setSelected({ type: 'order', item: o });
    const handleBack = () => setSelected(null);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={selected ? null : 'Client Area'} size="xl">
            <div className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                        <AlertCircle size={18} className="text-red-400 shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && data && selected && (
                    selected.type === 'service' ? <ServiceDetail service={selected.item} onBack={handleBack} /> :
                    selected.type === 'invoice' ? <InvoiceDetail invoice={selected.item} onBack={handleBack} /> :
                    selected.type === 'order' ? <OrderDetail order={selected.item} onBack={handleBack} /> : null
                )}

                {!loading && data && !selected && (
                    <>
                        {/* Client Profile Header */}
                        <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-600 rounded-2xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                                        <span className="text-xl font-bold text-accent">
                                            {(client?.name || '?')[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{client?.name || 'Unknown Client'}</h3>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-muted">
                                            {client?.email && (
                                                <a href={`mailto:${client.email}`} className="hover:text-accent transition-colors inline-flex items-center gap-1">
                                                    <Mail size={12} /> {client.email}
                                                </a>
                                            )}
                                            {client?.phone && (
                                                <span className="inline-flex items-center gap-1"><Phone size={12} /> {client.phone}</span>
                                            )}
                                            {client?.company && (
                                                <span className="inline-flex items-center gap-1 text-accent"><Building size={12} /> {client.company}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{services.filter(s => s.status === 'active').length}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Active</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{invoices.length}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Invoices</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{orders.length}</p>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Orders</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-dark-700">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const count = tab.key === 'services' ? services.length : tab.key === 'invoices' ? invoices.length : orders.length;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => { setActiveTab(tab.key); setSearch(''); setStatusFilter(''); setSelected(null); }}
                                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === tab.key
                                                ? 'border-accent text-accent'
                                                : 'border-transparent text-text-muted hover:text-text-primary'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-700 text-text-muted">{count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'services' && (
                            <div>
                                <div className="flex gap-3 mb-4">
                                    <div className="relative flex-1">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input type="text" placeholder="Search by product name or domain..." value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent" />
                                    </div>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                        className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent">
                                        <option value="">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </div>

                                {filteredServices.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-dark-700">
                                                    <th className="text-left py-3 px-3 font-medium">Product</th>
                                                    <th className="text-left py-3 px-3 font-medium">Status</th>
                                                    <th className="text-left py-3 px-3 font-medium">Cycle</th>
                                                    <th className="text-right py-3 px-3 font-medium">Amount</th>
                                                    <th className="text-left py-3 px-3 font-medium">Next Due</th>
                                                    <th className="text-left py-3 px-3 font-medium">Domain</th>
                                                    <th className="text-right py-3 px-3 font-medium"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredServices.map(s => (
                                                    <tr key={s._id} className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors cursor-pointer" onClick={() => handleViewService(s)}>
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${
                                                                    s.status === 'active' ? 'bg-green-500' :
                                                                    s.status === 'suspended' ? 'bg-red-500' :
                                                                    s.status === 'pending' ? 'bg-amber-500' : 'bg-gray-500'
                                                                }`} />
                                                                <span className="font-medium text-white">{s.productName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                                                STATUS_COLORS[s.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                            }`}>
                                                                <StatusIcon status={s.status} />
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-text-muted">{CYCLE_LABELS[s.cycle] || s.cycle || '-'}</td>
                                                        <td className="py-3 px-3 text-right font-mono text-white">${(s.recurringAmount || 0).toFixed(2)}</td>
                                                        <td className="py-3 px-3 text-text-muted text-xs">
                                                            {s.nextDueDate ? new Date(s.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                                        </td>
                                                        <td className="py-3 px-3 text-text-muted text-xs max-w-[120px] truncate" title={s.domain}>{s.domain || '-'}</td>
                                                        <td className="py-3 px-3 text-right">
                                                            <span className="text-accent text-xs font-medium">Details →</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-text-muted">
                                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">{services.length === 0 ? 'No services found for this client.' : 'No services match your filters.'}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'invoices' && (
                            <div>
                                {invoices.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-dark-700">
                                                    <th className="text-left py-3 px-3 font-medium">Invoice #</th>
                                                    <th className="text-left py-3 px-3 font-medium">Date</th>
                                                    <th className="text-left py-3 px-3 font-medium">Status</th>
                                                    <th className="text-right py-3 px-3 font-medium">Total</th>
                                                    <th className="text-right py-3 px-3 font-medium"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map(inv => (
                                                    <tr key={inv._id} className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors cursor-pointer" onClick={() => handleViewInvoice(inv)}>
                                                        <td className="py-3 px-3 font-mono text-white text-xs">#{inv.invoiceId || inv._id?.substring(0, 8).toUpperCase()}</td>
                                                        <td className="py-3 px-3 text-text-muted text-xs">{new Date(inv.dateIssued || inv.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                                                        <td className="py-3 px-3 text-right font-mono text-white">${(inv.total || inv.amountDue || 0).toFixed(2)}</td>
                                                        <td className="py-3 px-3 text-right"><span className="text-accent text-xs font-medium">Details →</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-text-muted">
                                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No invoices found for this client.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                {orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-text-muted text-xs uppercase tracking-wider border-b border-dark-700">
                                                    <th className="text-left py-3 px-3 font-medium">Order #</th>
                                                    <th className="text-left py-3 px-3 font-medium">Date</th>
                                                    <th className="text-left py-3 px-3 font-medium">Status</th>
                                                    <th className="text-left py-3 px-3 font-medium">Items</th>
                                                    <th className="text-right py-3 px-3 font-medium">Total</th>
                                                    <th className="text-right py-3 px-3 font-medium"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o._id} className="border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors cursor-pointer" onClick={() => handleViewOrder(o)}>
                                                        <td className="py-3 px-3 font-mono text-white text-xs">#{o.orderNumber || o._id?.substring(0, 8).toUpperCase()}</td>
                                                        <td className="py-3 px-3 text-text-muted text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-3"><StatusBadge status={o.status} /></td>
                                                        <td className="py-3 px-3 text-text-muted text-xs max-w-[150px] truncate">
                                                            {o.items?.length > 0 ? o.items.map(i => i.productName || i.productId?.name).filter(Boolean).join(', ') : '-'}
                                                        </td>
                                                        <td className="py-3 px-3 text-right font-mono text-white">${(o.total || 0).toFixed(2)}</td>
                                                        <td className="py-3 px-3 text-right"><span className="text-accent text-xs font-medium">Details →</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-text-muted">
                                        <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No orders found for this client.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}