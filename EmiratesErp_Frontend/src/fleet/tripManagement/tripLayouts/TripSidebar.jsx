import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Truck,
  Building2,
  Handshake,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { logout } from "../../../utils/logout.js";

const zones = [
  {
    label: null,
    links: [
      { name: "Dashboard", icon: LayoutGrid, href: "/fleet-dashboard/dashboard" },
    ]
  },
  {
    label: "Master Data",
    links: [
      { name: "Customers", icon: Building2, href: "/fleet-dashboard/customers" },
      { name: "Vendors", icon: Handshake, href: "/fleet-dashboard/vendors" },
    ]
  },
  {
    label: "Operations",
    links: [
      { name: "Trips", icon: Truck, href: "/fleet-dashboard/trips" },
    ]
  },
  {
    label: "Finance",
    links: [
      { name: "Invoices", icon: FileText, href: "/fleet-dashboard/invoices" },
      { name: "Reports", icon: BarChart3, href: "/fleet-dashboard/reports" },
    ]
  },
  {
    label: "Monitoring",
    links: [
      { name: "Document tracking", icon: ShieldCheck, href: "/fleet-dashboard/compliance" },
    ]
  },
];

export default function TripSidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => logout(navigate);

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text w-[240px] border-r border-border shadow-sm">
        <div className="p-4 border-b border-border flex-shrink-0">
            <button onClick={() => navigate('/company-dashboard')} className="flex items-center gap-3 w-full text-left group">
                <div className="bg-sidebar-active p-2 rounded-lg group-hover:opacity-80 transition-all shadow-sm">
                    <ArrowLeft className="h-5 w-5 text-sidebar-text" />
                </div>
                <div>
                    <span className="block font-bold text-foreground text-lg tracking-tight">Company Hub</span>
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Back to Dashboard</span>
                </div>
            </button>
        </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {zones.map((zone, idx) => (
          <div key={idx} className={zone.label ? "pt-4" : ""}>
            {zone.label && (
              <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest px-4 mb-2">
                {zone.label}
              </p>
            )}
            {zone.links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-theme transition-all mb-1
                    ${
                      isActive
                        ? "bg-sidebar-active text-sidebar-text shadow-sm border-r-4 border-primary"
                        : "text-foreground-muted hover:bg-sidebar-hover hover:text-foreground"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? "text-primary" : "text-foreground-muted"} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-1">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-foreground-muted text-sm font-semibold rounded-theme hover:bg-sidebar-hover hover:text-foreground transition-all"
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-error hover:bg-error/10 rounded-theme w-full text-left transition-all mt-1"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}