import { useState } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

export default function LeadStatusUpdate({ isOpen, onClose, lead, onUpdate }) {
  const [status, setStatus] = useState(lead?.status || 'new');
  const [notes, setNotes] = useState('');

  if (!lead) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(lead._id, { status, notes: notes ? [...(lead.notes || []), { text: notes }] : lead.notes });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Lead Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Lead Name</label>
          <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg text-text-primary">
            {lead.name} ({lead.email})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Current Status</label>
          <div className="mb-2"><StatusBadge status={lead.status} /></div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">New Status</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="input-webgenix"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="negotiation">Negotiation</option>
            <option value="won">Won (Convert to Client)</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Add Note (Optional)</label>
          <textarea 
            className="input-webgenix min-h-[100px]"
            placeholder="E.g. Called them today, they are interested in premium hosting..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
          <button type="button" onClick={onClose} className="btn-webgenix btn-secondary-webgenix btn-md-webgenix">
            Cancel
          </button>
          <button type="submit" className="btn-webgenix btn-primary-webgenix btn-md-webgenix">
            Update Lead
          </button>
        </div>
      </form>
    </Modal>
  );
}
