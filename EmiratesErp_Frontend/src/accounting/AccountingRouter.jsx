import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AccountingLayout from './components/AccountingLayout';
import { AccountingProvider } from './context/AccountingContext';

const CoaListPage    = lazy(() => import('./pages/coa/CoaListPage'));
const CoaFormPage    = lazy(() => import('./pages/coa/CoaFormPage'));
const CoaDetailPage  = lazy(() => import('./pages/coa/CoaDetailPage'));
const ItemGLAccountsPage = lazy(() => import('./pages/glbridge/ItemGLAccountsPage'));
const PartyGLAccountsPage = lazy(() => import('./pages/glbridge/PartyGLAccountsPage'));
const JournalListPage   = lazy(() => import('./pages/journal/JournalListPage'));
const JournalFormPage   = lazy(() => import('./pages/journal/JournalFormPage'));
const JournalDetailPage = lazy(() => import('./pages/journal/JournalDetailPage'));

const ArSubLedgerListPage   = lazy(() => import('./pages/subledger/ArSubLedgerListPage'));
const ArSubLedgerDetailPage = lazy(() => import('./pages/subledger/ArSubLedgerDetailPage'));
const ArAgingPage           = lazy(() => import('./pages/subledger/ArAgingPage'));

const ApSubLedgerListPage   = lazy(() => import('./pages/subledger/ApSubLedgerListPage'));
const ApSubLedgerDetailPage = lazy(() => import('./pages/subledger/ApSubLedgerDetailPage'));
const ApAgingPage           = lazy(() => import('./pages/subledger/ApAgingPage'));

const EmployeeSubLedgerListPage   = lazy(() => import('./pages/subledger/EmployeeSubLedgerListPage'));
const EmployeeSubLedgerDetailPage = lazy(() => import('./pages/subledger/EmployeeSubLedgerDetailPage'));

const BankSubLedgerListPage   = lazy(() => import('./pages/subledger/BankSubLedgerListPage'));
const BankSubLedgerDetailPage = lazy(() => import('./pages/subledger/BankSubLedgerDetailPage'));
const BankReconciliationPage  = lazy(() => import('./pages/subledger/BankReconciliationPage'));

const InventorySubLedgerListPage   = lazy(() => import('./pages/subledger/InventorySubLedgerListPage'));
const InventorySubLedgerDetailPage = lazy(() => import('./pages/subledger/InventorySubLedgerDetailPage'));
const StockValuationPage           = lazy(() => import('./pages/subledger/StockValuationPage'));

const FixedAssetRegisterPage          = lazy(() => import('./pages/subledger/FixedAssetRegisterPage'));
const FixedAssetSubLedgerDetailPage = lazy(() => import('./pages/subledger/FixedAssetSubLedgerDetailPage'));
const SubLedgerReconciliationDashboard = lazy(() => import('./pages/subledger/SubLedgerReconciliationDashboard'));
const GlReportsPage = lazy(() => import('./pages/reports/GlReportsPage'));

const PaymentRegister = lazy(() => import('./payments/PaymentRegister').then(m => ({ default: m.PaymentRegister })));
const PaymentForm = lazy(() => import('./payments/PaymentForm').then(m => ({ default: m.PaymentForm })));
const SettlementRegister = lazy(() => import('./settlements/SettlementRegister').then(m => ({ default: m.SettlementRegister })));
const SettlementForm = lazy(() => import('./settlements/SettlementForm').then(m => ({ default: m.SettlementForm })));
const BankMaster = lazy(() => import('./banks/BankMaster').then(m => ({ default: m.BankMaster })));
const BankAccountMaster = lazy(() => import('./banks/BankMaster').then(m => ({ default: m.BankAccountMaster })));
const BankReconciliationList = lazy(() => import('./bank-reconciliation/BankReconciliationList').then(m => ({ default: m.BankReconciliationList })));
const BankReconciliationWorkspace = lazy(() => import('./bank-reconciliation/BankReconciliationWorkspace').then(m => ({ default: m.BankReconciliationWorkspace })));

