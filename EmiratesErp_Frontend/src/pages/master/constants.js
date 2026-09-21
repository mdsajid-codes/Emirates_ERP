
import { LayoutDashboard, Building, Activity, Users, Receipt, MonitorSpeaker } from 'lucide-react';

export const serviceModulesOptions = [
    { value: 'HRMS_CORE', label: 'HRMS Core' },
    { value: 'HRMS_ATTENDANCE', label: 'HRMS Attendance' },
    { value: 'HRMS_LEAVE', label: 'HRMS Leave' },
    { value: 'HRMS_PAYROLL', label: 'HRMS Payroll' },
    { value: 'HRMS_RECRUITMENT', label: 'HRMS Recruitment' },
    { value: 'POS', label: 'Point of Sale (POS)' },
    { value: 'CRM', label: 'CRM' },
    { value: 'PRODUCTION', label: 'Production' },
    { value: 'SALES', label: 'Sales' },
    { value: 'PURCHASE', label: 'Purchase' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'WAREHOUSE', label: 'Warehouse' },
    { value: 'ACCOUNTS', label: 'Accounts' },
    { value: 'FIXED_ASSETS', label: 'Fixed Assets' },
    { value: 'HANGER_MANUFACTURING', label: 'Hanger Manufacturing' },
    { value: 'TRIP_MANAGEMENT', label: 'Trip Management' },
    { value: 'NOTIFICATION', label: 'Notification' },
    { value: 'ATS', label: 'ATS' }
];

export const adminRoleOptions = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'HRMS_ADMIN', label: 'HRMS Admin' },
    { value: 'HR', label: 'HR' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'POS_ADMIN', label: 'POS Admin' },
    { value: 'POS_MANAGER', label: 'POS Manager' },
    { value: 'POS_CASHIER', label: 'POS Cashier' },
];

export const masterRoleOptions = [
    { value: 'MASTER_ADMIN', label: 'Master Admin' },
];

export const masterNavLinks = [
    { name: 'Dashboard',      view: 'dashboard',     icon: LayoutDashboard,  color: 'text-sky-500' },
    { name: 'Tenants',        view: 'tenants',       icon: Building,         color: 'text-orange-500' },
    { name: 'Requests',       view: 'requests',      icon: Activity,         color: 'text-yellow-500' },
    { name: 'Demo Requests',  view: 'demo-requests', icon: MonitorSpeaker,   color: 'text-teal-500' },
    { name: 'Tenant Company', view: 'tenant-company',icon: Building,         color: 'text-indigo-500' },
    { name: 'Tenant Invoice', view: 'tenant-invoice',icon: Receipt,          color: 'text-green-600' },
];
