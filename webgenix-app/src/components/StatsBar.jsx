/**
 * StatsBar – trust stats row shown at the bottom of the Hero.
 */
const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Expert Support' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '30-Day', label: 'Money Back' },
];

export default function StatsBar() {
  return (
    <div
      className="flex flex-wrap justify-center gap-x-12 gap-y-8 pt-12 mt-12 border-t border-white/5"
      role="list"
      aria-label="Key statistics"
    >
      {stats.map(({ value, label }, idx) => (
        <div key={label} className="flex flex-col items-center gap-1 group" role="listitem">
          <span className="text-3xl lg:text-4xl font-black text-text-primary group-hover:text-accent transition-colors duration-300">
            {value}
          </span>
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
