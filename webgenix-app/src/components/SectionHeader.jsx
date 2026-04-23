/**
 * SectionHeader – reusable centred section title + subtitle block.
 * @param {string}  eyebrow   - small label above the title (optional)
 * @param {string}  title     - main heading text
 * @param {string}  subtitle  - body description
 */
export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="section-header-webgenix">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 badge-webgenix badge-ai-webgenix mb-4">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl lg:text-4xl font-semibold text-text-primary leading-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
