import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, BarChart3, ChevronRight, ChevronDown, Menu, X, Tags, Building2, Landmark, Package, Calculator, Building, ShieldCheck, LogOut, CreditCard, Scale, Building as Bank, GitMerge, WalletCards, ArrowLeft, PanelLeftOpen, PanelLeftClose, Landmark as AccountingIcon } from 'lucide-react';

const NAV_ITEMS = [
  {
    group: 'Master Data',
    items: [
      { label: 'Chart of Accounts', to: '/account-dashboard/chart-of-accounts', icon: BookOpen, iconBg: 'bg-green-500/35 text-green-300' },
    ]
  },
  {
    group: 'GL Configuration',
    items: [
      { label: 'Item GL Accounts', to: '/account-dashboard/item-gl-accounts', icon: Tags, iconBg: 'bg-indigo-500/35 text-indigo-300' },
      { label: 'Party GL Accounts', to: '/account-dashboard/party-gl-accounts', icon: Building2, iconBg: 'bg-blue-500/35 text-blue-300' },
    ]
  },
  {
    group: 'Transactions',
    items: [
      { label: 'Journal Entries', to: '/account-dashboard/journal-entries', icon: FileText, iconBg: 'bg-emerald-500/35 text-emerald-300' },
    ]
  },
  {
    group: 'Payments & Settlements',
    items: [
      { label: 'Payments Register', to: '/account-dashboard/payments', icon: WalletCards, iconBg: 'bg-amber-500/35 text-amber-300' },
      { label: 'Mutual Settlements', to: '/account-dashboard/settlements', icon: Scale, iconBg: 'bg-yellow-500/35 text-yellow-300' },
    ]
  },
  {
    group: 'Cash Management',
    items: [
      { label: 'Banks', to: '/account-dashboard/banks', icon: Building2, iconBg: 'bg-cyan-500/35 text-cyan-300' },
      { label: 'Bank Accounts', to: '/account-dashboard/bank-accounts', icon: CreditCard, iconBg: 'bg-sky-500/35 text-sky-300' },
      { label: 'Bank Reconciliation', to: '/account-dashboard/bank-reconciliation', icon: GitMerge, iconBg: 'bg-teal-500/35 text-teal-300' },
    ]
  },
  {
    group: 'Sub-Ledgers',
    collapsible: true,
    items: [
      { label: 'Accounts Receivable', to: '/account-dashboard/sub-ledger/ar', icon: BarChart3, iconBg: 'bg-blue-500/35 text-blue-300' },
      { label: 'AR Aging', to: '/account-dashboard/sub-ledger/ar/aging', icon: BarChart3, iconBg: 'bg-indigo-500/35 text-indigo-300' },
      { label: 'Accounts Payable', to: '/account-dashboard/sub-ledger/ap', icon: BarChart3, iconBg: 'bg-rose-500/35 text-rose-300' },
      { label: 'AP Aging', to: '/account-dashboard/sub-ledger/ap/aging', icon: BarChart3, iconBg: 'bg-orange-500/35 text-orange-300' },
      { label: 'Employee Ledger', to: '/account-dashboard/sub-ledger/employee', icon: BarChart3, iconBg: 'bg-purple-500/35 text-purple-300' },
      { label: 'Bank / Cash Ledger', to: '/account-dashboard/sub-ledger/bank', icon: Landmark, iconBg: 'bg-cyan-500/35 text-cyan-300' },
      { label: 'Inventory Ledger', to: '/account-dashboard/sub-ledger/inventory', icon: Package, iconBg: 'bg-amber-500/35 text-amber-300' },
      { label: 'Stock Valuation', to: '/account-dashboard/sub-ledger/inventory/valuation', icon: Calculator, iconBg: 'bg-lime-500/35 text-lime-300' },
      { label: 'Fixed Asset Register', to: '/account-dashboard/sub-ledger/fixed-assets', icon: Building, iconBg: 'bg-teal-500/35 text-teal-300' },
      { label: 'Recon Dashboard', to: '/account-dashboard/sub-ledger/reconciliation', icon: ShieldCheck, iconBg: 'bg-emerald-500/35 text-emerald-300' }
    ]
  },
  {
    group: 'VAT / Tax',
    items: [
      { label: 'VAT Dashboard', to: '/account-dashboard/vat/dashboard', icon: BarChart3, iconBg: 'bg-rose-500/35 text-rose-300' },
      { label: 'VAT Setup', to: '/account-dashboard/vat/setup', icon: Tags, iconBg: 'bg-purple-500/35 text-purple-300' },
      { label: 'Tax Adjustments', to: '/account-dashboard/vat/adjustments', icon: Calculator, iconBg: 'bg-amber-500/35 text-amber-300' },
      { label: 'VAT Return File', to: '/account-dashboard/vat/return', icon: FileText, iconBg: 'bg-indigo-500/35 text-indigo-300' },
      { label: 'VAT Reports', to: '/account-dashboard/vat/reports', icon: FileText, iconBg: 'bg-fuchsia-500/35 text-fuchsia-300' },
    ]
  },
  {
    group: 'Reports',
    items: [
      { label: 'GL Reports', to: '/account-dashboard/gl-reports', icon: BarChart3, iconBg: 'bg-purple-500/35 text-purple-300' },
    ]
  },
];

