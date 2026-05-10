import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { adminService } from '../../services/admin.service';
import { ShieldCheck, Plus, Trash2, Edit, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaxSettings() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', rate: 0, jurisdiction: '', type: 'exclusive', hsnCode: '', isDefault: false });
  const [savingRule, setSavingRule] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await adminService.getTaxRules();
      setRules(response.data || []);
    } catch (error) {
      toast.error('Failed to load tax rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.name || !newRule.jurisdiction) return toast.error('Name and Jurisdiction are required');
    setSavingRule(true);
    try {
      await adminService.createTaxRule(newRule);
      toast.success('Tax rule added successfully');
      setShowAddRule(false);
      setNewRule({ name: '', rate: 0, jurisdiction: '', type: 'exclusive', hsnCode: '', isDefault: false });
      fetchRules();
    } catch (error) {
      toast.error('Failed to add tax rule');
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-webgenix">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Compliance</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Tax & GST Settings</h1>
            <p className="text-text-secondary text-sm mt-1">Configure tax rules, HSN codes and jurisdiction rates</p>
          </div>
          
          <button 
            onClick={() => setShowAddRule(true)}
            className="bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-accent/20 flex items-center gap-2 self-start"
          >
            <Plus size={14} />
            Add Tax Rule
          </button>
        </div>

        {/* GST Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-4">
          <AlertCircle className="text-blue-400 shrink-0" size={20} />
          <div>
            <p className="text-sm font-bold text-white">Indian GST Compliance</p>
            <p className="text-xs text-text-secondary mt-1">
              Ensure you have separate rules for IGST (Inter-state) and CGST/SGST (Intra-state). 
              The system will automatically apply rules based on the client's state.
            </p>
          </div>
        </div>

        {/* Tax Rules Table */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Configured Rules</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck size={40} className="mx-auto text-text-muted mb-4 opacity-20" />
              <p className="text-text-secondary italic">No tax rules configured. Taxes will not be applied to invoices.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Rule Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Jurisdiction</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rules.map(rule => (
                    <tr key={rule._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{rule.name}</p>
                          {rule.isDefault && <CheckCircle2 size={12} className="text-accent" />}
                        </div>
                        <p className="text-[10px] text-text-muted uppercase tracking-tighter">HSN: {rule.hsnCode || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-text-secondary">{rule.jurisdiction}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white">{rule.rate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-text-muted uppercase">{rule.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted">
                            <Edit size={14} />
                          </button>
                          <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Tax Rule Modal */}
      {showAddRule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Tax Rule</h3>
            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Rule Name</label>
                <input 
                  type="text" 
                  value={newRule.name}
                  onChange={e => setNewRule({...newRule, name: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. IGST 18%"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Rate (%)</label>
                  <input 
                    type="number" 
                    value={newRule.rate}
                    onChange={e => setNewRule({...newRule, rate: Number(e.target.value)})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={newRule.type}
                    onChange={e => setNewRule({...newRule, type: e.target.value})}
                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  >
                    <option value="exclusive">Exclusive</option>
                    <option value="inclusive">Inclusive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Jurisdiction</label>
                <input 
                  type="text" 
                  value={newRule.jurisdiction}
                  onChange={e => setNewRule({...newRule, jurisdiction: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. India, Global, or State name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">HSN / SAC Code</label>
                <input 
                  type="text" 
                  value={newRule.hsnCode}
                  onChange={e => setNewRule({...newRule, hsnCode: e.target.value})}
                  className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none"
                  placeholder="e.g. 9983"
                />
              </div>
              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={newRule.isDefault}
                  onChange={e => setNewRule({...newRule, isDefault: e.target.checked})}
                  className="w-4 h-4 rounded bg-dark-800 border-white/10 text-accent focus:ring-accent"
                />
                <label htmlFor="isDefault" className="text-sm text-white">Set as default for this jurisdiction</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddRule(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingRule}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent/80 text-white rounded-xl text-xs font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {savingRule ? 'Saving...' : 'Add Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
