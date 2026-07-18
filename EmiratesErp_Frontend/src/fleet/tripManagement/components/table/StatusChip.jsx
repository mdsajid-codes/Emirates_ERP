

const variantStyles = {
  COMPLETED: "bg-success/10 text-success",
  ACTIVE:"bg-success/10 text-success",
  AVAILABLE:"bg-success/10 text-success",
  INACTIVE: "bg-foreground/10 text-foreground-muted",
  INVOICED: "bg-warning/10 text-warning",
  CANCELLED: "bg-error/10 text-error",
  PAID: "bg-info/10 text-info",
  CREATED: "bg-foreground/10 text-foreground-muted",
  IN_PROGRESS: "bg-primary/10 text-primary",
  ON_TRIP: "bg-primary/10 text-primary",
  IN_USE: "bg-warning/10 text-warning",
  UNDER_MAINTENANCE: "bg-error/10 text-error",
  CLOSED: "bg-success/10 text-success",
};

const StatusChip = ({ label, variant = "default" }) => {
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
};

export default StatusChip;