export default function AccountingLayout({ children }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = !isDesktopCollapsed || isHovered;

  const [expandedGroups, setExpandedGroups] = useState({ 'Sub-Ledgers': false });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none">
      {/* Permanent Fixed Header */}
      <header className="flex-shrink-0 h-16 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">
          <div className="flex items-center gap-4">
              <Link to="/company-dashboard" className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-theme flex items-center justify-center text-primary font-bold border border-primary/20">
                      <Building2 className="h-6 w-6" />
                  </div>
                  <div className="hidden md:block">
                      <span className="font-bold text-lg">{sessionStorage.getItem('company_name') || 'Enterprise ERP'}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-black/10 rounded-full font-medium tracking-wide">ACCOUNTING</span>
                  </div>
              </Link>
          </div>

          <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                      <span className="text-sm font-semibold">{localStorage.getItem('username') || 'Admin'}</span>
                      <span className="text-xs opacity-80">Administrator</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-[var(--color-primary)]/10 shadow-sm">
                      {(localStorage.getItem('username') || 'A').charAt(0).toUpperCase()}
                  </div>
              </div>
              <div className="w-px h-8 bg-black/10"></div>
              <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }} 
                  className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-black/5" 
                  title="Logout"
              >
                  <LogOut className="h-5 w-5" />
              </button>
          </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`flex-shrink-0 flex flex-col transition-all duration-300 ${isExpanded ? 'w-[240px]' : 'w-[68px]'} bg-sidebar-bg text-sidebar-text border-r border-border`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header section with pin toggle button matching POS position */}
          <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${!isExpanded ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <AccountingIcon className="h-4 w-4 text-white fill-current" />
              </div>
              {isExpanded && (
                <span className="text-sm font-extrabold text-white tracking-tight truncate">Accounting Hub</span>
              )}
            </div>
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
          </div>

          {/* Nav Groups */}
          <nav className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4 px-3">
            {/* Back to Hub */}
            <Link
              to="/company-dashboard"
              title={!isExpanded ? "Back to Company Hub" : undefined}
              className={`flex items-center ${!isExpanded ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10`}
            >
              <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
              </div>
              {isExpanded && <span className="ml-2.5 truncate">Back to Hub</span>}
            </Link>

            {NAV_ITEMS.map(group => (
              <div key={group.group}>
                {isExpanded && (
                  <div 
                    className={`text-[9px] uppercase font-black text-sidebar-text/40 px-2.5 mb-1.5 tracking-widest flex justify-between items-center ${group.collapsible ? 'cursor-pointer hover:opacity-100 transition-opacity' : ''}`}
                    onClick={() => group.collapsible && toggleGroup(group.group)}
                  >
                    <span>{group.group}</span>
                    {group.collapsible && (
                      expandedGroups[group.group] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                    )}
                  </div>
                )}
                {!isExpanded && <div className="h-px bg-white/10 my-2 mx-1" />}
                {(!group.collapsible || expandedGroups[group.group] || !isExpanded) && (
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        title={!isExpanded ? item.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center ${!isExpanded ? 'justify-center px-0' : 'px-2.5'} py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                            item.disabled
                              ? 'opacity-30 cursor-not-allowed pointer-events-none'
                              : isActive
                              ? 'bg-sidebar-active/20 text-sidebar-text shadow-sm'
                              : 'text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                              <item.icon className="h-4 w-4 stroke-[2.5] transition-transform group-hover:scale-110" />
                            </div>
                            {isExpanded && <span className={`ml-2.5 truncate ${isActive ? 'font-bold text-sidebar-text' : ''}`}>{item.label}</span>}
                            {isExpanded && item.disabled && (
                              <span className="ml-auto text-xs opacity-60 bg-white/10 rounded px-1">Soon</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
