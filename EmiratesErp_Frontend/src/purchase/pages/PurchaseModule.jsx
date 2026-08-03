import React, { useState } from 'react'; 
import { NavLink, Outlet, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { logout } from '../../utils/logout';
import {
    LayoutDashboard,
    ShoppingCart,
    Receipt,
    CreditCard,
    FileMinus,
    Settings,
    LogOut,
    Menu,
    ArrowLeft,
    FileText,
    ChevronDown,
    ChevronRight,
    FileCheck,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PurchaseOrderPage from '../components/PurchaseOrderPage';
import PurchaseOrderForm from '../components/PurchaseOrderForm';
import PurAdditionalExpensePage from '../components/PurAdditionalExpensePage';
import PurAdditionalExpenseForm from '../components/PurAdditionalExpenseForm';
import PurAdditionalExpenseView from '../components/PurAdditionalExpenseView';

import PurchaseInvoicePage from '../components/PurchaseInvoicePage';
import PurchaseInvoiceForm from '../components/PurchaseInvoiceForm';
import PurchasePaymentPage from '../components/PurchasePaymentPage';
import PurchasePaymentForm from '../components/PurchasePaymentForm';
import PurchaseOrderView from '../components/PurchaseOrderView';
import PurchaseInvoiceView from '../components/PurchaseInvoiceView';
import PurchasePaymentView from '../components/PurchasePaymentView';
import PurchaseGrnView from '../components/PurchaseGrnView';
import PurchaseGrnForm from '../components/PurchaseGrnForm';
import PurchaseDebitNotePage from '../components/PurchaseDebitNotePage';
import PurchaseDebitNoteForm from '../components/PurchaseDebitNoteForm';
import PurchaseDebitNoteView from '../components/PurchaseDebitNoteView';
import PurCustomDeclarationPage from '../components/PurCustomDeclarationPage';
import PurCustomDeclarationForm from '../components/PurCustomDeclarationForm';
import PurCustomDeclarationView from '../components/PurCustomDeclarationView';
import SupplierBalanceReport from './reports/SupplierBalanceReport';
import BillDetailsReport from './reports/BillDetailsReport';
import PaymentMadeReport from './reports/PaymentMadeReport';
import PurchaseOrdersBySupplierReport from './reports/PurchaseOrdersBySupplierReport';
import PurchaseOrderDetailsReport from './reports/PurchaseOrderDetailsReport';
import SupplierSOAReport from './reports/SupplierSOAReport';
import PendingPurchaseReport from './reports/PendingPurchaseReport';
import SupplierTenderingPage from '../components/SupplierTenderingPage';
import SupplierTenderingForm from '../components/SupplierTenderingForm';
import SupplierTenderingView from '../components/SupplierTenderingView';
import RequisitionPage from '../components/RequisitionPage';
import RequisitionForm from '../components/RequisitionForm';
import RequisitionView from '../components/RequisitionView';
import PurchaseDashboard from '../PurchaseDashboard';


const purchaseNavLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/purchase-dashboard/dashboard', iconBg: 'bg-blue-500/35 text-blue-300' },
    { name: 'Supply Tendering', icon: FileText, href: '/purchase-dashboard/supplier-tendering', iconBg: 'bg-indigo-500/35 text-indigo-300' },
    { name: 'Requisition', icon: FileText, href: '/purchase-dashboard/requisitions', iconBg: 'bg-cyan-500/35 text-cyan-300' },
    { name: 'Purchase Order', icon: ShoppingCart, href: '/purchase-dashboard/purchase-orders', iconBg: 'bg-green-500/35 text-green-300' },
    { name: 'Invoice', icon: Receipt, href: '/purchase-dashboard/bills', iconBg: 'bg-yellow-500/35 text-yellow-300' },
    { name: 'Payments', icon: CreditCard, href: '/purchase-dashboard/payments', iconBg: 'bg-purple-500/35 text-purple-300' },
    { name: 'Debit Notes', icon: FileMinus, href: '/purchase-dashboard/debit-notes', iconBg: 'bg-rose-500/35 text-rose-300' },
    { name: 'Additional Expenses', icon: Receipt, href: '/purchase-dashboard/additional-expenses', iconBg: 'bg-orange-500/35 text-orange-300' },
    { name: 'Custom Declaration', icon: FileCheck, href: '/purchase-dashboard/custom-declarations', iconBg: 'bg-emerald-600/35 text-emerald-300' },
];

const SidebarContent = ({ onLinkClick, isCollapsedMode = false, isDesktopCollapsed = true, setIsDesktopCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reportsOpen, setReportsOpen] = useState(false);

    const handleLogout = () => logout(navigate);

    return (
        <div className="flex flex-col h-full bg-sidebar-bg text-sidebar-text select-none">
            {/* Header section with pin toggle button matching POS position */}
            <div className={`flex items-center py-3 px-3.5 border-b border-white/10 ${isCollapsedMode ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <ShoppingCart className="h-4 w-4 text-white fill-current" />
                    </div>
                    {!isCollapsedMode && (
                        <span className="text-sm font-extrabold text-white tracking-tight truncate">Purchase Hub</span>
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

            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
                {/* Back to Hub */}
                <button
                    onClick={() => navigate('/company-dashboard')}
                    title={isCollapsedMode ? "Back to Company Hub" : undefined}
                    className={`w-full flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-2 group text-sidebar-text/80 hover:text-sidebar-text hover:bg-white/10 text-left`}
                >
                    <div className="p-1.5 rounded-full bg-slate-500/35 text-slate-300 flex items-center justify-center flex-shrink-0">
                        <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    {!isCollapsedMode && <span className="ml-2.5 truncate">Back to Hub</span>}
                </button>

                {purchaseNavLinks.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onLinkClick}
                        end={item.href === '/purchase-dashboard/dashboard'}
                        title={isCollapsedMode ? item.name : undefined}
                        className={({ isActive }) =>
                            `flex items-center ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl transition-all duration-200 mb-1 group ${
                                isActive ? 'bg-sidebar-active/20 text-sidebar-text shadow-sm' : 'text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg || 'bg-slate-500/35 text-slate-300'}`}>
                                    <item.icon className="h-4 w-4 stroke-[2.5] transition-transform group-hover:scale-110" />
                                </div>
                                {!isCollapsedMode && <span className={`ml-2.5 truncate ${isActive ? 'font-bold text-sidebar-text' : ''}`}>{item.name}</span>}
                            </>
                        )}
                    </NavLink>
                ))}

                {/* Reports Section */}
                <div className="pt-1">
                    <button
                        onClick={() => setReportsOpen(!reportsOpen)}
                        title={isCollapsedMode ? "Reports" : undefined}
                        className={`flex items-center w-full ${isCollapsedMode ? 'justify-center px-0' : 'px-2.5'} py-2 text-sm font-bold rounded-xl text-sidebar-text/80 hover:text-sidebar-text hover:bg-sidebar-hover transition-all group`}
                    >
                        <div className="p-1.5 rounded-full bg-indigo-500/35 text-indigo-300 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 stroke-[2.5]" />
                        </div>
                        {!isCollapsedMode && (
                            <>
                                <span className="flex-1 text-left ml-2.5 truncate">Reports</span>
                                {reportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </>
                        )}
                    </button>
                    {reportsOpen && !isCollapsedMode && (
                        <div className="pl-4 mt-1 space-y-1">
                            {[
                                { name: 'Supplier Balances', to: '/purchase-dashboard/reports/supplier-balance' },
                                { name: 'Bill Details', to: '/purchase-dashboard/reports/bill-details' },
                                { name: 'Payments Made', to: '/purchase-dashboard/reports/payments-made' },
                                { name: 'Purchase Orders By Supplier', to: '/purchase-dashboard/reports/purchase-orders-by-supplier' },
                                { name: 'Purchase Order Details', to: '/purchase-dashboard/reports/purchase-order-details' },
                                { name: 'Supplier SOA', to: '/purchase-dashboard/reports/supplier-soa' },
                                { name: 'Pending Purchase', to: '/purchase-dashboard/reports/pending-purchase' },
                            ].map((rep) => (
                                <NavLink
                                    key={rep.name}
                                    to={rep.to}
                                    onClick={onLinkClick}
                                    className={({ isActive }) => `flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${isActive ? 'bg-sidebar-active/30 text-sidebar-text' : 'text-sidebar-text/70 hover:text-sidebar-text hover:bg-sidebar-hover'}`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2.5 flex-shrink-0" />
                                    <span className="truncate">{rep.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </nav>
            <div className="p-3 border-t border-sidebar-text/10 space-y-1">
                <NavLink
                    to="/company-settings/purchase"
                    onClick={onLinkClick}
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
};

const PurchaseLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const isExpanded = !isDesktopCollapsed || isHovered;

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Static sidebar for desktop */}
            <aside
                className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 border-r border-border bg-sidebar-bg text-sidebar-text transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <SidebarContent
                    isCollapsedMode={!isExpanded}
                    isDesktopCollapsed={isDesktopCollapsed}
                    setIsDesktopCollapsed={setIsDesktopCollapsed}
                />
            </aside>

            {/* Mobile sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed top-0 left-0 h-full w-64 z-30 bg-card text-card-foreground">
                            <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card shadow-sm items-center px-4">
                    <button type="button" className="text-foreground-muted" onClick={() => setSidebarOpen(true)}><Menu className="h-6 w-6" /></button>
                    <div className="flex-1 flex justify-center items-center"><span className="font-bold text-lg text-foreground">Purchases Module</span></div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background-muted">{children}</div>
            </main>
        </div>
    );
};

const PurchasePlaceholder = ({ pageName }) => (
    <div className="text-center py-20">
        <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
        <p className="text-foreground-muted mt-2">This page is under construction.</p>
    </div>
);

const PurchaseModule = () => {
    return (
        <PurchaseLayout>
            <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PurchaseDashboard />} />

                
                {/* Supply Tendering Routes */}
                <Route path="supplier-tendering" element={<SupplierTenderingPage />} />
                <Route path="supplier-tendering/new" element={<SupplierTenderingForm />} />
                <Route path="supplier-tendering/edit/:id" element={<SupplierTenderingForm />} />
                <Route path="supplier-tendering/view/:id" element={<SupplierTenderingView />} />

                {/* Requisition Routes */}
                <Route path="requisitions" element={<RequisitionPage />} />
                <Route path="requisitions/new" element={<RequisitionForm />} />
                <Route path="requisitions/edit/:id" element={<RequisitionForm />} />
                <Route path="requisitions/view/:id" element={<RequisitionView />} />

                <Route path="purchase-orders" element={<PurchaseOrderPage />} />
                <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
                <Route path="purchase-orders/view/:id" element={<PurchaseOrderView />} />
                <Route path="purchase-orders/edit/:id" element={<PurchaseOrderForm />} />
                <Route path="purchase-orders/:id/grn/new" element={<PurchaseGrnForm />} />
                <Route path="grns/:id" element={<PurchaseGrnView />} />



                <Route path="bills" element={<PurchaseInvoicePage />} />
                <Route path="bills/new" element={<PurchaseInvoiceForm />} />
                <Route path="bills/edit/:id" element={<PurchaseInvoiceForm />} />
                <Route path="bills/view/:id" element={<PurchaseInvoiceView />} />
                <Route path="payments" element={<PurchasePaymentPage />} />
                <Route path="payments/new" element={<PurchasePaymentForm />} />
                <Route path="payments/edit/:id" element={<PurchasePaymentForm />} />
                <Route path="payments/view/:id" element={<PurchasePaymentView />} />

                <Route path="debit-notes" element={<PurchaseDebitNotePage />} />
                <Route path="debit-notes/new" element={<PurchaseDebitNoteForm />} />
                <Route path="debit-notes/edit/:id" element={<PurchaseDebitNoteForm />} />
                <Route path="debit-notes/view/:id" element={<PurchaseDebitNoteView />} />
                
                {/* Additional Expense Routes */}
                <Route path="additional-expenses" element={<PurAdditionalExpensePage />} />
                <Route path="additional-expenses/new" element={<PurAdditionalExpenseForm />} />
                <Route path="additional-expenses/edit/:id" element={<PurAdditionalExpenseForm />} />
                <Route path="additional-expenses/view/:id" element={<PurAdditionalExpenseView />} />
                
                {/* Custom Declaration Routes */}
                <Route path="custom-declarations" element={<PurCustomDeclarationPage />} />
                <Route path="custom-declarations/new" element={<PurCustomDeclarationForm />} />
                <Route path="custom-declarations/edit/:id" element={<PurCustomDeclarationForm />} />
                <Route path="custom-declarations/view/:id" element={<PurCustomDeclarationView />} />

                <Route path="reports/supplier-balance" element={<SupplierBalanceReport />} />
                <Route path="reports/bill-details" element={<BillDetailsReport />} />
                <Route path="reports/payments-made" element={<PaymentMadeReport />} />
                <Route path="reports/purchase-orders-by-supplier" element={<PurchaseOrdersBySupplierReport />} />
                <Route path="reports/purchase-order-details" element={<PurchaseOrderDetailsReport />} />
                <Route path="reports/supplier-soa" element={<SupplierSOAReport />} />
                <Route path="reports/pending-purchase" element={<PendingPurchaseReport />} />

                {/* Add other purchase module routes here */}
            </Routes>
        </PurchaseLayout>
    );
}

export default PurchaseModule;
