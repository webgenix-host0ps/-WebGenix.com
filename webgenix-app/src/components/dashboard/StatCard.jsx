export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'accent' }) {
  const colorMap = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    error: 'text-error bg-error/10 border-error/20',
  };

  const currentColors = colorMap[color] || colorMap.accent;

  return (
    <div className="card-webgenix card-webgenix-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-secondary font-medium text-sm">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg border ${currentColors}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-text-primary">{value}</div>
        {trend && (
          <div className={`flex flex-col items-end text-sm ${trend > 0 ? 'text-success' : trend < 0 ? 'text-error' : 'text-text-muted'}`}>
            <span className="font-medium">
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && <span className="text-xs text-text-muted">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
