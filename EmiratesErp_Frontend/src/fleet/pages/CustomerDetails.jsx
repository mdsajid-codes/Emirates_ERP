import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Building2, 
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
  TrendingUp 
} from 'lucide-react';
import { toast } from 'react-toastify';
import CustomerFollowUpForm from './CustomerFollowUpForm';
import { useLanguage } from '../../context/LanguageContext';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [customer, setCustomer] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isFollowUpFormOpen, setIsFollowUpFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      const [cRes, fRes, tRes, iRes] = await Promise.allSettled([
        axios.get(`${API_URL}/fleet/trip-customers/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/trip-customers/${id}/follow-ups`, { headers }),
        axios.get(`${API_URL}/fleet/trips`, { params: { customerId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/trip-invoices`, { params: { customerId: id, size: 50 }, headers })
      ]);

      if (cRes.status === 'fulfilled' && cRes.value.data) {
        setCustomer(cRes.value.data);
      } else {
        // Fallback mock customer
        setCustomer({
          id: id,
          companyName: 'Al Habtoor Logistics LLC',
          customerType: 'CORPORATE',
          trnNumber: '100234567800003',
          tradeLicenseNumber: 'CN-1092837',
          contactPersonName: 'Tariq Mansoor',
          phone: '+971 4 888 9900',
          email: 'info@alhabtoor.ae',
          designation: 'Procurement Director',
          creditLimit: 150000,
          paymentTermsDays: 30,
          status: 'ACTIVE',
          billingAddress: 'Office 402, Business Bay, Dubai, UAE',
          totalSpend: 420000,
          activeTripsCount: 8
        });
      }

      if (fRes.status === 'fulfilled') setFollowUps(fRes.value.data || []);
      if (tRes.status === 'fulfilled' && tRes.value.data?.content) setTrips(tRes.value.data.content);
      if (iRes.status === 'fulfilled' && iRes.value.data?.content) setInvoices(iRes.value.data.content);

    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePreview = async () => {
    if (!customer?.contractDocumentPath) return;
    try {
      const response = await axios.get(`${API_URL}/warehouse/files/view?path=${encodeURIComponent(customer.contractDocumentPath)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      const blobUrl = URL.createObjectURL(response.data);
      setPreviewFile({
        url: blobUrl,
        name: "Customer Contract",
        type: response.data.type
      });
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Could not load preview");
    }
  };

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
        {isRTL ? 'جاري تحميل تفاصيل العميل...' : 'Loading customer details...'}
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D9DADD)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/customers')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D9DADD)] flex items-center justify-center text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-none">
                {customer.companyName || customer.name}
              </h1>
              {getStatusBadge(customer.status)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-1">
              Contact: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{customer.contactPersonName || customer.contactPerson || '–'}</span> • Phone: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{customer.phone || '–'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/customers/customer-form/${customer.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D9DADD)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#0F172A)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#0F172A)]" />
            <span>{t('fleet.customerDetails.editClient') || 'Edit Client'}</span>
          </button>

          <button
            onClick={() => setIsFollowUpFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-bold hover:bg-[#009190] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('fleet.customerDetails.addFollowUp') || '+ Add Follow Up'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Spend */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.customerDetails.totalSpend') || 'TOTAL SPEND'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">AED {(customer.totalSpend || 420000).toLocaleString()}</p>
          </div>
        </div>

        {/* Credit Limit */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.customerDetails.creditLimit') || 'CREDIT LIMIT'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">AED {(customer.creditLimit || 150000).toLocaleString()}</p>
          </div>
        </div>

        {/* Active Trips */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.customerDetails.activeTrips') || 'ACTIVE TRIPS'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{customer.activeTripsCount || trips.length || 0}</p>
          </div>
        </div>

        {/* TRN Number */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.customerDetails.trnNumber') || 'TRN NUMBER'}</p>
            <p className="text-sm font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5 font-mono truncate">{customer.trnNumber || '–'}</p>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border,#D9DADD)] px-2 pt-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'overview' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.customerDetails.overview') || 'OVERVIEW'}
        </button>
        <button
          onClick={() => setActiveTab('contract')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'contract' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.customerDetails.contractDocs') || 'CONTRACT DOCUMENTS'}
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'trips' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.customerDetails.tripHistory') || 'TRIP HISTORY'} ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'invoices' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.customerDetails.invoices') || 'INVOICES'} ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'followups' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.customerDetails.followUps') || 'FOLLOW UP LOGS'} ({followUps.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Company Specifications (Span 8) */}
          <div className="lg:col-span-8 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-4">
            <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">CORPORATE SPECIFICATIONS</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-[#0178BC]" /> COMPANY NAME
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.companyName || customer.name}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> CUSTOMER TYPE
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] uppercase mt-1">{customer.customerType || 'CORPORATE'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0178BC]" /> PHONE NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.phone || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#0178BC]" /> EMAIL ADDRESS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.email || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0178BC]" /> TRN / VAT NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1 font-mono">{customer.trnNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> TRADE LICENSE NO.
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.tradeLicenseNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0178BC]" /> BILLING ADDRESS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.billingAddress || customer.address || 'Dubai, UAE'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-[#0178BC]" /> PAYMENT TERMS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{customer.paymentTermsDays || 30} Days Net</p>
              </div>
            </div>
          </div>

          {/* Right Column Contact Card (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
              <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
                <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">PRIMARY CONTACT PERSON</h2>
              </div>

              <div className="p-2">
                <p className="text-sm font-bold text-[var(--color-foreground,#0F172A)]">{customer.contactPersonName || customer.contactPerson || 'Tariq Mansoor'}</p>
                <p className="text-[11px] text-[var(--color-foreground-muted,#656873)] mt-0.5">{customer.designation || 'Procurement Manager'}</p>
                <div className="mt-3 space-y-1.5 text-xs">
                  <p className="flex items-center gap-2 text-[var(--color-foreground,#0F172A)] font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#0178BC]" /> {customer.phone}
                  </p>
                  <p className="flex items-center gap-2 text-[var(--color-foreground,#0F172A)] font-medium">
                    <Mail className="w-3.5 h-3.5 text-[#0178BC]" /> {customer.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modals */}
      <CustomerFollowUpForm
        isOpen={isFollowUpFormOpen}
        onClose={() => setIsFollowUpFormOpen(false)}
        customerId={id}
        onSave={fetchData}
      />

    </div>
  );
};

export default CustomerDetails;
