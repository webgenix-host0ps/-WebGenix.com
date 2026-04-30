import { useState } from 'react';
import Modal from './Modal';
import { Plus, Trash2 } from 'lucide-react';

export default function InvoiceFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [formData, setFormData] = useState(initialData || {
    clientId: '',
    items: [{ description: '', amount: 0, quantity: 1 }],
    dueDate: '',
    taxRate: 0,
    notes: ''
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: 0, quantity: 1 }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.amount) * Number(item.quantity)), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (Number(formData.taxRate) / 100);
    return subtotal + tax;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...formData,
      subtotal: calculateSubtotal(),
      total: calculateTotal()
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Invoice' : 'Generate Invoice'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Client ID</label>
            <input 
              type="text" 
              required
              className="input-webgenix" 
              value={formData.clientId}
              onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              placeholder="Enter client ID or select..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Due Date</label>
            <input 
              type="date" 
              required
              className="input-webgenix" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-secondary">Line Items</label>
            <button type="button" onClick={addItem} className="text-accent hover:text-accent-hover text-sm flex items-center gap-1">
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-dark-900 p-3 rounded-xl border border-dark-700">
                <div className="flex-1">
                  <input 
                    type="text" 
                    required
                    placeholder="Description" 
                    className="input-webgenix"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="Qty" 
                    className="input-webgenix"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    placeholder="Price" 
                    className="input-webgenix"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeItem(index)}
                  className="p-2.5 text-error hover:bg-error/10 rounded-lg transition-colors mt-0.5"
                  disabled={formData.items.length === 1}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Notes / Terms</label>
            <textarea 
              className="input-webgenix min-h-[120px]" 
              placeholder="Payment terms, thank you message..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          
          <div className="bg-dark-900 p-4 rounded-xl border border-dark-700 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal:</span>
              <span className="text-text-primary">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Tax Rate (%):</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                className="input-webgenix w-20 py-1 px-2 text-right" 
                value={formData.taxRate}
                onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
              />
            </div>
            <div className="border-t border-dark-700 pt-3 flex justify-between font-bold text-lg text-text-primary">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
          <button type="button" onClick={onClose} className="btn-webgenix btn-secondary-webgenix btn-md-webgenix">
            Cancel
          </button>
          <button type="submit" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
            {initialData ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
