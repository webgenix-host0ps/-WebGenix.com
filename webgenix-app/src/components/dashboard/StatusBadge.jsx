export default function StatusBadge({ status }) {
  const getBadgeClass = (s) => {
    const status = (s || '').toLowerCase();
    switch (status) {
      // Tickets
      case 'open':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'answered':
        return 'bg-success/10 text-success border-success/20';
      case 'client_reply':
        return 'bg-error/10 text-error border-error/20';
      case 'in_progress':
      case 'in-progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'on_hold':
        return 'bg-[#6b7280]/10 text-[#6b7280] border-[#6b7280]/20';
      case 'waiting_for_3rd_party':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20';
      case 'resolved':
      case 'closed':
        return 'bg-success/10 text-success border-success/20';
      
      // Invoices
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'unpaid':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue':
        return 'bg-error/10 text-error border-error/20';
      case 'cancelled':
        return 'bg-dark-600 text-text-muted border-dark-500';

      // Leads
      case 'new':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'contacted':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'negotiation':
        return 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20'; // purple
      case 'won':
        return 'bg-success/10 text-success border-success/20';
      case 'lost':
        return 'bg-error/10 text-error border-error/20';

      // Priority
      case 'high':
        return 'bg-error/10 text-error border-error/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';

      default:
        return 'badge-default-webgenix';
    }
  };

  const formattedStatus = status ? status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';

  return (
    <span className={`badge-webgenix ${getBadgeClass(status)}`}>
      {formattedStatus}
    </span>
  );
}
