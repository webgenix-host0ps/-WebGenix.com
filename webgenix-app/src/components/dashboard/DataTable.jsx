import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ 
  columns, 
  data, 
  isLoading, 
  emptyStateMessage = "No data available",
  pagination = null 
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="card-webgenix overflow-hidden p-0 border-dark-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-dark-700 bg-dark-800/50">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-sm font-semibold text-text-secondary whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''}`}
                  onClick={() => handleSort(col.key, col.sortable)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && sortConfig.key === col.key && (
                      <span className="text-accent">
                        {sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    )}
                    {col.sortable && sortConfig.key !== col.key && (
                      <span className="text-dark-600">
                        <ChevronDown size={16} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {isLoading ? (
              // Skeleton loading
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-dark-700 animate-pulse rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, i) => (
                <tr key={i} className="hover:bg-dark-800/50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 text-sm text-text-primary">
                      {col.renderCell ? col.renderCell(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between bg-dark-800/30">
          <span className="text-sm text-text-secondary">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => pagination.onChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded border border-dark-600 disabled:opacity-50 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => pagination.onChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded border border-dark-600 disabled:opacity-50 hover:bg-dark-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
