import React from 'react';

export const Toggle = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary' : 'bg-background-muted border border-border'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

export const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon, name, defaultValue, required }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground-muted uppercase tracking-wider">{label}</label>
        <div className="relative">
            {Icon && <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />}
            <input
                type={type}
                name={name}
                defaultValue={defaultValue}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-background border border-border rounded-theme py-2 ${Icon ? 'pl-10' : 'px-4'} pr-4 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
            />
        </div>
    </div>
);

export const Badge = ({ children, status }) => {
    const colors = {
        success: 'bg-success/10 text-success border-success/20',
        error: 'bg-error/10 text-error border-error/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        neutral: 'bg-background-muted text-foreground-muted border-border'
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[status] || colors.neutral}`}>
            {children}
        </span>
    );
};
