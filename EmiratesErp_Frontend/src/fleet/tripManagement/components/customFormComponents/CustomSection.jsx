const CustomSection = ({ number, title, special, children }) => {
  return (
    <div className={` ${special ? 'bg-primary/5' : 'bg-card'} rounded-theme shadow-sm border border-border p-6 space-y-6`}>
      <div className="flex items-center gap-3">
        <div 
          className={special ? "w-8 h-8 flex items-center justify-center rounded-theme bg-warning text-white font-black text-xs shadow-sm" : "w-8 h-8 flex items-center justify-center rounded-theme bg-primary/10 text-primary font-black text-xs shadow-sm"}
        >
          {number}
        </div>
        <h2 className="text-xs font-black tracking-widest text-foreground uppercase">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
};

export default CustomSection;