const VatDashboard = lazy(() => import('./vat/VatDashboard'));
const VatRateSetup = lazy(() => import('./vat/VatRateSetup'));
const TaxTransactions = lazy(() => import('./vat/TaxTransactions'));
const VatReturnPage = lazy(() => import('./vat/VatReturnPage'));
const VatReports = lazy(() => import('./vat/VatReports'));

const Loader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AccountingRouter() {
  return (
    <AccountingProvider>
      <AccountingLayout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<Navigate to="chart-of-accounts" replace />} />
            <Route path="chart-of-accounts" element={<CoaListPage />} />
            <Route path="chart-of-accounts/new" element={<CoaFormPage />} />
            <Route path="chart-of-accounts/edit/:id" element={<CoaFormPage />} />
            <Route path="chart-of-accounts/:id" element={<CoaDetailPage />} />
            <Route path="item-gl-accounts" element={<ItemGLAccountsPage />} />
            <Route path="party-gl-accounts" element={<PartyGLAccountsPage />} />
            <Route path="journal-entries" element={<JournalListPage />} />
            <Route path="journal-entries/new" element={<JournalFormPage />} />
            <Route path="journal-entries/edit/:id" element={<JournalFormPage />} />
            <Route path="journal-entries/:id" element={<JournalDetailPage />} />
            
            <Route path="sub-ledger/ar" element={<ArSubLedgerListPage />} />
            <Route path="sub-ledger/ar/aging" element={<ArAgingPage />} />
            <Route path="sub-ledger/ar/:customerId" element={<ArSubLedgerDetailPage />} />
            
            <Route path="sub-ledger/ap" element={<ApSubLedgerListPage />} />
            <Route path="sub-ledger/ap/aging" element={<ApAgingPage />} />
            <Route path="sub-ledger/ap/:supplierId" element={<ApSubLedgerDetailPage />} />

            <Route path="sub-ledger/employee" element={<EmployeeSubLedgerListPage />} />
            <Route path="sub-ledger/employee/:id" element={<EmployeeSubLedgerDetailPage />} />

            <Route path="sub-ledger/bank" element={<BankSubLedgerListPage />} />
            <Route path="sub-ledger/bank/:id" element={<BankSubLedgerDetailPage />} />
            <Route path="sub-ledger/bank-reconciliation/:id" element={<BankReconciliationPage />} />

            <Route path="sub-ledger/inventory" element={<InventorySubLedgerListPage />} />
            <Route path="sub-ledger/inventory/valuation" element={<StockValuationPage />} />
            <Route path="sub-ledger/inventory/:itemId" element={<InventorySubLedgerDetailPage />} />

            <Route path="sub-ledger/fixed-assets" element={<FixedAssetRegisterPage />} />
            <Route path="sub-ledger/fixed-assets/:id" element={<FixedAssetSubLedgerDetailPage />} />
            <Route path="sub-ledger/reconciliation" element={<SubLedgerReconciliationDashboard />} />
            <Route path="gl-reports" element={<GlReportsPage />} />

            <Route path="payments" element={<PaymentRegister />} />
            <Route path="payments/new" element={<PaymentForm />} />
            <Route path="settlements" element={<SettlementRegister />} />
            <Route path="settlements/new" element={<SettlementForm />} />
            <Route path="banks" element={<BankMaster />} />
            <Route path="bank-accounts" element={<BankAccountMaster />} />
            <Route path="bank-reconciliation" element={<BankReconciliationList />} />
            <Route path="bank-reconciliation/workspace" element={<BankReconciliationWorkspace />} />

            <Route path="vat/dashboard" element={<VatDashboard />} />
            <Route path="vat/setup" element={<VatRateSetup />} />
            <Route path="vat/adjustments" element={<TaxTransactions />} />
            <Route path="vat/return" element={<VatReturnPage />} />
            <Route path="vat/reports" element={<VatReports />} />
          </Routes>
        </Suspense>
      </AccountingLayout>
    </AccountingProvider>
  );
}
