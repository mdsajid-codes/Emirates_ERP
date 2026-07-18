

const amountColorMap = {
  danger: "text-error",
  warning: "text-warning",
  default: "text-foreground",
};

const PendingPaymentsCard = ({
  title = "Pending Payments",
  payments = [],
  onSendReminders,
}) => {
  return (
    <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden w-full max-w-md">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background-muted">
        <h2 className="text-xl font-black text-primary uppercase tracking-tight">
          {title}
        </h2>
      </div>

      {/* List */}
      <div className="p-4 space-y-3">
        {payments.map((item, index) => (
          <div
            key={index}
            className="bg-background rounded-theme p-4 border border-border/50 flex justify-between items-center hover:bg-background-muted transition-colors shadow-sm group"
          >
            {/* Left Side */}
            <div>
              <p className="text-sm font-bold text-foreground">
                {item.company}
              </p>
              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-1">
                {item.subtitle}
              </p>
            </div>

            {/* Right Side */}
            <div className="text-right">
              <p
                className={`text-lg font-black ${
                  amountColorMap[item.amountVariant || "default"]
                } tracking-tight`}
              >
                {item.amount}
              </p>
              <p className="text-[10px] font-bold text-foreground-muted mt-1 uppercase tracking-widest">AED</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <div className="px-4 pb-6">
        <button
          onClick={onSendReminders}
          className="w-full bg-primary hover:opacity-90 text-primary-foreground py-3 rounded-theme text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-primary/20"
        >
          Send Payment Reminders
        </button>
      </div>
    </div>
  );
};

export default PendingPaymentsCard;