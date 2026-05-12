export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
    const variants = {
        card: () => (
            <div className={`bg-white/[0.03] border border-white/[0.06] rounded-[32px] p-8 animate-pulse ${className}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5"></div>
                    <div className="w-16 h-4 rounded-lg bg-white/5"></div>
                </div>
                <div className="w-24 h-8 bg-white/5 rounded-lg mb-2"></div>
                <div className="w-32 h-3 bg-white/5 rounded-lg"></div>
            </div>
        ),
        table: () => (
            <div className={`animate-pulse ${className}`}>
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 border-b border-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg bg-white/5"></div>
                        <div className="flex-1 space-y-2">
                            <div className="w-3/4 h-4 bg-white/5 rounded-lg"></div>
                            <div className="w-1/2 h-3 bg-white/5 rounded-lg"></div>
                        </div>
                        <div className="w-16 h-6 rounded-lg bg-white/5"></div>
                    </div>
                ))}
            </div>
        ),
        list: () => (
            <div className={`animate-pulse space-y-4 ${className}`}>
                {[...Array(count)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.06]">
                        <div className="w-12 h-12 rounded-xl bg-white/5"></div>
                        <div className="flex-1 space-y-2">
                            <div className="w-1/2 h-4 bg-white/5 rounded-lg"></div>
                            <div className="w-1/3 h-3 bg-white/5 rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        ),
        line: () => (
            <div className={`animate-pulse space-y-3 ${className}`}>
                {[...Array(count)].map((_, i) => (
                    <div key={i} className={`h-4 bg-white/5 rounded-lg ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`}></div>
                ))}
            </div>
        ),
    };

    const renderVariant = variants[type] || variants.card;

    if (type === 'table' || type === 'line') {
        return <>{renderVariant()}</>;
    }

    return (
        <div className={`grid gap-6 ${count > 1 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-' + Math.min(count, 4) : ''}`}>
            {[...Array(count)].map((_, i) => (
                <div key={i}>{renderVariant()}</div>
            ))}
        </div>
    );
}
