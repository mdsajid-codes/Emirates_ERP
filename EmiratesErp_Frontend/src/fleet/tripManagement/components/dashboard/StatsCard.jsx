import React from "react";

const StatsCard = ({ title, value, subtitle, variant = 'primary' }) => {
  const variantColors = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
  };

  const accentColor = variantColors[variant] || variantColors.primary;

  return (
    <div
      className="relative bg-card rounded-theme shadow-sm p-6 overflow-hidden group transition-all duration-300 hover:shadow-md border border-border"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-1">
          {title}
        </p>

        <h2 className="text-2xl font-black text-foreground tracking-tight">
          {value}
        </h2>

        {subtitle && (
          <p className="text-xs font-bold text-foreground-muted mt-2 opacity-80">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Subtle Background Icon Decoration could go here */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-110"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
};

export default StatsCard;