import React from 'react';

export default function AuthInput({ label, id, type = 'text', placeholder, value, onChange, error, icon: Icon, required = false, ...props }) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <label htmlFor={id} className="text-[13px] font-semibold text-text-secondary group-focus-within:text-accent transition-colors flex items-center gap-1">
        {label} {required && <span className="text-error font-bold">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-all duration-300 pointer-events-none">
            <Icon size={20} strokeWidth={1.5} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input-webgenix ${Icon ? 'pl-12' : ''} ${error ? 'border-error/50 focus:border-error focus:box-shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : ''}`}
          required={required}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1 animate-fade-in-fast">
          <div className="w-1 h-1 rounded-full bg-error" />
          <span className="text-xs font-medium text-error">{error}</span>
        </div>
      )}
    </div>
  );
}
