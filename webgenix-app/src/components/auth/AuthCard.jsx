import React from 'react';

export default function AuthCard({ children, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-16">
      <div className="w-full max-w-[440px] card-glass-webgenix animate-fade-in-webgenix relative overflow-hidden">
        {/* Subtle top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-right from-transparent via-accent/30 to-transparent" />
        
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg shadow-accent/20 relative group"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            W
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-3 tracking-tight">{title}</h1>
          <p className="text-text-secondary text-[15px] leading-relaxed max-w-[300px] mx-auto">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
