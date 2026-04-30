import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function ActionMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-dark-700 text-text-secondary hover:text-text-primary transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl py-1 z-50">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2
                ${action.danger ? 'text-error hover:bg-error/10' : 'text-text-primary hover:bg-dark-700'}
              `}
            >
              {action.icon && <action.icon size={16} />}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
