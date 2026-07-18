import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function formatBreadcrumb(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return ["Dashboard"];
  return segments.map(
    (segment) =>
      segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export default function TripHeader({ onMenuClick }) {
    const location = useLocation();

    const pageName = location.pathname.split("/")[2] || "Dashboard";

  return (
    <header className="h-16 bg-header-bg border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-sm z-20">
      
      {/* Left */}
      <div className="flex items-center justify-between w-full">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-header-text hover:bg-background-muted p-2 rounded-full transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
 
        <div className="flex items-center text-2xl font-black text-header-text uppercase tracking-tight">
            {pageName}
        </div>
 
        {/* Right */}
        <div className=" flex items-center gap-4">
            <div className="hidden md:block text-sm font-bold text-foreground opacity-70">
            Al Noor Transport LLC
            </div>
 
            <div className="h-10 w-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-black shadow-md border-2 border-background">
            MA
            </div>
        </div>
      </div>
 
    </header>
  );
}