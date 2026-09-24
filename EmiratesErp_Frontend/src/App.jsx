import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
import React, { useContext, lazy, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import { TenantProvider } from './context/TenantContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
// Core / Auth
const Home = lazy(() => import('./pages/Home'));
const Features = lazy(() => import('./pages/Features'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const HrDashboard = lazy(() => import('./pages/HrDashboard'));
const Employee = lazy(() => import('./pages/Employee'));
const AddEmployeePage = lazy(() => import('./pages/AddEmployeePage'));
const MasterAdmin = lazy(() => import('./pages/MasterAdmin'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const UsersDetails = lazy(() => import('./pages/UsersDetails'));
const Attendance = lazy(() => import('./pages/attendance/Attendance'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement.jsx'));
const PayrollManagement = lazy(() => import('./pages/PayrollManagement'));
const CompanyDashboard = lazy(() => import('./pages/CompanyDashboard'));

// HRMS Specialized
const SickLeaveManagement = lazy(() => import('./pages/hrms/SickLeaveManagement'));
const WorkScheduleManagement = lazy(() => import('./pages/attendance/components/WorkScheduleManagement'));
const WorkCalendarManagement = lazy(() => import('./pages/attendance/components/WorkCalendarManagement'));
const EmployeeShiftRoster = lazy(() => import('./pages/attendance/components/EmployeeShiftRoster'));

// Company / Settings
const Settings = lazy(() => import('./company/Settings.jsx'));
const ThemeSettings = lazy(() => import('./company/Theme.jsx'));
const ThemeForm = lazy(() => import('./company/ThemeForm.jsx'));
const HrmsSettings = lazy(() => import('./company/HrmsSettings.jsx'));
const HangerTypes = lazy(() => import('./company/HangerTypes.jsx'));
const HangerTypeForm = lazy(() => import('./company/HangerTypeForm.jsx'));
const AllUser = lazy(() => import('./company/AllUser.jsx'));
const CoilStock = lazy(() => import('./warehouse/pages/CoilStock.jsx'));
const MasterDataSettings = lazy(() => import('./company/MasterDataSettings.jsx'));

// HRMS Reports
const ReportsLayout = lazy(() => import('./pages/hrmsReport/ReportsLayout.jsx'));
const EmployeeReports = lazy(() => import('./pages/hrmsReport/EmployeeReports.jsx'));
const MasterEmployeeReport = lazy(() => import('./pages/hrmsReport/MasterEmployeeReport.jsx'));
const SummaryReportView = lazy(() => import('./pages/hrmsReport/SummaryReportView.jsx'));
const HeadCount = lazy(() => import('./pages/hrmsReport/HeadCount.jsx'));
const Demographics = lazy(() => import('./pages/hrmsReport/Demographics.jsx'));
const EmploymentStatus = lazy(() => import('./pages/hrmsReport/EmploymentStatus.jsx'));
const EmployeeDocumentsReport = lazy(() => import('./pages/hrmsReport/EmployeeDocumentsReport.jsx'));
const AttendanceReports = lazy(() => import('./pages/hrmsReport/Attendance/AttendanceReports.jsx'));
const DailyAttendanceReport = lazy(() => import('./pages/hrmsReport/Attendance/DailyAttendanceReport.jsx'));
const MonthlyAttendanceReport = lazy(() => import('./pages/hrmsReport/Attendance/MonthlyAttendanceReport.jsx'));
const OvertimeReport = lazy(() => import('./pages/hrmsReport/Attendance/OvertimeReport.jsx'));
const ComplianceReport = lazy(() => import('./pages/hrmsReport/Attendance/ComplianceReport.jsx'));
const LeaveReports = lazy(() => import('./pages/hrmsReport/Leave/LeaveReports.jsx'));
const LeaveAccrualReport = lazy(() => import('./pages/hrmsReport/Leave/LeaveAccrualReport.jsx'));
const PayrollReports = lazy(() => import('./pages/hrmsReport/Payroll/PayrollReports.jsx'));
const PayrollRegisterReport = lazy(() => import('./pages/hrmsReport/Payroll/PayrollRegisterReport.jsx'));
const WpsSifReport = lazy(() => import('./pages/hrmsReport/Payroll/WpsSifReport.jsx'));
const WpsComplianceReport = lazy(() => import('./pages/hrmsReport/Payroll/WpsComplianceReport.jsx'));

// Compliance Reports
const ComplianceReports = lazy(() => import('./pages/hrmsReport/Compliance/ComplianceReports'));
const LaborCardReport = lazy(() => import('./pages/hrmsReport/Compliance/LaborCardReport'));
const CompanyQuotaReport = lazy(() => import('./pages/hrmsReport/Compliance/CompanyQuotaReport'));
const NationalityReport = lazy(() => import('./pages/hrmsReport/Compliance/NationalityReport'));
const EmiratizationReport = lazy(() => import('./pages/hrmsReport/Compliance/EmiratizationReport'));
const AbscondingReport = lazy(() => import('./pages/hrmsReport/Compliance/AbscondingReport'));

// End of Service Reports
const EndOfServiceReports = lazy(() => import('./pages/hrmsReport/EndOfService/EndOfServiceReports.jsx'));
const EosbCalculationReport = lazy(() => import('./pages/hrmsReport/EndOfService/EosbCalculationReport.jsx'));
const FinalSettlementReport = lazy(() => import('./pages/hrmsReport/EndOfService/FinalSettlementReport.jsx'));
const TerminationReasonReport = lazy(() => import('./pages/hrmsReport/EndOfService/TerminationReasonReport.jsx'));

// POS
const PosDashboard = lazy(() => import('./pos/page/PosDashboard'));
const ProductScanResult = lazy(() => import('./pos/page/ProductScanResult'));
const PosReportsLayout = lazy(() => import('./pos/page/reports/PosReportsLayout.jsx'));
const FinancialReportsLayout = lazy(() => import('./pos/page/reports/FinancialReportsLayout.jsx'));

const BusinessSummary = lazy(() => import('./pos/page/reports/BusinessSummary.jsx'));
const DailySummaryReport = lazy(() => import('./pos/page/reports/DailySummaryReport'));
const TotalDailyReports = lazy(() => import('./pos/page/reports/TotalDailyReports'));
const ClosingReport = lazy(() => import('./pos/page/reports/ClosingReport.jsx'));
const SalesSupportReport = lazy(() => import('./pos/page/reports/SalesSupportReport.jsx'));
const SalesPaymentReport = lazy(() => import('./pos/page/reports/SalesPaymentReport.jsx'));
const SalesSourceReport = lazy(() => import('./pos/page/reports/SalesSourceReport.jsx'));
const TotalSalesReport = lazy(() => import('./pos/page/reports/TotalSalesReport.jsx'));
const SalesStatusReport = lazy(() => import('./pos/page/reports/SalesStatusReport.jsx'));
const DeliveryDriverReport = lazy(() => import('./pos/page/reports/DeliveryDriverReport.jsx'));
const SalesForecastingReport = lazy(() => import('./pos/page/reports/SalesForecastingReport.jsx'));
const PaymentChangeReport = lazy(() => import('./pos/page/reports/PaymentChangeReport.jsx'));
const SalesDiscountReport = lazy(() => import('./pos/page/reports/SalesDiscountReport.jsx'));
const CancellationReport = lazy(() => import('./pos/page/reports/CancellationReport.jsx'));
const VoidReport = lazy(() => import('./pos/page/reports/VoidReport.jsx'));
const ItemMovementReport = lazy(() => import('./pos/page/reports/ItemMovementReport.jsx'));
const SlowSellingReport = lazy(() => import('./pos/page/reports/SlowSellingReport.jsx'));
const BestSellingReport = lazy(() => import('./pos/page/reports/BestSellingReport.jsx'));
const ItemSalesReport = lazy(() => import('./pos/page/reports/ItemSalesReport.jsx'));
const UserTransfer = lazy(() => import('./pos/page/reports/UserTransfer.jsx'));
const GlJournalEntries = lazy(() => import('./pos/page/reports/GlJournalEntries.jsx'));
const PosTrialBalance = lazy(() => import('./pos/page/reports/PosTrialBalance.jsx'));
const CardSettlementReport = lazy(() => import('./pos/page/reports/CardSettlementReport.jsx'));
const VatOutputReport = lazy(() => import('./pos/page/reports/VatOutputReport.jsx'));
const CashVarianceReport = lazy(() => import('./pos/page/reports/CashVarianceReport.jsx'));
const PosProfitAndLoss = lazy(() => import('./pos/page/reports/PosProfitAndLoss.jsx'));
const PosBalanceSheet = lazy(() => import('./pos/page/reports/PosBalanceSheet.jsx'));


// Production
const ProductionSettings = lazy(() => import('./production/settings/ProductionSettings.jsx'));
const Production = lazy(() => import('./production/pages/Production.jsx'));
const ManufacturingOrder = lazy(() => import('./production/pages/ManufacturingOrder.jsx'));
const ManufacturingOrderForm = lazy(() => import('./production/pages/ManufacturingOrderForm.jsx'));
const ViewManufacturingOrder = lazy(() => import('./production/pages/ViewManufacturingOrder.jsx'));
const ProFinishedGoodForm = lazy(() => import('./production/pages/ProFinishedGoodForm.jsx'));
const ProcessFinishedGood = lazy(() => import('./production/pages/ProcessFinishedGood.jsx'));
const BomFinishedGood = lazy(() => import('./production/pages/BomFinishedGood.jsx'));
const ProSemiFinishedForm = lazy(() => import('./production/pages/ProSemiFinishedForm.jsx'));
const ProcessSemiFinished = lazy(() => import('./production/pages/ProcessSemiFinished.jsx'));
const BomSemiFinished = lazy(() => import('./production/pages/BomSemiFinished.jsx'));
const ProductionSchedule = lazy(() => import('./production/pages/ProductionSchedule.jsx'));
const ProductionOperation = lazy(() => import('./production/pages/ProductionOperation.jsx'));
const MyProductionPlan = lazy(() => import('./production/pages/MyProductionPlan.jsx'));
const BatchListPage = lazy(() => import('./production/pages/Hanger/BatchListPage.jsx'));
const BatchForm = lazy(() => import('./production/pages/Hanger/BatchForm.jsx'));
const BatchDetailPage = lazy(() => import('./production/pages/Hanger/BatchDetailPage.jsx'));
const WipTrackingPage = lazy(() => import('./production/pages/Hanger/WipTrackingPage.jsx'));
const CostSheetPage = lazy(() => import('./production/pages/Hanger/CostSheetPage.jsx'));
const CostRateSettings = lazy(() => import('./production/pages/Hanger/CostRateSettings.jsx'));
const ProductionReportsPage = lazy(() => import('./production/pages/Hanger/ProductionReportsPage'));
const OeeDashboardPage = lazy(() => import('./production/pages/Hanger/OeeDashboardPage.jsx'));
const ProductionDashboard = lazy(() => import('./production/pages/ProductionDashboard.jsx'));

// CRM
const CrmSettings = lazy(() => import('./crm/settings/CrmSettings.jsx'));
const CrmModule = lazy(() => import('./crm/pages/CrmModule.jsx'));
const CrmLead = lazy(() => import('./crm/pages/CrmLead.jsx'));
const CrmCompanies = lazy(() => import('./crm/pages/CrmCompanies.jsx'));
const CrmDashboard = lazy(() => import('./crm/pages/CrmDashboard.jsx'));
const CrmRecentActivityPage = lazy(() => import('./crm/pages/CrmRecentActivityPage.jsx'));
const CrmHome = lazy(() => import('./crm/pages/CrmHome.jsx'));
const CrmTasks = lazy(() => import('./crm/pages/CrmTasks.jsx'));
const LeadInfo = lazy(() => import('./crm/pages/Leadinfo.jsx'));
const LeadDetails = lazy(() => import('./crm/pages/LeadDetails.jsx'));
const CrmLeadFormPage = lazy(() => import('./crm/pages/CrmLeadFormPage.jsx'));
const CrmCallLogFormPage = lazy(() => import('./crm/pages/CrmCallLogFormPage.jsx'));
const CrmCompanyFormPage = lazy(() => import('./crm/pages/CrmCompanyFormPage.jsx'));
const CrmContactFormPage = lazy(() => import('./crm/pages/CrmContactFormPage.jsx'));
const CrmDealFormPage = lazy(() => import('./crm/pages/CrmDealFormPage.jsx'));
const CrmTaskFormPage = lazy(() => import('./crm/pages/CrmTaskFormPage.jsx'));
const CrmEventFormPage = lazy(() => import('./crm/pages/CrmEventFormPage.jsx'));
const CrmContacts = lazy(() => import('./crm/pages/CrmContacts.jsx'));
const CrmSalesProduct = lazy(() => import('./crm/components/CrmSalesProduct.jsx'));
const CrmSalesProductForm = lazy(() => import('./crm/components/CrmSalesProductForm.jsx'));
const CrmCalendarPage = lazy(() => import('./crm/pages/CrmCalendarPage'));
const CrmRolesPage = lazy(() => import('./crm/pages/CrmRolesPage'));

const CrmCallingData = lazy(() => import('./crm/pages/CrmCallingData.jsx'));
const CrmOperations = lazy(() => import('./crm/pages/CrmOperations.jsx'));
const CrmDeals = lazy(() => import('./crm/pages/CrmDeals.jsx'));
const SalesLayout = lazy(() => import('./sales/SalesLayout.jsx'));
const SalesDashboard = lazy(() => import('./sales/SalesDashboard.jsx'));
const Orders = lazy(() => import('./sales/pages/Orders.jsx'));
const OrderForm = lazy(() => import('./sales/pages/OrderForm.jsx'));
const QuotationForm = lazy(() => import('./sales/pages/QuotationForm.jsx'));
const Quotation = lazy(() => import('./sales/pages/Quotation.jsx'));
const ViewQuotation = lazy(() => import('./sales/pages/ViewQuotation.jsx'));
const ViewSales = lazy(() => import('./sales/pages/ViewSales.jsx'));
const RentalQuotation = lazy(() => import('./sales/pages/RentalQuotation.jsx'));
const RentalQuotationForm = lazy(() => import('./sales/pages/RentalQuotationForm.jsx'));
const RentalSalesOrder = lazy(() => import('./sales/pages/RentalSalesOrder.jsx'));
const RentalSalesOrderForm = lazy(() => import('./sales/pages/RentalSalesOrderForm.jsx'));
const RentalSalesOrderView = lazy(() => import('./sales/pages/RentalSalesOrderView.jsx'));
const RentalItemRecieved = lazy(() => import('./sales/pages/RentalItemRecieved.jsx'));
const RentalItemRecievedForm = lazy(() => import('./sales/pages/RentalItemRecievedForm.jsx'));
const RentalItemRecievedView = lazy(() => import('./sales/pages/RentalItemRecievedView.jsx'));
const RentalItemReceivedByOrder = lazy(() => import('./sales/pages/RentalItemReceivedByOrder.jsx'));
const RecievedAmount = lazy(() => import('./sales/pages/RecievedAmount.jsx'));
const RecievedAmountForm = lazy(() => import('./sales/pages/RecievedAmountForm.jsx'));
const RecievedAmountView = lazy(() => import('./sales/pages/RecievedAmountView.jsx'));
const CreditNotes = lazy(() => import('./sales/pages/CreditNotes.jsx'));
const CreditNotesForm = lazy(() => import('./sales/pages/CreditNotesForm.jsx'));
const CreditNotesView = lazy(() => import('./sales/pages/CreditNotesView.jsx'));
const DeliveryOrder = lazy(() => import('./sales/pages/DeliveryOrder.jsx'));
const DeliveryOrderForm = lazy(() => import('./sales/pages/DeliveryOrderForm.jsx'));
const DeliveryOrderView = lazy(() => import('./sales/pages/DeliveryOrderView.jsx'));
const RentalQuotationView = lazy(() => import('./sales/pages/RentalQuotationView.jsx'));
const ProformaInvoice = lazy(() => import('./sales/pages/ProformaInvoice.jsx'));
const ProformaInvoiceForm = lazy(() => import('./sales/pages/ProformaInvoiceForm.jsx'));
const ProformaInvoiceView = lazy(() => import('./sales/pages/ProformaInvoiceView.jsx'));
const Invoice = lazy(() => import('./sales/pages/Invoice.jsx'));
const InvoiceForm = lazy(() => import('./sales/pages/InvoiceForm.jsx'));
const InvoiceView = lazy(() => import('./sales/pages/InvoiceView.jsx'));
const RentalInvoice = lazy(() => import('./sales/pages/RentalInvoice.jsx'));
const RentalInvoiceForm = lazy(() => import('./sales/pages/RentalInvoiceForm.jsx'));
const RentalInvoiceView = lazy(() => import('./sales/pages/RentalInvoiceView.jsx'));
const SalesSetting = lazy(() => import('./sales/pages/SalesSetting.jsx'));
const SalAdditionalExpensePage = lazy(() => import('./sales/pages/SalAdditionalExpensePage.jsx'));
const SalAdditionalExpenseForm = lazy(() => import('./sales/pages/SalAdditionalExpenseForm.jsx'));
const SalAdditionalExpenseView = lazy(() => import('./sales/pages/SalAdditionalExpenseView.jsx'));
const SalesOrderByItemReport = lazy(() => import('./sales/pages/reports/SalesOrderByItemReport.jsx'));
const SalesOrderByCustomerReport = lazy(() => import('./sales/pages/reports/SalesOrderByCustomerReport.jsx'));
const ListOfDueBillsReport = lazy(() => import('./sales/pages/reports/ListOfDueBillsReport.jsx'));
const ListOfDueInvoicesReport = lazy(() => import('./sales/pages/reports/ListOfDueInvoicesReport.jsx'));
const SalesBySalesPersonReport = lazy(() => import('./sales/pages/reports/SalesBySalesPersonReport.jsx'));
const SalesByItemReport = lazy(() => import('./sales/pages/reports/SalesByItemReport.jsx'));
const SalesByCustomerReport = lazy(() => import('./sales/pages/reports/SalesByCustomerReport.jsx'));

// Accounting (Phase 1 Rebuild)
const AccountingRouter = lazy(() => import('./accounting/AccountingRouter'));

// Purchase / Material / Warehouse
const PurchaseModule = lazy(() => import('./purchase/pages/PurchaseModule.jsx'));
const MaterialModule = lazy(() => import('./material/pages/MaterialModule.jsx'));
const MaterialRequisition = lazy(() => import('./material/pages/MaterialRequisition.jsx'));
const IssueRawMaterial = lazy(() => import('./material/pages/IssueRawMaterial.jsx'));
const IssueRawMaterialTab = lazy(() => import('./material/pages/IssueRawMaterialTab.jsx'));
const MaterialReserved = lazy(() => import('./material/pages/MaterialReserved.jsx'));
const MaterialReservedTab = lazy(() => import('./material/pages/MaterialReservedTab.jsx'));
const UnreserveRawMaterial = lazy(() => import('./material/pages/UnreserveRawMaterial.jsx'));
const IndentMaterial = lazy(() => import('./material/pages/IndentMaterial.jsx'));
const ViewIndentMaterialTab = lazy(() => import('./material/pages/ViewIndentMaterialTab.jsx'));
const IndentRequisionForm = lazy(() => import('./material/pages/IndentRequisionForm.jsx'));
const IndentRequisionPOTab = lazy(() => import('./material/pages/IndentRequisionPOTab.jsx'));
const IndentRequisionPOCreatedTab = lazy(() => import('./material/pages/IndentRequisionPOCreatedTab.jsx'));
const WarehouseModule = lazy(() => import('./warehouse/pages/WarehouseModule.jsx'));
const WarehouseDashboard = lazy(() => import('./warehouse/pages/WarehouseDashboard.jsx'));
const FgStockPage = lazy(() => import('./warehouse/pages/FgStockPage.jsx'));

// Notification
const NotificationModule = lazy(() => import('./notification/pages/NotificationModule'));
const NotificationDashboard = lazy(() => import('./notification/pages/NotificationDashboard'));
const EmailNotification = lazy(() => import('./notification/pages/EmailNotification'));
const WhatsAppNotification = lazy(() => import('./notification/pages/WhatsAppNotification'));
const SmsNotification = lazy(() => import('./notification/pages/SmsNotification'));
const TelegramNotification = lazy(() => import('./notification/pages/TelegramNotification'));
const WebsiteIntegration = lazy(() => import('./notification/pages/WebsiteIntegration'));
const LeadCapture = lazy(() => import('./notification/pages/LeadCapture'));

// TRIP MANAGEMENT
const TripLayout = lazy(() => import('./fleet/tripManagement/tripLayouts/TripLayout.jsx'));
const TripDashboard = lazy(() => import('./fleet/tripManagement/pages/TripDashboard.jsx'));
const Trips = lazy(() => import('./fleet/tripManagement/pages/Trips.jsx'));
const Customers = lazy(() => import('./fleet/tripManagement/pages/Customers.jsx'));
const Vendors = lazy(() => import('./fleet/tripManagement/pages/Vendors.jsx'));
const Invoices = lazy(() => import('./fleet/tripManagement/pages/invoice/Invoices.jsx'));
const CreateInvoice = lazy(() => import('./fleet/tripManagement/pages/invoice/CreateInvoice.jsx'));
const InvoiceDetailView = lazy(() => import('./fleet/tripManagement/pages/invoice/InvoiceDetailView.jsx'));
const ReportsDashboard = lazy(() => import('./fleet/pages/ReportsDashboard.jsx'));
const TripForm = lazy(() => import('./fleet/tripManagement/pages/TripForm.jsx'));
const TripDetails = lazy(() => import('./fleet/tripManagement/pages/tripDetails/TripDetails.jsx'));
const TripDispatchPage = lazy(() => import('./fleet/tripManagement/pages/TripDispatchPage.jsx'));
const TripTracker = lazy(() => import('./fleet/tripManagement/pages/TripTracker.jsx'));

// FLEET MANAGEMENT
const FleetLayout = lazy(() => import('./fleet/fleetLayouts/FleetLayout.jsx'));
const FleetDashboard = lazy(() => import('./fleet/pages/FleetDashboard.jsx'));
const Vehicles = lazy(() => import('./fleet/pages/Vehicles.jsx'));
const VehicleFormPage = lazy(() => import('./fleet/pages/VehicleFormPage.jsx'));
const DriverFormPage = lazy(() => import('./fleet/pages/DriverFormPage.jsx'));
const CustomerFormPage = lazy(() => import('./fleet/pages/CustomerFormPage.jsx'));
const VendorFormPage = lazy(() => import('./fleet/pages/VendorFormPage.jsx'));
const VendorDetails = lazy(() => import('./fleet/pages/VendorDetails.jsx'));
const TripFormPage = lazy(() => import('./fleet/pages/TripFormPage.jsx'));
const TripDetailsPage = lazy(() => import('./fleet/pages/TripDetailsPage.jsx'));
const DispatchFormPage = lazy(() => import('./fleet/pages/DispatchFormPage.jsx'));
const DispatchDetailsPage = lazy(() => import('./fleet/pages/DispatchDetailsPage.jsx'));
const RouteFormPage = lazy(() => import('./fleet/pages/RouteFormPage.jsx'));
const RouteDetailsPage = lazy(() => import('./fleet/pages/RouteDetailsPage.jsx'));
const MaintenanceFormPage = lazy(() => import('./fleet/pages/MaintenanceFormPage.jsx'));
const MaintenanceDetailsPage = lazy(() => import('./fleet/pages/MaintenanceDetailsPage.jsx'));
const FuelFormPage = lazy(() => import('./fleet/pages/FuelFormPage.jsx'));
const FuelDetailsPage = lazy(() => import('./fleet/pages/FuelDetailsPage.jsx'));
const InvoiceFormPage = lazy(() => import('./fleet/tripManagement/pages/invoice/InvoiceFormPage.jsx'));
const InvoiceDetailsPage = lazy(() => import('./fleet/tripManagement/pages/invoice/InvoiceDetailsPage.jsx'));
const ReportFormPage = lazy(() => import('./fleet/pages/ReportFormPage.jsx'));
const ReportDetailsPage = lazy(() => import('./fleet/pages/ReportDetailsPage.jsx'));
const ComplaintFormPage = lazy(() => import('./fleet/pages/ComplaintFormPage.jsx'));
const ComplaintDetailsPage = lazy(() => import('./fleet/pages/ComplaintDetailsPage.jsx'));
const DriverPerformanceFormPage = lazy(() => import('./fleet/pages/DriverPerformanceFormPage.jsx'));
const DriverPerformanceDetailsPage = lazy(() => import('./fleet/pages/DriverPerformanceDetailsPage.jsx'));
const Drivers = lazy(() => import('./fleet/pages/Drivers.jsx'));
const RoutesPage = lazy(() => import('./fleet/pages/Routes.jsx'));
const VehicleMaintenance = lazy(() => import('./fleet/pages/VehicleMaintenance.jsx'));
const FuelLog = lazy(() => import('./fleet/pages/FuelLog.jsx'));
const DispatchJobs = lazy(() => import('./fleet/pages/DispatchJobs.jsx'));
const Complaints = lazy(() => import('./fleet/pages/Complaints.jsx'));
const DriverPerformances = lazy(() => import('./fleet/pages/DriverPerformances.jsx'));
const DocumentTrackingDashboard = lazy(() => import('./fleet/pages/DocumentTrackingDashboard.jsx'));
const FleetAlerts = lazy(() => import('./fleet/pages/FleetAlerts.jsx'));
const VehicleDetails = lazy(() => import('./fleet/pages/VehicleDetails.jsx'));
const DriverDetails = lazy(() => import('./fleet/pages/DriverDetails.jsx'));
const CustomerDetails = lazy(() => import('./fleet/pages/CustomerDetails.jsx'));
// Party Type
const PartyType = lazy(() => import('./components/PartyType/PartyType.jsx'));
const PartyForm = lazy(() => import('./components/PartyType/PartyForm.jsx'));

// Fixed Asset
const FixedAssetModule = lazy(() => import('./fixedAsset/pages/FixedAssetModule.jsx'));
const FixedAssetDashboard = lazy(() => import('./fixedAsset/pages/FixedAssetDashboard.jsx'));
const AssetList = lazy(() => import('./fixedAsset/pages/AssetList.jsx'));
const FixedAssetForm = lazy(() => import('./fixedAsset/pages/FixedAssetForm.jsx'));
const CategoryList = lazy(() => import('./fixedAsset/pages/CategoryList.jsx'));

// ATS
const AtsModule = lazy(() => import('./ats/pages/AtsModule.jsx'));
const AtsDashboard = lazy(() => import('./ats/pages/AtsDashboard.jsx'));
const AtsApplicants = lazy(() => import('./ats/pages/AtsApplicants.jsx'));
const AtsApplicantDetail = lazy(() => import('./ats/pages/AtsApplicantDetail.jsx'));
const AddApplicantPage = lazy(() => import('./ats/pages/AddApplicantPage.jsx'));
const AtsSettings = lazy(() => import('./ats/settings/AtsSettings.jsx'));
const AtsVendorList = lazy(() => import('./ats/pages/AtsVendorList.jsx'));
const AtsVendorForm = lazy(() => import('./ats/pages/AtsVendorForm.jsx'));
const AtsVendorDetail = lazy(() => import('./ats/pages/AtsVendorDetail.jsx'));
const AtsClientList = lazy(() => import('./ats/pages/AtsClientList.jsx'));
const AtsClientForm = lazy(() => import('./ats/pages/AtsClientForm.jsx'));
const AtsClientDetail = lazy(() => import('./ats/pages/AtsClientDetail.jsx'));
const AtsInterviewerList = lazy(() => import('./ats/pages/AtsInterviewerList.jsx'));
const AtsBlacklist = lazy(() => import('./ats/pages/AtsBlacklist.jsx'));
const AtsConsentDetails = lazy(() => import('./ats/pages/AtsConsentDetails.jsx'));


// ─── Allowed Roles — Centralised ─────────────────────────────────────────────
const ROLES = {
  MASTER: ['MASTER_ADMIN'],
  COMPANY_HUB: ['SUPER_ADMIN', 'POS_ADMIN', 'HRMS_ADMIN'],
  HRMS: ['SUPER_ADMIN', 'HRMS_ADMIN', 'HR'],
  POS: ['SUPER_ADMIN', 'POS_ADMIN', 'POS_MANAGER', 'POS_CASHIER'],
  EMPLOYEE: ['SUPER_ADMIN', 'HRMS_ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'],
  SETTINGS: ['SUPER_ADMIN', 'HRMS_ADMIN', 'POS_ADMIN'],
  ANY_AUTH: [],
};

// ─── UI Components ───────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-foreground-muted font-medium">Loading...</p>
    </div>
  </div>
);

const CrmPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

const ProductionPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

const WarehousePlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This page is under construction.</p>
  </div>
);

const AccountPlaceholder = ({ pageName }) => (
  <div className="text-center py-20">
    <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
    <p className="text-foreground-muted mt-2">This accounting page is under construction.</p>
  </div>
);

import { CrmPermissionsProvider } from './crm/context/CrmPermissionsContext.jsx'
import PermissionRoute from './crm/components/PermissionRoute.jsx'


// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <TenantProvider>
      <CrmPermissionsProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── PUBLIC ROUTES ──────────────────────────────────────── */}
              {/* <Route path='/' element={<Home />} /> */}
              <Route path='/' element={<Navigate to="/login" replace />} />
              <Route path='/features' element={<Features />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />

              {/* ── MASTER ADMIN ──────────────────────────────────────── */}
              <Route path='/master-admin' element={
                <ProtectedRoute allowedRoles={ROLES.MASTER}>
                  <MasterAdmin />
                </ProtectedRoute>
              } />

              {/* ── COMPANY HUB ───────────────────────────────────────── */}
              <Route path='/company-dashboard' element={
                <ProtectedRoute allowedRoles={ROLES.COMPANY_HUB}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />

              {/* ── HRMS ──────────────────────────────────────────────── */}
              <Route path='/hrdashboard' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><HrDashboard /></ProtectedRoute>} />
              <Route path='/employees' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><Employee /></ProtectedRoute>} />
              <Route path='/employees/add' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><AddEmployeePage /></ProtectedRoute>} />
              <Route path='/attendance' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><Attendance /></ProtectedRoute>} />
              <Route path='/attendance/*' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><Attendance /></ProtectedRoute>} />
              <Route path='/leave' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><LeaveManagement /></ProtectedRoute>} />
              <Route path='/leave/*' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><LeaveManagement /></ProtectedRoute>} />
              <Route path='/payroll-management' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><PayrollManagement /></ProtectedRoute>} />
              <Route path='/payroll-management/*' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><PayrollManagement /></ProtectedRoute>} />
              <Route path='/payroll' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><PayrollManagement /></ProtectedRoute>} />
              <Route path='/payroll/*' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><PayrollManagement /></ProtectedRoute>} />
              <Route path='/sick-leave-settings' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><SickLeaveManagement /></ProtectedRoute>} />
              <Route path='/work-schedules' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><WorkScheduleManagement /></ProtectedRoute>} />
              <Route path='/work-calendar' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><WorkCalendarManagement /></ProtectedRoute>} />
              <Route path='/shift-roster' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><EmployeeShiftRoster /></ProtectedRoute>} />
              <Route path="/users-details" element={<ProtectedRoute allowedRoles={ROLES.HRMS}><UsersDetails /></ProtectedRoute>} />

              {/* ── EMPLOYEE DASHBOARD ────────────────────────────────── */}
              <Route path='/employee-dashboard' element={<ProtectedRoute allowedRoles={ROLES.EMPLOYEE}><EmployeeDashboard /></ProtectedRoute>} />

              {/* ── SETTINGS ──────────────────────────────────────────── */}
              <Route path='/hrms-settings' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><HrmsSettings /></ProtectedRoute>} />
              <Route path='/company-settings' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><Settings /></ProtectedRoute>} />
              <Route path='/company-settings/theme'>
                <Route index element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><ThemeSettings /></ProtectedRoute>} />
                <Route path="new" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><ThemeForm /></ProtectedRoute>} />
                <Route path="edit/:id" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><ThemeForm /></ProtectedRoute>} />
              </Route>
              <Route path='/hanger-settings'>
                <Route index element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><HangerTypes /></ProtectedRoute>} />
                <Route path="new" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><HangerTypeForm /></ProtectedRoute>} />
                <Route path="edit/:id" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><HangerTypeForm /></ProtectedRoute>} />
              </Route>
              <Route path='/company-settings/party-type'>
                <Route index element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><PartyType /></ProtectedRoute>} />
                <Route path="new" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><PartyForm /></ProtectedRoute>} />
                <Route path="edit/:id" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><PartyForm /></ProtectedRoute>} />
              </Route>
              <Route path='/company-settings/product-services'>
                <Route index element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><CrmSalesProduct pageName="Product & Services" /></ProtectedRoute>} />
                <Route path="new" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><CrmSalesProductForm /></ProtectedRoute>} />
                <Route path="edit/:id" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><CrmSalesProductForm /></ProtectedRoute>} />
              </Route>
              <Route path='/company-settings/master-data' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><MasterDataSettings /></ProtectedRoute>} />
              <Route path='/account-settings' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><AccountPlaceholder pageName="Account Settings" /></ProtectedRoute>} />
              <Route path='/production-settings' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><ProductionSettings /></ProtectedRoute>} />
              <Route path='/crm-settings' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><CrmSettings /></ProtectedRoute>} />
              <Route path='/all-users' element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><AllUser /></ProtectedRoute>} />

              {/* ── HRMS REPORTS ─────────────────────────────────────── */}
              <Route path='/reports' element={<ProtectedRoute allowedRoles={ROLES.HRMS}><ReportsLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="employee" replace />} />
                <Route path='employee' element={<EmployeeReports />}>
                  <Route index element={<Navigate to="master" replace />} />
                  <Route path='master' element={<MasterEmployeeReport />} />
                  <Route path='count' element={<HeadCount />} />
                  <Route path='demographics' element={<Demographics />} />
                  <Route path='employment-status' element={<EmploymentStatus />} />
                  <Route path='documents' element={<EmployeeDocumentsReport />} />
                </Route>
                <Route path='attendance' element={<AttendanceReports />}>
                  <Route index element={<Navigate to="daily" replace />} />
                  <Route path='daily' element={<DailyAttendanceReport />} />
                  <Route path='monthly' element={<MonthlyAttendanceReport />} />
                  <Route path='overtime' element={<OvertimeReport />} />
                  <Route path='compliance' element={<ComplianceReport />} />
                </Route>
                <Route path='leave' element={<LeaveReports />}>
                  <Route index element={<Navigate to="accrual" replace />} />
                  <Route path='accrual' element={<LeaveAccrualReport />} />
                </Route>
                <Route path='payroll' element={<PayrollReports />}>
                  <Route index element={<Navigate to="register" replace />} />
                  <Route path='register' element={<PayrollRegisterReport />} />
                  <Route path='wps-sif' element={<WpsSifReport />} />
                  <Route path='compliance' element={<WpsComplianceReport />} />
                </Route>
                <Route path='compliance' element={<ComplianceReports />}>
                  <Route index element={<Navigate to="labor-card" replace />} />
                  <Route path='labor-card' element={<LaborCardReport />} />
                  <Route path='company-quota' element={<CompanyQuotaReport />} />
                  <Route path='nationality' element={<NationalityReport />} />
                  <Route path='emiratization' element={<EmiratizationReport />} />
                  <Route path='absconding' element={<AbscondingReport />} />
                </Route>
                <Route path='eos' element={<EndOfServiceReports />}>
                  <Route index element={<Navigate to="eosb" replace />} />
                  <Route path='eosb' element={<EosbCalculationReport />} />
                  <Route path='final-settlement' element={<FinalSettlementReport />} />
                  <Route path='termination-reason' element={<TerminationReasonReport />} />
                </Route>
              </Route>

              {/* ── POS ───────────────────────────────────────────────── */}
              <Route path='/pos-dashboard' element={<ProtectedRoute allowedRoles={ROLES.POS}><PosDashboard /></ProtectedRoute>} />
              <Route path='/product-scan/:barcode' element={<ProtectedRoute allowedRoles={ROLES.POS}><ProductScanResult /></ProtectedRoute>} />
              <Route path='/pos-reports' element={<ProtectedRoute allowedRoles={ROLES.POS}><PosReportsLayout /></ProtectedRoute>}>
                <Route path='business-summary' element={<BusinessSummary />} />
                <Route path='daily-sales' element={<DailySummaryReport />} />
                <Route path='total-daily-sales' element={<TotalDailyReports />} />
                <Route path='closing' element={<ClosingReport />} />
                <Route path='sales-support' element={<SalesSupportReport />} />
                <Route path='sales-payment' element={<SalesPaymentReport />} />
                <Route path='sales-source' element={<SalesSourceReport />} />
                <Route path='total-sales' element={<TotalSalesReport />} />
                <Route path='sales-status' element={<SalesStatusReport />} />
                <Route path='delivery-driver-report' element={<DeliveryDriverReport />} />
                <Route path='sales-forecasting-report' element={<SalesForecastingReport />} />
                <Route path='payment-change-report' element={<PaymentChangeReport />} />
                <Route path='sales-discount-report' element={<SalesDiscountReport />} />
                <Route path='cancellation-report' element={<CancellationReport />} />
                <Route path='void-report' element={<VoidReport />} />
                <Route path='item-movement-report' element={<ItemMovementReport />} />
                <Route path='slow-selling-report' element={<SlowSellingReport />} />
                <Route path='best-selling-report' element={<BestSellingReport />} />
                <Route path='item-sales-report' element={<ItemSalesReport />} />
                <Route path='user-transfer' element={<UserTransfer />} />
                <Route path='gl-journal-entries' element={<GlJournalEntries />} />
                <Route path='trial-balance' element={<PosTrialBalance />} />
                <Route path='card-settlement' element={<CardSettlementReport />} />
                <Route path='vat-output' element={<VatOutputReport />} />
                <Route path='cash-variance' element={<CashVarianceReport />} />
              </Route>

              <Route path='/pos-financial-reports' element={<ProtectedRoute allowedRoles={ROLES.POS}><FinancialReportsLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="gl-journal-entries" replace />} />
                <Route path='gl-journal-entries' element={<GlJournalEntries />} />
                <Route path='trial-balance' element={<PosTrialBalance />} />
                <Route path='profit-and-loss' element={<PosProfitAndLoss />} />
                <Route path='balance-sheet' element={<PosBalanceSheet />} />
                <Route path='card-settlement' element={<CardSettlementReport />} />
                <Route path='vat-output' element={<VatOutputReport />} />
                <Route path='cash-variance' element={<CashVarianceReport />} />
              </Route>



              {/* ── CRM ───────────────────────────────────────────────── */}
              <Route path='/crm-dashboard' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><CrmModule /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PermissionRoute module="DASHBOARD"><CrmDashboard /></PermissionRoute>} />
                <Route path="recent-activities" element={<PermissionRoute module="DASHBOARD"><CrmRecentActivityPage /></PermissionRoute>} />
                <Route path="home" element={<CrmHome />} />
                <Route path="calling-data" element={<PermissionRoute module="CALL_LOG"><CrmCallingData /></PermissionRoute>} />
                <Route path="calling-data/new" element={<PermissionRoute module="CALL_LOG"><CrmCallLogFormPage /></PermissionRoute>} />
                <Route path="calling-data/edit/:id" element={<PermissionRoute module="CALL_LOG"><CrmCallLogFormPage /></PermissionRoute>} />
                <Route path="leads" element={<PermissionRoute module="LEAD"><CrmLead pageName="Leads" /></PermissionRoute>} />
                <Route path="leads/all" element={<PermissionRoute module="LEAD"><LeadDetails /></PermissionRoute>} />
                <Route path="leads/new" element={<PermissionRoute module="LEAD"><CrmLeadFormPage /></PermissionRoute>} />
                <Route path="leads/edit/:id" element={<PermissionRoute module="LEAD"><CrmLeadFormPage /></PermissionRoute>} />
                <Route path="lead-info" element={<PermissionRoute module="LEAD"><LeadInfo /></PermissionRoute>} />
                <Route path="leads/:leadId" element={<PermissionRoute module="LEAD"><LeadInfo /></PermissionRoute>} />
                <Route path="companies" element={<PermissionRoute module="COMPANY"><CrmCompanies pageName="Companies" /></PermissionRoute>} />
                <Route path="companies/new" element={<PermissionRoute module="COMPANY"><CrmCompanyFormPage /></PermissionRoute>} />
                <Route path="companies/edit/:id" element={<PermissionRoute module="COMPANY"><CrmCompanyFormPage /></PermissionRoute>} />
                <Route path="contacts" element={<PermissionRoute module="CONTACT"><CrmContacts pageName="Contacts" /></PermissionRoute>} />
                <Route path="contacts/new" element={<PermissionRoute module="CONTACT"><CrmContactFormPage /></PermissionRoute>} />
                <Route path="contacts/edit/:id" element={<PermissionRoute module="CONTACT"><CrmContactFormPage /></PermissionRoute>} />
                <Route path='products'>
                  <Route index element={<Navigate to="/company-settings/product-services" replace />} />
                  <Route path="new" element={<Navigate to="/company-settings/product-services/new" replace />} />
                  <Route path="edit/:id" element={<Navigate to="/company-settings/product-services" replace />} />
                </Route>
                <Route path="deals" element={<PermissionRoute module="DEAL"><CrmDeals /></PermissionRoute>} />
                <Route path="deals/new" element={<PermissionRoute module="DEAL"><CrmDealFormPage /></PermissionRoute>} />
                <Route path="deals/edit/:id" element={<PermissionRoute module="DEAL"><CrmDealFormPage /></PermissionRoute>} />
                <Route path="tasks" element={<PermissionRoute module="TASK"><CrmTasks /></PermissionRoute>} />
                <Route path="tasks/new" element={<PermissionRoute module="TASK"><CrmTaskFormPage /></PermissionRoute>} />
                <Route path="tasks/edit/:id" element={<PermissionRoute module="TASK"><CrmTaskFormPage /></PermissionRoute>} />
                <Route path="calendar" element={<PermissionRoute module="EVENT"><CrmCalendarPage /></PermissionRoute>} />
                <Route path="calendar/events/new" element={<PermissionRoute module="EVENT"><CrmEventFormPage /></PermissionRoute>} />
                <Route path="calendar/events/edit/:id" element={<PermissionRoute module="EVENT"><CrmEventFormPage /></PermissionRoute>} />
                <Route path="roles" element={<PermissionRoute module="SETTINGS"><CrmRolesPage /></PermissionRoute>} />
                <Route path="operations" element={<PermissionRoute module="TODO"><CrmOperations /></PermissionRoute>} />
                <Route path="operations/events/new" element={<PermissionRoute module="TODO"><CrmEventFormPage /></PermissionRoute>} />
                <Route path="operations/events/edit/:id" element={<PermissionRoute module="TODO"><CrmEventFormPage /></PermissionRoute>} />
              </Route>

              {/* ── SALES ─────────────────────────────────────────────── */}
              <Route path="/sales-dashboard" element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><SalesLayout /></ProtectedRoute>}>
                <Route index element={<SalesDashboard />} />
                <Route path="delivery-orders">
                  <Route index element={<DeliveryOrder />} />
                  <Route path="new" element={<DeliveryOrderForm />} />
                  <Route path="edit/:id" element={<DeliveryOrderForm />} />
                  <Route path=":id" element={<DeliveryOrderView />} />
                </Route>
                <Route path='quotations'>
                  <Route index element={<Quotation />} />
                  <Route path='new' element={<QuotationForm />} />
                  <Route path='edit/:id' element={<QuotationForm />} />
                  <Route path='revise/:id' element={<QuotationForm />} />
                  <Route path=':id' element={<ViewQuotation />} />
                </Route>
                <Route path='invoices'>
                  <Route index element={<Invoice />} />
                  <Route path='new' element={<InvoiceForm />} />
                  <Route path='edit/:id' element={<InvoiceForm />} />
                  <Route path=':id' element={<InvoiceView />} />
                </Route>
                <Route path="rental-quotations">
                  <Route index element={<RentalQuotation />} />
                  <Route path="new" element={<RentalQuotationForm />} />
                  <Route path="edit/:id" element={<RentalQuotationForm />} />
                  <Route path=":id" element={<RentalQuotationView />} />
                </Route>
                <Route path="rental-sales-orders">
                  <Route index element={<RentalSalesOrder />} />
                  <Route path="new" element={<RentalSalesOrderForm />} />
                  <Route path="edit/:id" element={<RentalSalesOrderForm />} />
                  <Route path=":id" element={<RentalSalesOrderView />} />
                </Route>
                <Route path="rental-item-received">
                  <Route index element={<RentalItemRecieved />} />
                  <Route path="new" element={<RentalItemRecievedForm />} />
                  <Route path="edit/:id" element={<RentalItemRecievedForm />} />
                  <Route path="by-order/:orderId" element={<RentalItemReceivedByOrder />} />
                  <Route path=":id" element={<RentalItemRecievedView />} />
                </Route>
                <Route path="recieved-amounts">
                  <Route index element={<RecievedAmount />} />
                  <Route path="new" element={<RecievedAmountForm />} />
                  <Route path="edit/:id" element={<RecievedAmountForm />} />
                  <Route path=":id" element={<RecievedAmountView />} />
                </Route>
                <Route path="credit-notes">
                  <Route index element={<CreditNotes />} />
                  <Route path="new" element={<CreditNotesForm />} />
                  <Route path="edit/:id" element={<CreditNotesForm />} />
                  <Route path=":id" element={<CreditNotesView />} />
                </Route>
                <Route path="orders">
                  <Route index element={<Orders />} />
                  <Route path="new" element={<OrderForm />} />
                  <Route path="edit/:id" element={<OrderForm />} />
                  <Route path=":id" element={<ViewSales />} />
                </Route>
                <Route path="proforma-invoices">
                  <Route index element={<ProformaInvoice />} />
                  <Route path="new" element={<ProformaInvoiceForm />} />
                  <Route path="edit/:id" element={<ProformaInvoiceForm />} />
                  <Route path=":id" element={<ProformaInvoiceView />} />
                </Route>
                <Route path="rental-invoices">
                  <Route index element={<RentalInvoice />} />
                  <Route path="new" element={<RentalInvoiceForm />} />
                  <Route path="edit/:id" element={<RentalInvoiceForm />} />
                  <Route path=":id" element={<RentalInvoiceView />} />
                </Route>
                <Route path="additional-expenses">
                  <Route index element={<SalAdditionalExpensePage />} />
                  <Route path="new" element={<SalAdditionalExpenseForm />} />
                  <Route path="edit/:id" element={<SalAdditionalExpenseForm />} />
                  <Route path="view/:id" element={<SalAdditionalExpenseView />} />
                </Route>
                <Route path="reports">
                  <Route path="sales-order-by-item" element={<SalesOrderByItemReport />} />
                  <Route path="sales-order-by-customer" element={<SalesOrderByCustomerReport />} />
                  <Route path="due-bills" element={<ListOfDueBillsReport />} />
                  <Route path="due-invoices" element={<ListOfDueInvoicesReport />} />
                  <Route path="sales-by-salesperson" element={<SalesBySalesPersonReport />} />
                  <Route path="sales-by-item" element={<SalesByItemReport />} />
                  <Route path="sales-by-customer" element={<SalesByCustomerReport />} />
                </Route>
                <Route path='settings' element={<SalesSetting />} />
              </Route>

              {/* ── ACCOUNTING (Phase 1 Rebuild) ─────────────────────── */}
              <Route path='/account-dashboard/*' element={
                <ProtectedRoute allowedRoles={ROLES.ANY_AUTH}>
                  <AccountingRouter />
                </ProtectedRoute>
              } />

              {/* ── PRODUCTION ────────────────────────────────────────── */}
              <Route path='/production/finished-goods/new' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProFinishedGoodForm /></ProtectedRoute>} />
              <Route path='/production/finished-goods/edit/:id' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProFinishedGoodForm /></ProtectedRoute>} />
              <Route path='/production/finished-goods/:itemId/process' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProcessFinishedGood /></ProtectedRoute>} />
              <Route path='/production/finished-goods/:itemId/bom' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><BomFinishedGood /></ProtectedRoute>} />
              <Route path='/production/semi-finished/new' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProSemiFinishedForm /></ProtectedRoute>} />
              <Route path='/production/semi-finished/edit/:id' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProSemiFinishedForm /></ProtectedRoute>} />
              <Route path='/production/semi-finished/:itemId/process' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><ProcessSemiFinished /></ProtectedRoute>} />
              <Route path='/production/semi-finished/:itemId/bom' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><BomSemiFinished /></ProtectedRoute>} />

              <Route path="/production-dashboard" element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><Production /></ProtectedRoute>}>
                <Route index element={<ProductionDashboard />} />
                <Route path="overview" element={<ProductionDashboard />} />
                <Route path="manage-manufacturing-order" element={<ManufacturingOrder />} />
                <Route path="manage-manufacturing-order/new" element={<ManufacturingOrderForm />} />
                <Route path="manage-manufacturing-order/edit/:id" element={<ManufacturingOrderForm />} />
                <Route path="view-manufacturing-order" element={<ViewManufacturingOrder />} />
                <Route path="view-manufacturing-order/:id" element={<ViewManufacturingOrder />} />
                <Route path="production-schedule" element={<ProductionSchedule />} />
                <Route path="production-operation" element={<ProductionOperation />} />
                <Route path="my-production" element={<MyProductionPlan />} />
                <Route path="hanger">
                  <Route path="batches">
                    <Route index element={<BatchListPage />} />
                    <Route path="new" element={<BatchForm />} />
                    <Route path="wip" element={<WipTrackingPage />} />
                    <Route path="oee" element={<OeeDashboardPage />} />
                    <Route path="reports" element={<ProductionReportsPage />} />
                    <Route path=":id" element={<BatchDetailPage />} />
                    <Route path=":id/cost-sheet" element={<CostSheetPage />} />
                  </Route>
                  <Route path="settings/cost-rate" element={<CostRateSettings />} />
                </Route>
                <Route path="material-requisition" element={<ProductionPlaceholder pageName="Material Requisition" />} />
                <Route path="work-order-report" element={<ProductionPlaceholder pageName="Work Order Report" />} />
              </Route>

              {/* ── PURCHASE ──────────────────────────────────────────── */}
              <Route path="/purchase-dashboard/*" element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><PurchaseModule /></ProtectedRoute>} />

              {/* ── MATERIAL ──────────────────────────────────────────── */}
              <Route path="/material-dashboard" element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><MaterialModule /></ProtectedRoute>}>
                <Route index element={<Navigate to="material-requisition" replace />} />
                <Route path="material-requisition" element={<MaterialRequisition filterPreset={{}} />} />
                <Route path="reserved-material" element={<MaterialReservedTab />} />
                <Route path="issued-material" element={<IssueRawMaterialTab />} />
                <Route path="indent-requisition" element={<ViewIndentMaterialTab />} />
                <Route path="indent-requisition/new" element={<IndentRequisionForm />} />
                <Route path="indent-requisition/edit/:id" element={<IndentRequisionForm />} />
                <Route path="indent-pending" element={<IndentRequisionPOTab />} />
                <Route path="indent-created" element={<IndentRequisionPOCreatedTab />} />
                <Route path="issue-raw-material/:id" element={<IssueRawMaterial />} />
                <Route path="reserve-raw-material/:id" element={<MaterialReserved />} />
                <Route path="unreserve-raw-material/:id" element={<UnreserveRawMaterial />} />
                <Route path="indent-reception/:id" element={<IndentMaterial />} />
              </Route>

              {/* ── WAREHOUSE ─────────────────────────────────────────── */}
              <Route path="/warehouse-dashboard" element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><WarehouseModule /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<WarehouseDashboard />} />
                <Route path="inventory" element={<WarehousePlaceholder pageName="Inventory" />} />
                <Route path="fg-stock" element={<FgStockPage />} />
                <Route path="coil-stock" element={<CoilStock />} />
                <Route path="stock-in" element={<WarehousePlaceholder pageName="Stock In" />} />
                <Route path="stock-out" element={<WarehousePlaceholder pageName="Stock Out" />} />
              </Route>



              {/* ── FIXED ASSET ────────────────────────────────────────── */}
              <Route path='/fixed-asset-dashboard' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><FixedAssetModule /></ProtectedRoute>}>
                <Route index element={<FixedAssetDashboard />} />
                <Route path="dashboard" element={<FixedAssetDashboard />} />
                <Route path="assets" element={<AssetList />} />
                <Route path="assets/new" element={<FixedAssetForm />} />
                <Route path="assets/edit/:id" element={<FixedAssetForm />} />
                <Route path="categories" element={<CategoryList />} />
              </Route>

              {/* ── ATS ────────────────────────────────────────────────── */}
              <Route path='/ats-dashboard' element={<ProtectedRoute allowedRoles={ROLES.ANY_AUTH}><AtsModule /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AtsDashboard />} />
                <Route path="applicants" element={<AtsApplicants />} />
                <Route path="applicants/add" element={<AddApplicantPage />} />
                <Route path="applicants/:id" element={<AtsApplicantDetail />} />
                <Route path="vendors" element={<AtsVendorList />} />
                <Route path="vendors/new" element={<AtsVendorForm />} />
                <Route path="vendors/:id" element={<AtsVendorDetail />} />
                <Route path="vendors/:id/edit" element={<AtsVendorForm />} />
                <Route path="clients" element={<AtsClientList />} />
                <Route path="clients/new" element={<AtsClientForm />} />
                <Route path="clients/:id" element={<AtsClientDetail />} />
                <Route path="clients/:id/edit" element={<AtsClientForm />} />
                <Route path="interviewers" element={<AtsInterviewerList />} />
                <Route path="blacklist" element={<AtsBlacklist />} />
                <Route path="consent" element={<AtsConsentDetails />} />
              </Route>
              <Route path="/ats-settings" element={<ProtectedRoute allowedRoles={ROLES.SETTINGS}><AtsSettings /></ProtectedRoute>} />


              {/* ── FLEET MANAGEMENT ─────────────────────────────────────────── */}
              <Route path="/fleet-dashboard" element={
                <ProtectedRoute allowedRoles={ROLES.ANY_AUTH}>
                  <FleetLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<FleetDashboard />} />
                <Route path="vehicle-details/:id" element={<VehicleDetails />} />
                <Route path="driver-details/:id" element={<DriverDetails />} />
                <Route path="customer-details/:id" element={<CustomerDetails />} />
                <Route path="vendor-details/:id" element={<VendorDetails />} />
                <Route path="vendors/vendor-form" element={<VendorFormPage />} />
                <Route path="vendors/vendor-form/:id" element={<VendorFormPage />} />
                <Route path="customers/customer-form" element={<CustomerFormPage />} />
                <Route path="customers/customer-form/:id" element={<CustomerFormPage />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="vehicles/vehicle-form" element={<VehicleFormPage />} />
                <Route path="vehicles/vehicle-form/:id" element={<VehicleFormPage />} />
                <Route path="drivers" element={<Drivers />} />
                <Route path="drivers/driver-form" element={<DriverFormPage />} />
                <Route path="drivers/driver-form/:id" element={<DriverFormPage />} />
                <Route path="routes" element={<RoutesPage />} />
                <Route path="routes/route-form" element={<RouteFormPage />} />
                <Route path="routes/route-form/:id" element={<RouteFormPage />} />
                <Route path="routes/route-details/:id" element={<RouteDetailsPage />} />
                <Route path="maintenance" element={<VehicleMaintenance />} />
                <Route path="maintenance/maintenance-form" element={<MaintenanceFormPage />} />
                <Route path="maintenance/maintenance-form/:id" element={<MaintenanceFormPage />} />
                <Route path="fuel" element={<FuelLog />} />
                <Route path="fuel/fuel-form" element={<FuelFormPage />} />
                <Route path="fuel/fuel-form/:id" element={<FuelFormPage />} />
                <Route path="fuel/fuel-details/:id" element={<FuelDetailsPage />} />
                <Route path="dispatch" element={<DispatchJobs />} />
                <Route path="dispatch/job-form" element={<DispatchFormPage />} />
                <Route path="dispatch/job-form/:id" element={<DispatchFormPage />} />
                <Route path="dispatch/job-details/:id" element={<DispatchDetailsPage />} />
                <Route path="complaints" element={<Complaints />} />
                <Route path="complaints/complaint-form" element={<ComplaintFormPage />} />
                <Route path="complaints/complaint-form/:id" element={<ComplaintFormPage />} />
                <Route path="complaints/complaint-details/:id" element={<ComplaintDetailsPage />} />
                <Route path="performance" element={<DriverPerformances />} />
                <Route path="performance/performance-form" element={<DriverPerformanceFormPage />} />
                <Route path="performance/performance-form/:id" element={<DriverPerformanceFormPage />} />
                <Route path="performance/performance-details/:id" element={<DriverPerformanceDetailsPage />} />
                <Route path="compliance" element={<DocumentTrackingDashboard />} />
                <Route path="alerts" element={<FleetAlerts />} />

                {/* Merged Trip Routes */}
                <Route path="trips" element={<Trips />} />
                <Route path="trips/trip-form" element={<TripFormPage />} />
                <Route path="trips/trip-form/:id" element={<TripFormPage />} />
                <Route path="trips/trip-details/:id" element={<TripDetails />} />
                <Route path="trips/dispatch/:id" element={<TripDispatchPage />} />
                <Route path="trips/trip-tracker/:id" element={<TripTracker />} />
                <Route path="customers" element={<Customers />} />
                <Route path="trip-customers" element={<Customers />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="trip-vendors" element={<Vendors />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/invoice-form" element={<InvoiceFormPage />} />
                <Route path="invoices/invoice-form/:id" element={<InvoiceFormPage />} />
                <Route path="invoices/invoice-details/:id" element={<InvoiceDetailsPage />} />
                <Route path="invoices/new" element={<InvoiceFormPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="trip-reports" element={<ReportsDashboard />} />
                <Route path="trip-reports/report-form" element={<ReportFormPage />} />
                <Route path="trip-reports/report-form/:id" element={<ReportFormPage />} />
                <Route path="trip-reports/report-details/:id" element={<ReportDetailsPage />} />
              </Route>

              {/* ── NOTIFICATION ──────────────────────────────────────── */}
              <Route path="/notification-dashboard" element={
                <ProtectedRoute allowedRoles={ROLES.ANY_AUTH}>
                  <NotificationModule />
                </ProtectedRoute>
              }>
                <Route index element={<NotificationDashboard />} />
                <Route path="email" element={<EmailNotification />} />
                <Route path="whatsapp" element={<WhatsAppNotification />} />
                <Route path="sms" element={<SmsNotification />} />
                <Route path="telegram" element={<TelegramNotification />} />
                <Route path="website" element={<WebsiteIntegration />} />
                <Route path="lead-capture" element={<LeadCapture />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </CrmPermissionsProvider>
      <ToastContainer />
    </TenantProvider>
  )
}

export default App
