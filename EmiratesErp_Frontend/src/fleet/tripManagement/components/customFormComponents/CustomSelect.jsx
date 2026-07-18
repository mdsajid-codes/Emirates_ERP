const CustomSelect = ({ label, children, ...props }) => {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-foreground-muted uppercase tracking-widest px-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full border border-border rounded-theme px-4 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
      >
        {children}
      </select>
    </div>
  );
};

export default CustomSelect;