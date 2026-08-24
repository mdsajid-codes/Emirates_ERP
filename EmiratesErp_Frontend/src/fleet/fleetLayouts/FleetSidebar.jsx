import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutGrid,
  Truck,
  Users,
  Briefcase,
  Store,
  Navigation,
  ClipboardList,
  Wrench,
  Fuel,
  FileText,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const fleetTabs = [
  { nameKey: 'fleet.nav.dashboard', defaultName: 'Dashboard', icon: LayoutGrid, href: '/fleet-dashboard/dashboard' },
  { nameKey: 'fleet.nav.vehicles', defaultName: 'Vehicles', icon: Truck, href: '/fleet-dashboard/vehicles' },
  { nameKey: 'fleet.nav.drivers', defaultName: 'Drivers', icon: Users, href: '/fleet-dashboard/drivers' },
  { nameKey: 'fleet.nav.customers', defaultName: 'Customers', icon: Briefcase, href: '/fleet-dashboard/trip-customers' },
  { nameKey: 'fleet.nav.vendors', defaultName: 'Vendors', icon: Store, href: '/fleet-dashboard/trip-vendors' },
  { nameKey: 'fleet.nav.trips', defaultName: 'Trips', icon: Navigation, href: '/fleet-dashboard/trips' },
  { nameKey: 'fleet.nav.dispatch', defaultName: 'Dispatch', icon: ClipboardList, href: '/fleet-dashboard/dispatch' },
  { nameKey: 'fleet.nav.routes', defaultName: 'Routes', icon: Navigation, href: '/fleet-dashboard/routes' },
  { nameKey: 'fleet.nav.maintenance', defaultName: 'Maintenance', icon: Wrench, href: '/fleet-dashboard/maintenance' },
  { nameKey: 'fleet.nav.fuel', defaultName: 'Fuel', icon: Fuel, href: '/fleet-dashboard/fuel' },
  { nameKey: 'fleet.nav.invoices', defaultName: 'Invoices', icon: FileText, href: '/fleet-dashboard/invoices' },
  { nameKey: 'fleet.nav.reports', defaultName: 'Reports', icon: BarChart3, href: '/fleet-dashboard/trip-reports' },
  { nameKey: 'fleet.nav.compliance', defaultName: 'Doc Track', icon: ShieldCheck, href: '/fleet-dashboard/compliance' },
  { nameKey: 'fleet.nav.complaints', defaultName: 'Complaints', icon: AlertTriangle, href: '/fleet-dashboard/complaints' },
  { nameKey: 'fleet.nav.performance', defaultName: 'Performance', icon: Trophy, href: '/fleet-dashboard/performance' },
  { nameKey: 'fleet.nav.settings', defaultName: 'Settings', icon: Settings, href: '/company-settings' },
];

export default function FleetSidebar({ onLinkClick, companyLogo }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full bg-[#003E5B] text-[#F2F5FA] w-[80px] shrink-0 select-none">
      {/* Top Logo Container */}
      <div className="w-[80px] h-[64px] bg-white border-r border-[#F2F5FA] flex items-center justify-center shrink-0">
        <Link to="/company-dashboard" className="flex items-center justify-center">
          <img
            src={companyLogo || "/icon.svg"}
            alt="Logo"
            className="w-[31px] h-[38px] object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = "/icon.svg"; }}
          />
        </Link>
      </div>

      {/* Navigation Items (Vertical Icon Stack matching Sales) */}
      <nav className="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar relative">
        {fleetTabs.map((item) => {
          const label = t(item.nameKey) || item.defaultName;

          return (
            <NavLink
              key={item.nameKey}
              to={item.href}
              onClick={onLinkClick}
              end={item.href === '/fleet-dashboard/dashboard'}
              title={label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-1 rounded-[8px] transition-all duration-200 w-[64px] h-[51.75px] group ${
                  isActive
                    ? 'bg-[#00A9A8] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.1)] font-semibold'
                    : 'text-[#F2F5FA] hover:bg-white/10 opacity-90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-[18px] w-[18px] transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#F2F5FA]'}`} />
                  <span className={`text-[9px] leading-[14px] font-normal tracking-tight text-center mt-1 truncate max-w-full ${isActive ? 'text-white font-medium' : 'text-[#F2F5FA]'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Support Section */}
      <div className="py-4 border-t border-white/20 flex flex-col items-center gap-1 shrink-0">
        <button className="flex flex-col items-center justify-center text-[#F2F5FA] hover:text-white transition-colors group cursor-pointer">
          <HelpCircle className="h-[18px] w-[18px] text-[#F2F5FA] group-hover:scale-110 transition-transform" />
          <span className="text-[9px] leading-[14px] font-normal text-[#F2F5FA] mt-1">{t('fleet.nav.support') || 'Support'}</span>
        </button>
      </div>
    </div>
  );
}
