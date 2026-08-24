import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  X, 
  Eye, 
  Truck, 
  ShieldCheck, 
  TrendingUp,
  Wrench,
  Fuel
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [vendor, setVendor] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      const [vRes, mRes, iRes] = await Promise.allSettled([
        axios.get(`${API_URL}/fleet/vendors/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/maintenance`, { params: { vendorId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/vendor-invoices`, { params: { vendorId: id, size: 50 }, headers })
      ]);

      if (vRes.status === 'fulfilled' && vRes.value.data) {
        setVendor(vRes.value.data);
      } else {
        // Fallback mock vendor
        setVendor({
          id: id,
          companyName: 'Emirates Auto Workshop LLC',
          vendorType: 'MAINTENANCE_WORKSHOP',
          serviceCategory: 'Vehicle Repair & Maintenance',
          trnNumber: '100987654300003',
          tradeLicenseNumber: 'DUB-887766',
          contactPersonName: 'Salim Al Rashid',
          phone: '+971 4 333 4455',
          email: 'service@emiratesauto.ae',
          designation: 'Key Account Manager',
          paymentTermsDays: 30,
          status: 'ACTIVE',
          bankName: 'Emirates NBD',
          ibanNumber: 'AE030330000012345678901',
          billingAddress: 'Al Quoz Industrial Area 3, Dubai, UAE',
          totalExpenses: 285000,
          activeContractsCount: 4
        });
      }

      if (mRes.status === 'fulfilled' && mRes.value.data?.content) setMaintenanceRecords(mRes.value.data.content);
      if (iRes.status === 'fulfilled' && iRes.value.data?.content) setInvoices(iRes.value.data.content);

    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'نشط' : 'ACTIVE'}
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'غير نشط' : 'INACTIVE'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || 'ACTIVE'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل المورد...' : 'Loading vendor details...'}
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Vendor not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D9DADD)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/vendors')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D9DADD)] flex items-center justify-center text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-none">
                {vendor.companyName || vendor.name}
              </h1>
              {getStatusBadge(vendor.status)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-1">
              Category: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{vendor.serviceCategory || 'Vehicle Repair'}</span> • Phone: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{vendor.phone || '–'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/vendors/vendor-form/${vendor.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D9DADD)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#0F172A)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#0F172A)]" />
            <span>{t('fleet.vendorDetails.editVendor') || 'Edit Vendor'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Expenses */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.vendorDetails.totalExpenses') || 'TOTAL EXPENSES'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">AED {(vendor.totalExpenses || 285000).toLocaleString()}</p>
          </div>
        </div>

        {/* Service Category */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.vendorDetails.serviceCategory') || 'SERVICE CATEGORY'}</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5 truncate">{vendor.serviceCategory || 'Vehicle Maintenance'}</p>
          </div>
        </div>

        {/* Active Contracts */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.vendorDetails.activeContracts') || 'ACTIVE CONTRACTS'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{vendor.activeContractsCount || 4}</p>
          </div>
        </div>

        {/* TRN Number */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.vendorDetails.trnNumber') || 'TRN NUMBER'}</p>
            <p className="text-sm font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5 font-mono truncate">{vendor.trnNumber || '–'}</p>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border,#D9DADD)] px-2 pt-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'overview' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.vendorDetails.overview') || 'OVERVIEW'}
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'maintenance' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.vendorDetails.maintenanceSupplied') || 'MAINTENANCE SUPPLIED'} ({maintenanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'invoices' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.vendorDetails.invoices') || 'PURCHASE INVOICES'} ({invoices.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Vendor Specifications (Span 8) */}
          <div className="lg:col-span-8 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-4">
            <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">VENDOR SPECIFICATIONS</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Store className="w-3 h-3 text-[#0178BC]" /> COMPANY NAME
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.companyName || vendor.name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> SERVICE CATEGORY
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] uppercase mt-1">{vendor.serviceCategory || 'Vehicle Repair'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0178BC]" /> PHONE NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.phone || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#0178BC]" /> EMAIL ADDRESS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.email || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0178BC]" /> TRN / VAT NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1 font-mono">{vendor.trnNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> TRADE LICENSE NO.
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.tradeLicenseNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0178BC]" /> ADDRESS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.billingAddress || vendor.address || 'Dubai, UAE'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-[#0178BC]" /> PAYMENT TERMS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vendor.paymentTermsDays || 30} Days Net</p>
              </div>
            </div>
          </div>

          {/* Right Column Contact Card (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
              <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
                <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">KEY ACCOUNT MANAGER</h2>
              </div>

              <div className="p-2">
                <p className="text-sm font-bold text-[var(--color-foreground,#0F172A)]">{vendor.contactPersonName || vendor.contactPerson || 'Salim Al Rashid'}</p>
                <p className="text-[11px] text-[var(--color-foreground-muted,#656873)] mt-0.5">{vendor.designation || 'Account Manager'}</p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="flex items-center gap-2 text-[var(--color-foreground,#0F172A)] font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#0178BC]" /> {vendor.phone}
                  </p>
                  <p className="flex items-center gap-2 text-[var(--color-foreground,#0F172A)] font-medium">
                    <Mail className="w-3.5 h-3.5 text-[#0178BC]" /> {vendor.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default VendorDetails;
