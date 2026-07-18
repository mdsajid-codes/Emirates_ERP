import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Truck,
  Users,
  Navigation,
  Settings,
  LogOut,
  ArrowLeft,
  Wrench,
  ClipboardList,
  Fuel,
  AlertTriangle,
  Trophy,
  Briefcase,
  Store,
  FileText,
  BarChart3, ShieldCheck
} from "lucide-react";
import { logout } from "../../utils/logout.js";

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
      { name: "Vehicles Master", icon: Truck, href: "/fleet-dashboard/vehicles" },
      { name: "Drivers Master", icon: Users, href: "/fleet-dashboard/drivers" },
      { name: "Customers Master", icon: Briefcase, href: "/fleet-dashboard/trip-customers" },
      { name: "Vendors Master", icon: Store, href: "/fleet-dashboard/trip-vendors" },
    ]
  },
  {
    label: "Operations",
    links: [
      { name: "Trips", icon: Navigation, href: "/fleet-dashboard/trips" },
      { name: "Dispatch", icon: ClipboardList, href: "/fleet-dashboard/dispatch" },
      { name: "Routes", icon: Navigation, href: "/fleet-dashboard/routes" },
      { name: "Maintenance", icon: Wrench, href: "/fleet-dashboard/maintenance" },
      { name: "Fuel", icon: Fuel, href: "/fleet-dashboard/fuel" },
    ]
  },
  {
    label: "Finance",
    links: [
      { name: "Invoices", icon: FileText, href: "/fleet-dashboard/invoices" },
      { name: "Reports", icon: BarChart3, href: "/fleet-dashboard/trip-reports" },
    ]
  },
  {
    label: "Monitoring",
    links: [
      { name: "Document tracking", icon: ShieldCheck, href: "/fleet-dashboard/compliance" },
      { name: "Complaints", icon: AlertTriangle, href: "/fleet-dashboard/complaints" },
      { name: "Performance", icon: Trophy, href: "/fleet-dashboard/performance" },
    ]
  },
];

export default function FleetSidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => logout(navigate);

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text w-64 border-r border-border">
      {/* Header removed as it is now in the top navbar */}

      {/* Nav */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {zones.map((zone, idx) => (
          <div key={idx} className={zone.label ? "pt-4" : ""}>
            {zone.label && (
              <p className="px-4 text-[9px] font-black text-sidebar-text/40 uppercase tracking-widest mb-2">
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
                    flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-theme transition-all mb-1
                    ${isActive
                      ? "bg-sidebar-active text-sidebar-text font-bold shadow-sm"
                      : "text-sidebar-text opacity-80 hover:opacity-100 hover:bg-sidebar-hover"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? "text-sidebar-text" : "text-sidebar-text/70"} />
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
      <div className="p-3 border-t border-sidebar-text/10 space-y-1">
        <NavLink
          to="/company-settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sidebar-text text-sm font-medium rounded-theme opacity-80 hover:opacity-100 hover:bg-sidebar-hover transition"
        >
          <Settings size={18} className="text-sidebar-text/70" />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/10 rounded-theme w-full text-left transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
