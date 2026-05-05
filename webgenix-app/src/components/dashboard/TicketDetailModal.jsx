import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { Send, Paperclip, Zap, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPredefinedReplies, toggleWatcher } from '../../services/ticket.service';

export default function TicketDetailModal({ isOpen, onClose, ticket, onUpdate, onReply }) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [status, setStatus] = useState(ticket?.status || 'open');
  const [priority, setPriority] = useState(ticket?.priority || 'medium');
  const [predefinedReplies, setPredefinedReplies] = useState([]);
  const [isWatching, setIsWatching] = useState(ticket?.watchers?.includes(user?._id));

  const isStaff = ['admin', 'support', 'billing', 'lead'].includes(user?.role);

  useEffect(() => {
    if (isStaff && isOpen) {
      const fetchReplies = async () => {
        try {
          const response = await getPredefinedReplies(ticket?.department?._id);
          setPredefinedReplies(response.data);
        } catch (error) {
          console.error('Error fetching predefined replies', error);
        }
      };
      fetchReplies();
    }
  }, [isOpen, isStaff, ticket?.department?._id]);

  if (!ticket) return null;

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onReply(ticket._id, { message: replyText, isInternal });
    setReplyText('');
  };

  const handleUpdate = async () => {
    await onUpdate(ticket._id, { status, priority });
  };

  const handleToggleWatch = async () => {
    try {
      await toggleWatcher(ticket._id);
      setIsWatching(!isWatching);
    } catch (error) {
      console.error('Error toggling watcher', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket._id?.substring(0, 6).toUpperCase()}`} size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Header Info */}
        <div className="bg-dark-900 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 border border-dark-700">
          <div>
            <p className="text-xs text-text-muted mb-1">Client</p>
            <p className="text-sm font-medium">{ticket.client?.name || 'Unknown'}</p>
            {ticket.client?.email && (
              <p className="text-xs text-text-muted mt-1">{ticket.client.email}</p>
            )}
            {ticket.client?._id && (
              <Link 
                to={`/admin/clients?clientId=${ticket.client._id}`}
                className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 mt-1"
              >
                <ExternalLink size={12} />
                View Client Area
              </Link>
            )}
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Department</p>
            <p className="text-sm font-medium">{ticket.department?.name || ticket.department || 'General'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Status</p>
            <select 
              value={status.toUpperCase()} 
              onChange={(e) => setStatus(e.target.value)}
              onBlur={handleUpdate}
              className="bg-dark-800 text-sm border border-dark-600 rounded px-2 py-1 w-full uppercase"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ANSWERED">Answered</option>
              <option value="CLIENT_REPLY">Client Reply</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="WAITING_FOR_3RD_PARTY">Waiting for 3rd Party</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Priority</p>
            <select 
              value={priority.toUpperCase()} 
              onChange={(e) => setPriority(e.target.value)}
              onBlur={handleUpdate}
              className="bg-dark-800 text-sm border border-dark-600 rounded px-2 py-1 w-full uppercase"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
          {/* Initial Message */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-accent">{ticket.client?.name}</span>
                {ticket.client?.email && (
                  <span className="text-xs text-text-muted ml-2">({ticket.client.email})</span>
                )}
              </div>
              <span className="text-xs text-text-muted">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Replies */}
          {ticket.messages?.map((msg, idx) => (
            <div 
              key={idx} 
              className={`rounded-xl p-4 border ${
                msg.isInternal 
                  ? 'bg-warning/10 border-warning/20' 
                  : msg.senderRole === 'client' 
                    ? 'bg-dark-800 border-dark-700' 
                    : 'bg-accent/5 border-accent/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${msg.senderRole === 'client' ? 'text-text-primary' : 'text-accent'}`}>
                    {msg.sender?.name || 'Staff'}
                  </span>
                  {msg.isInternal && (
                    <span className="text-xs bg-warning text-dark-900 px-2 py-0.5 rounded font-bold">Internal Note</span>
                  )}
                </div>
                <span className="text-xs text-text-muted">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>

        {/* Reply Input */}
        <form onSubmit={handleSubmitReply} className="border-t border-dark-700 pt-4">
          <div className="mb-2 flex items-center justify-between">
            {['admin', 'support', 'billing'].includes(user?.role) && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isInternal} 
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="checkbox-webgenix"
                />
                <span className="text-sm text-text-secondary">Internal Note (Staff only)</span>
              </label>
            )}
            
            {isStaff && predefinedReplies.length > 0 && (
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={handleToggleWatch}
                  className={`flex items-center gap-2 text-xs font-medium transition-colors ${isWatching ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
                  title={isWatching ? "You are watching this ticket" : "Watch this ticket"}
                >
                  {isWatching ? <Eye size={14} /> : <EyeOff size={14} />}
                  {isWatching ? 'Watching' : 'Watch'}
                </button>
                
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-accent" />
                  <select 
                    className="bg-transparent text-xs text-text-secondary border-none focus:ring-0 cursor-pointer hover:text-accent transition-colors"
                    onChange={(e) => {
                      const reply = predefinedReplies.find(r => r._id === e.target.value);
                      if (reply) setReplyText(prev => prev ? `${prev}\n\n${reply.content}` : reply.content);
                      e.target.value = ""; // Reset
                    }}
                  >
                    <option value="">Insert Macro...</option>
                    {predefinedReplies.map(reply => (
                      <option key={reply._id} value={reply._id}>{reply.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <textarea
              className={`input-webgenix pr-12 min-h-[100px] resize-none ${isInternal ? 'bg-warning/5 border-warning/30 focus:border-warning' : ''}`}
              placeholder={isInternal ? "Write an internal note..." : "Write your reply..."}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button type="button" className="p-2 text-text-muted hover:text-text-primary transition-colors">
                <Paperclip size={18} />
              </button>
              <button 
                type="submit" 
                disabled={!replyText.trim()}
                className="p-2 bg-accent text-white rounded-lg disabled:opacity-50 hover:bg-accent-hover transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
