import Badge from './Badge';

/**
 * ServiceCard – renders a single service/package card.
 *
 * Supports two shapes from the JSON data:
 *  - "package" shape: { name, tagline, price, target, features, cta, badge, isRecommended }
 *  - "simple"  shape: { name, startingPrice, features, cta, badge }
 */
export default function ServiceCard({ card, index = 0 }) {
  const isPackage = !!card.price;
  const delay = Math.min(index * 100, 500);

  return (
    <article
      className={`card-webgenix card-webgenix-hover flex flex-col h-full relative animate-fade-in-webgenix delay-${delay} ${
        card.isRecommended
          ? 'border-accent/40 shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] bg-gradient-to-b from-accent/[0.03] to-transparent'
          : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`${card.name} service card`}
    >
      {/* Recommended ribbon */}
      {card.isRecommended && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-accent/25 z-10 whitespace-nowrap flex items-center gap-1.5"
          aria-label="Recommended plan"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Recommended
        </div>
      )}

      {/* Card header */}
      <div className="mb-6">
        {/* Badge row */}
        {card.badge && !card.isRecommended && (
          <div className="mb-4">
            <Badge
              type={
                card.badge === 'Most Popular' || card.badge === 'Recommended' || card.badge === 'Best for Beginners'
                  ? 'popular'
                  : card.badge === 'comingSoon'
                  ? 'comingSoon'
                  : 'default'
              }
              label={card.badge}
            />
          </div>
        )}

        <h3
          className="text-xl font-bold text-text-primary mb-1.5 tracking-tight"
          id={`service-${card.id}`}
        >
          {card.name}
        </h3>

        {card.tagline && (
          <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2">{card.tagline}</p>
        )}

        {card.target && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 px-1.5 py-0.5 rounded bg-accent/10">Target</span>
            <p className="text-[12px] font-medium text-text-muted">{card.target}</p>
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-8">
        {isPackage ? (
          <div>
            {card.price.setup && (
              <p className="text-[11px] font-semibold text-text-muted mb-1 tracking-wide">
                ₹{card.price.setup.toLocaleString('en-IN')} SETUP +
              </p>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-text-primary tracking-tighter">
                {card.price.currency}
                {card.price.startingFrom.toLocaleString('en-IN')}
              </span>
              <span className="text-[15px] font-medium text-text-muted">{card.price.period}</span>
            </div>
            {card.price.recurring && (
              <p className="text-[12px] font-medium text-text-muted mt-1.5">
                then ₹{card.price.recurring.toLocaleString('en-IN')}/mo
              </p>
            )}
          </div>
        ) : card.startingPrice ? (
          <div className="pt-2">
            <p className="text-[11px] text-text-muted mb-1.5 uppercase tracking-widest font-bold">
              Starting from
            </p>
            <p className="text-3xl font-extrabold text-text-primary tracking-tight">{card.startingPrice}</p>
          </div>
        ) : null}
      </div>

      {/* Features */}
      {card.features && card.features.length > 0 && (
        <div className="flex flex-col flex-1">
          <div className="h-px w-full bg-gradient-to-right from-dark-600 to-transparent mb-6" />
          <ul className="flex flex-col gap-3.5 mb-8 flex-1" aria-labelledby={`service-${card.id}`}>
            {card.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[14px] text-text-secondary leading-snug">
                <CheckIcon />
                <span className="group-hover:text-text-primary transition-colors">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {card.cta && (
        <a
          href={card.cta.link || '#'}
          className={`btn-webgenix btn-md-webgenix w-full font-bold tracking-wide py-4 rounded-xl ${
            card.isRecommended
              ? 'btn-primary-webgenix shadow-lg shadow-accent/20'
              : 'btn-secondary-webgenix hover:bg-dark-700'
          }`}
          aria-label={`${card.cta.label} – ${card.name}`}
        >
          {card.cta.label}
        </a>
      )}
    </article>
  );
}

function CheckIcon() {
  return (
    <div className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 text-accent">
      <svg
        className="w-3 h-3"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.5 8.5l3 3 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
