import StatusChip from "./StatusChip";
import ThemedAvatar from "./ThemedAvatar";

const TableCellRenderer = ({ column, value }) => {
  if (!value) return null;

  if (column.render) {
    return column.render(value);
  }

  switch (column.type) {
    // 🔹 ICON + TITLE + SUBTITLE
    case "avatarTitle":
      return (
        <div className="flex items-center gap-3">
          <ThemedAvatar 
            imageUrl={value.avatar} 
            name={value[column.key]} 
          />
          <div>
            <p className="text-sm font-bold text-foreground">
              {value[column.key]}
            </p>
            {value.subtitle && (
              <p className="text-xs text-foreground-muted">
                {value.subtitle}
              </p>
            )}
          </div>
        </div>
      );

    // 🔹 TITLE + SUBTITLE (No Icon)
    case "titleSubtitle":
      return (
        <div>
          <p className="text-sm font-bold text-foreground">
            {value[column.key]}
          </p>
          {value.subtitle && (
            <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mt-0.5 opacity-70">
              {value.subtitle}
            </p>
          )}
        </div>
      );

    // 🔹 FROM → TO STYLE
    case "route":
      return (
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">
            {value[column.key1]}
          </p>
          <div className="flex items-center gap-1">
             <span className="text-xs font-black text-primary">↓</span>
             <p className="text-sm font-bold text-foreground">
               {value[column.key2]}
             </p>
          </div>
        </div>
      );

    // 🔹 STATUS CHIP
    case "chip":
      return (
        <StatusChip
          label={value[column.key]}
          variant={value[column.key]}
        />
      );
    
    case "active":
      return(
        <StatusChip
          label={value[column.key] ? "ACTIVE" : "INACTIVE"}
          variant={value[column.key] ? "ACTIVE" : "INACTIVE"}
        />
      )
    
    case "actions":
      return (
        <div className="flex items-center gap-2">
          {column.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => action.onClick(value)}
              title={action.title}
              className="p-2 hover:bg-background-muted rounded-theme text-foreground-muted hover:text-primary transition-all active:scale-90"
            >
              {action.label}
            </button>
          ))}
        </div>
      )

    default:
      return (
        <span className="text-sm font-medium text-foreground">
          {value[column.key]}
        </span>
      );
  }
};

export default TableCellRenderer;