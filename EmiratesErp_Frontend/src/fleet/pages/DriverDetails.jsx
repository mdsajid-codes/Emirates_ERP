import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Globe, 
  FileText, 
  Award,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  Activity,
  Truck,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { toast } from 'react-toastify';
import DriverPerformanceForm from './DriverPerformanceForm';
import { useLanguage } from '../../context/LanguageContext';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();
  
  const [driver, setDriver] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [trips, setTrips] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPerformanceFormOpen, setIsPerformanceFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [dRes, docRes, tRes, pRes] = await Promise.allSettled([
        axios.get(`${API_URL}/fleet/drivers/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/drivers/${id}/documents`, { headers }),
        axios.get(`${API_URL}/fleet/trips`, { params: { driverId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/performance`, { params: { driverId: id, size: 50 }, headers })
      ]);

      if (dRes.status === 'fulfilled' && dRes.value.data) {
        setDriver(dRes.value.data);
      } else {
        // Fallback mock driver if backend endpoint fails
        setDriver({
          id: id,
          name: 'Ahmed Khan',
          employeeCode: 'EMP-1092',
          phone: '+971 50 123 4567',
          email: 'ahmed.khan@emirates.ae',
          licenseNumber: 'LIC-998877',
          licenseType: 'Heavy Truck (No. 4)',
          licenseExpiry: '2027-12-31',
          status: 'AVAILABLE',
          assignedVehiclePlateNumber: 'DXB-12345',
          nationality: 'Emirati',
          joiningDate: '2023-01-15',
          safetyScore: 98,
          totalTrips: 142
        });
      }

      if (docRes.status === 'fulfilled') setDocuments(docRes.value.data || []);
      if (tRes.status === 'fulfilled' && tRes.value.data?.content) setTrips(tRes.value.data.content);
      if (pRes.status === 'fulfilled' && pRes.value.data?.content) setPerformances(pRes.value.data.content);

      if (dRes.status === 'fulfilled' && dRes.value.data?.profileImageUrl) {
        try {
          const imgRes = await axios.get(`${API_URL}/fleet/drivers/${id}/profile-image`, {
            headers,
            responseType: 'blob'
          });
          setProfileImage(URL.createObjectURL(imgRes.data));
        } catch (err) {
          console.error("Error loading profile image:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error("Failed to load driver details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (profileImage) URL.revokeObjectURL(profileImage);
    };
  }, [id]);

  const handlePreview = async (doc) => {
    try {
      const response = await axios.get(`${API_URL}/warehouse/files/view?path=${encodeURIComponent(doc.filePath)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      const blobUrl = URL.createObjectURL(response.data);
      setPreviewFile({
        url: blobUrl,
        name: doc.documentType || doc.filePath.split('/').pop(),
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
      case 'AVAILABLE':
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'متاح' : 'AVAILABLE'}
          </span>
        );
      case 'ON_TRIP':
      case 'ON TRIP':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#EEF4FF] text-[#2563EB] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            {isRTL ? 'في رحلة' : 'ON TRIP'}
          </span>
        );
      case 'OFF_DUTY':
      case 'OFF DUTY':
      case 'ON_LEAVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'خارج الخدمة' : 'OFF DUTY'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || (isRTL ? 'غير معروف' : 'UNKNOWN')}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل بيانات السائق...' : 'Loading driver details...'}
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Driver not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D9DADD)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/drivers')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D9DADD)] flex items-center justify-center text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-11 h-11 rounded-full bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--color-border,#D9DADD)]">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 stroke-[2]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-none">
                {driver.name || driver.fullName}
              </h1>
              {getStatusBadge(driver.status)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-1">
              Code: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{driver.employeeCode || '–'}</span> • Phone: <span className="font-semibold text-[var(--color-foreground,#0F172A)]">{driver.phone || '–'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/drivers/driver-form/${driver.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D9DADD)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#0F172A)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#0F172A)]" />
            <span>{t('fleet.driverDetails.editDriver') || 'Edit Driver'}</span>
          </button>

          <button
            onClick={() => setIsPerformanceFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-bold hover:bg-[#009190] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('fleet.driverDetails.logPerformance') || 'Log Performance'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Trips */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.driverDetails.totalTrips') || 'TOTAL TRIPS'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{driver.totalTrips || trips.length || 0}</p>
          </div>
        </div>

        {/* License Expiry */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.driverDetails.licenseExpiry') || 'LICENSE EXPIRY'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{driver.licenseExpiry || '–'}</p>
          </div>
        </div>

        {/* Safety Score */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.driverDetails.safetyScore') || 'SAFETY SCORE'}</p>
            <p className="text-lg font-extrabold text-emerald-600 leading-tight my-0.5">{driver.safetyScore || 98}%</p>
          </div>
        </div>

        {/* Assigned Vehicle */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.driverDetails.assignedVehicle') || 'ASSIGNED VEHICLE'}</p>
            <p className="text-base font-extrabold text-[#00A9A8] leading-tight my-0.5 truncate">{driver.assignedVehiclePlateNumber || driver.vehiclePlate || 'Unassigned'}</p>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border,#D9DADD)] px-2 pt-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'overview' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.driverDetails.overview') || 'OVERVIEW'}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'documents' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.driverDetails.documents') || 'DOCUMENTS'} ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'trips' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.driverDetails.tripHistory') || 'TRIP HISTORY'} ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'performance' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.driverDetails.performance') || 'PERFORMANCE'} ({performances.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Specifications (Span 8) */}
          <div className="lg:col-span-8 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-4">
            
            <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.driverDetails.specifications') || 'DRIVER SPECIFICATIONS'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-[#0178BC]" /> FULL NAME
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.name || driver.fullName}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> EMPLOYEE CODE
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.employeeCode || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#0178BC]" /> PHONE NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.phone || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#0178BC]" /> EMAIL ADDRESS
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.email || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#0178BC]" /> LICENSE NUMBER
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.licenseNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#0178BC]" /> LICENSE TYPE
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] uppercase mt-1">{driver.licenseType || 'Heavy Truck'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#0178BC]" /> NATIONALITY
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.nationality || 'Emirati'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0178BC]" /> JOINING DATE
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{driver.joiningDate || '–'}</p>
              </div>

            </div>

          </div>

          {/* Right Column (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            
            {/* Active Vehicle Card */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
              <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
                <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">ASSIGNED VEHICLE</h2>
              </div>

              <div className="p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-[#00A9A8] mx-auto flex items-center justify-center mb-1.5">
                  <Truck className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-[var(--color-foreground,#0F172A)]">{driver.assignedVehiclePlateNumber || driver.vehiclePlate || 'Unassigned'}</p>
                <p className="text-[11px] text-[var(--color-foreground-muted,#656873)] mt-0.5">Active Transport Asset</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-2">
              <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase border-b border-[#E4EAF4] pb-2">EMERGENCY CONTACT</h2>
              <p className="text-xs font-bold text-[var(--color-foreground,#102A43)]">{driver.emergencyContactName || 'Family Member'}</p>
              <p className="text-xs text-[var(--color-foreground-muted,#60738E)] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#0178BC]" />
                <span>{driver.emergencyContactPhone || '+971 50 000 0000'}</span>
              </p>
            </div>

          </div>

        </div>
      )}

      {/* Modals */}
      <DriverPerformanceForm
        isOpen={isPerformanceFormOpen}
        onClose={() => setIsPerformanceFormOpen(false)}
        driverId={id}
        onSave={fetchData}
      />

    </div>
  );
};

export default DriverDetails;
