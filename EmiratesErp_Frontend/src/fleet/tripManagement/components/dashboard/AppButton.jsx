import cn from '../../../../utils/cn';

export default function AppButton({
  children,
  variant = "primary",
  icon,
  className,
  ...props
}) {
  const base =
    "px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20",
    accent: "bg-accent text-primary-foreground hover:opacity-90 shadow-md shadow-accent/20",
    outline:
      "border border-border text-foreground bg-card hover:bg-background-muted",
    danger: "border border-error text-error hover:bg-error/10",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}