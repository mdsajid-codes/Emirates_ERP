import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, BarChart3, ChevronRight, ChevronDown, Menu, X, Tags, Building2, Landmark, Package, Calculator, Building, ShieldCheck, LogOut, CreditCard, Scale, Building as Bank, GitMerge, WalletCards } from 'lucide-react';

const NAV_ITEMS = [
  {
    group: 'Master Data',
    items: [
      { label: 'Chart of Accounts', to: '/account-dashboard/chart-of-accounts', icon: BookOpen },
    ]
  },
  {
    group: 'GL Configuration',
    items: [
      { label: 'Item GL Accounts', to: '/account-dashboard/item-gl-accounts', icon: Tags },
      { label: 'Party GL Accounts', to: '/account-dashboard/party-gl-accounts', icon: Building2 },
    ]
  },
  {
    group: 'Transactions',
    items: [
      { label: 'Journal Entries', to: '/account-dashboard/journal-entries', icon: FileText },
    ]
  },
  {
    group: 'Payments & Settlements',
    items: [
      { label: 'Payments Register', to: '/account-dashboard/payments', icon: WalletCards },
      { label: 'Mutual Settlements', to: '/account-dashboard/settlements', icon: Scale },
    ]
  },
  {
    group: 'Cash Management',
    items: [
      { label: 'Banks', to: '/account-dashboard/banks', icon: Building2 },
      { label: 'Bank Accounts', to: '/account-dashboard/bank-accounts', icon: CreditCard },
      { label: 'Bank Reconciliation', to: '/account-dashboard/bank-reconciliation', icon: GitMerge },
    ]
  },
  {
    group: 'Sub-Ledgers',
    collapsible: true,
    items: [
      { label: 'Accounts Receivable', to: '/account-dashboard/sub-ledger/ar', icon: BarChart3 },
      { label: 'AR Aging', to: '/account-dashboard/sub-ledger/ar/aging', icon: BarChart3 },
      { label: 'Accounts Payable', to: '/account-dashboard/sub-ledger/ap', icon: BarChart3 },
      { label: 'AP Aging', to: '/account-dashboard/sub-ledger/ap/aging', icon: BarChart3 },
      { label: 'Employee Ledger', to: '/account-dashboard/sub-ledger/employee', icon: BarChart3 },
      { label: 'Bank / Cash Ledger', to: '/account-dashboard/sub-ledger/bank', icon: Landmark },
      { label: 'Inventory Ledger', to: '/account-dashboard/sub-ledger/inventory', icon: Package },
      { label: 'Stock Valuation', to: '/account-dashboard/sub-ledger/inventory/valuation', icon: Calculator },
      { label: 'Fixed Asset Register', to: '/account-dashboard/sub-ledger/fixed-assets', icon: Building },
      { label: 'Recon Dashboard', to: '/account-dashboard/sub-ledger/reconciliation', icon: ShieldCheck }
    ]
  },
  {
    group: 'VAT / Tax',
    items: [
      { label: 'VAT Dashboard', to: '/account-dashboard/vat/dashboard', icon: BarChart3 },
      { label: 'VAT Setup', to: '/account-dashboard/vat/setup', icon: Tags },
      { label: 'Tax Adjustments', to: '/account-dashboard/vat/adjustments', icon: Calculator },
      { label: 'VAT Return File', to: '/account-dashboard/vat/return', icon: FileText },
      { label: 'VAT Reports', to: '/account-dashboard/vat/reports', icon: FileText },
    ]
  },
  {
    group: 'Reports',
    items: [
      { label: 'GL Reports', to: '/account-dashboard/gl-reports', icon: BarChart3 },
    ]
  },
];

export default function AccountingLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({ 'Sub-Ledgers': false }); // Start collapsed
  
  const navigate = import('react-router-dom').then(m => m.useNavigate); // we'll use useLocation and useNavigate from react-router-dom

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({...prev, [groupName]: !prev[groupName]}));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Permanent Fixed Header */}
      <header className="flex-shrink-0 h-16 bg-header-bg text-header-text shadow-sm border-b border-border flex items-center justify-between px-4 lg:px-6 z-30 relative">
          <div className="flex items-center gap-4">
              <Link to="/company-dashboard" className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-theme flex items-center justify-center text-primary font-bold border border-primary/20">
                      <Building2 className="h-6 w-6" />
                  </div>
                  <div className="hidden md:block">
                      <span className="font-bold text-lg">{sessionStorage.getItem('company_name') || 'Enterprise HRMS'}</span>
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
          className={`flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-14'} bg-sidebar-bg text-sidebar-text`}
        >
          {/* Sidebar Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
            {sidebarOpen && <span className="text-sm font-bold tracking-wide uppercase opacity-80">Accounting</span>}
            <button
              id="accounting-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-sidebar-hover transition-colors"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav Groups */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
            {NAV_ITEMS.map(group => (
              <div key={group.group}>
                {sidebarOpen && (
                  <div 
                    className={`text-xs uppercase font-semibold opacity-50 px-2 mb-2 tracking-widest flex justify-between items-center ${group.collapsible ? 'cursor-pointer hover:opacity-100 transition-opacity' : ''}`}
                    onClick={() => group.collapsible && toggleGroup(group.group)}
                  >
                    <span>{group.group}</span>
                    {group.collapsible && (
                      expandedGroups[group.group] ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    )}
                  </div>
                )}
                {(!group.collapsible || expandedGroups[group.group] || !sidebarOpen) && (
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-2 py-2.5 rounded-theme text-sm font-medium transition-all duration-150 ${
                            item.disabled
                              ? 'opacity-30 cursor-not-allowed pointer-events-none'
                              : isActive
                              ? 'bg-sidebar-active text-sidebar-text'
                              : 'hover:bg-sidebar-hover opacity-80 hover:opacity-100'
                          }`
                        }
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                        {sidebarOpen && item.disabled && (
                          <span className="ml-auto text-xs opacity-60 bg-white/10 rounded px-1">Soon</span>
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
