import { Search } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange, searchValue, onSearchChange, searchPlaceholder = "Search..." }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {onSearchChange && (
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-text-muted" />
          </div>
          <input
            type="text"
            className="input-webgenix pl-10"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      
      {filters && filters.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {filters.map((filter, idx) => (
            <select
              key={idx}
              className="input-webgenix py-2 bg-dark-800 cursor-pointer min-w-[150px]"
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt, i) => (
                <option key={i} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
