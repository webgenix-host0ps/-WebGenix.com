/**
 * Badge – renders the correct badge variant from the theme.
 * @param {string} type - 'popular' | 'comingSoon' | 'ai' | string (default)
 * @param {string} label - display text
 */
export default function Badge({ type, label }) {
  const variantClass =
    type === 'popular'    ? 'badge-popular-webgenix'     :
    type === 'comingSoon' ? 'badge-coming-soon-webgenix'  :
    type === 'ai'         ? 'badge-ai-webgenix'           :
                            'badge-default-webgenix';

  return (
    <span className={`badge-webgenix ${variantClass}`}>
      {label}
    </span>
  );
}
