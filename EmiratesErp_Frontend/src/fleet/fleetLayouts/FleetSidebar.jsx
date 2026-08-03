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
  BarChart3,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { logout } from "../../utils/logout.js";

const zones = [
  {
    label: null,
    links: [
      { name: "Dashboard", icon: LayoutGrid, href: "/fleet-dashboard/dashboard", iconBg: "bg-sky-500/35 text-sky-300" },
    ]
  },
  {
    label: "Master Data",
    links: [
      { name: "Vehicles Master", icon: Truck, href: "/fleet-dashboard/vehicles", iconBg: "bg-indigo-500/35 text-indigo-300" },
      { name: "Drivers Master", icon: Users, href: "/fleet-dashboard/drivers", iconBg: "bg-blue-500/35 text-blue-300" },
      { name: "Customers Master", icon: Briefcase, href: "/fleet-dashboard/trip-customers", iconBg: "bg-purple-500/35 text-purple-300" },
      { name: "Vendors Master", icon: Store, href: "/fleet-dashboard/trip-vendors", iconBg: "bg-teal-500/35 text-teal-300" },
    ]
  },
  {
    label: "Operations",
    links: [
      { name: "Trips", icon: Navigation, href: "/fleet-dashboard/trips", iconBg: "bg-emerald-500/35 text-emerald-300" },
      { name: "Dispatch", icon: ClipboardList, href: "/fleet-dashboard/dispatch", iconBg: "bg-cyan-500/35 text-cyan-300" },
      { name: "Routes", icon: Navigation, href: "/fleet-dashboard/routes", iconBg: "bg-lime-500/35 text-lime-300" },
      { name: "Maintenance", icon: Wrench, href: "/fleet-dashboard/maintenance", iconBg: "bg-orange-500/35 text-orange-300" },
      { name: "Fuel", icon: Fuel, href: "/fleet-dashboard/fuel", iconBg: "bg-amber-500/35 text-amber-300" },
    ]
  },
  {
    label: "Finance",
    links: [
      { name: "Invoices", icon: FileText, href: "/fleet-dashboard/invoices", iconBg: "bg-rose-500/35 text-rose-300" },
      { name: "Reports", icon: BarChart3, href: "/fleet-dashboard/trip-reports", iconBg: "bg-fuchsia-500/35 text-fuchsia-300" },
    ]
  },
  {
    label: "Monitoring",
    links: [
      { name: "Document tracking", icon: ShieldCheck, href: "/fleet-dashboard/compliance", iconBg: "bg-sky-600/35 text-sky-300" },
      { name: "Complaints", icon: AlertTriangle, href: "/fleet-dashboard/complaints", iconBg: "bg-red-500/35 text-red-300" },
      { name: "Performance", icon: Trophy, href: "/fleet-dashboard/performance", iconBg: "bg-yellow-500/35 text-yellow-300" },
    ]
  },
];

export default function FleetSidebar({ onClose, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) {
  const navigate = useNavigate();
  const handleLogout = () => logout(navigate);

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text w-full select-none">
      {/* Header section with pin toggle button matching POS position */}
      <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Truck className="h-4 w-4 text-white fill-current" />
          </div>
          {!isCollapsedMode && (
            <span className="text-sm font-extrabold text-white tracking-tight truncate">Fleet Hub</span>
          )}
        </div>
        {setIsDesktopCollapsed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDesktopCollapsed(prev => !prev);
            }}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-xl opacity-80 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="h-5 w-5 text-gray-300" /> : <PanelLeftClose className="h-5 w-5 text-gray-300" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
        {/* Back to Hub */}
        <NavLink
          to="/company-dashboard"
          onClick={onClose}
          title={isCollapsedMode ? "Back to Company Hub" : undefined}
          className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10`}
        >
          <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </div>
          {!isCollapsedMode && <span className="ml-2.5 truncate">Back to Hub</span>}
        </NavLink>

        {zones.map((zone, idx) => (
          <div key={idx} className={zone.label ? "pt-2" : ""}>
            {zone.label && !isCollapsedMode && (
              <p className="px-2 text-[9px] font-black text-sidebar-text/40 uppercase tracking-widest mb-1.5">
                {zone.label}
              </p>
            )}
            {zone.label && isCollapsedMode && (
              <div className="h-px bg-white/10 my-2 mx-1" />
            )}
            {zone.links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  title={isCollapsedMode ? item.name : undefined}
                  className={({ isActive }) => `
                    flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-1 group
                    ${isActive
                      ? "bg-sidebar-active/20 text-sidebar-text shadow-sm"
                      : "text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                        <Icon className="h-4 w-4 stroke-[2.5] transition-transform group-hover:scale-110" />
                      </div>
                      {!isCollapsedMode && (
                        <span className={`ml-2.5 truncate ${isActive ? 'font-bold text-sidebar-text' : ''}`}>{item.name}</span>
                      )}
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
          title={isCollapsedMode ? "Settings" : undefined}
          className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sidebar-text/80 hover:text-sidebar-text text-sm font-bold rounded-xl hover:bg-sidebar-hover transition group`}
        >
          <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
            <Settings className="h-4 w-4 stroke-[2.5]" />
          </div>
          {!isCollapsedMode && <span className="ml-2.5 truncate">Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={isCollapsedMode ? "Logout" : undefined}
          className={`flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl w-full text-left transition group`}
        >
          <div className="p-1.5 rounded-full bg-rose-500/35 text-rose-300 flex items-center justify-center flex-shrink-0">
            <LogOut className="h-4 w-4 stroke-[2.5]" />
          </div>
          {!isCollapsedMode && <span className="ml-2.5 truncate">Logout</span>}
        </button>
      </div>
    </div>
  );
}
