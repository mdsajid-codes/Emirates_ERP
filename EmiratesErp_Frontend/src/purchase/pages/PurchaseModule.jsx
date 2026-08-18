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
import PurchaseLayout from '../PurchaseLayout';
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
