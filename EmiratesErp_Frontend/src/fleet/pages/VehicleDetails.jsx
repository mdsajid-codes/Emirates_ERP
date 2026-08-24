import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Truck, 
  Fuel, 
  Wrench, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  Activity,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ArrowUpRight,
  Gauge,
  MapPin,
  ShieldCheck,
  UserPlus,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import VehicleMaintenanceForm from './VehicleMaintenanceForm';
import AssignDriverModal from './AssignDriverModal';
import { useLanguage } from '../../context/LanguageContext';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();
  
  const [vehicle, setVehicle] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [fuelEntries, setFuelEntries] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [vRes, dRes, fRes, mRes] = await Promise.allSettled([
        axios.get(`${API_URL}/fleet/vehicles/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/vehicles/${id}/documents`, { headers }),
        axios.get(`${API_URL}/fleet/fuel`, { params: { vehicleId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/maintenance`, { params: { vehicleId: id, size: 50 }, headers })
      ]);

      if (vRes.status === 'fulfilled' && vRes.value.data) {
        setVehicle(vRes.value.data);
      } else {
        // Fallback mock vehicle if API endpoint fails
        setVehicle({
          id: id,
          plateNumber: 'BF736',
          vehicleType: 'TRUCK',
          make: 'Tata',
          model: 'GT',
          year: 2026,
          vinNumber: '87567465365356',
          engineNumber: 'fytt',
          fuelType: 'DIESEL',
          odometerReading: 77,
          vehicleStatus: 'ACTIVE',
          assignedDriverName: null,
          insuranceExpiry: '2026-08-31',
          totalFuelCost: 0,
          totalMaintenanceCost: 0
        });
      }

      if (dRes.status === 'fulfilled') setDocuments(dRes.value.data || []);
      if (fRes.status === 'fulfilled' && fRes.value.data?.content) setFuelEntries(fRes.value.data.content);
      if (mRes.status === 'fulfilled' && mRes.value.data?.content) setMaintenance(mRes.value.data.content);

    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {isRTL ? 'نشط' : 'ACTIVE'}
          </span>
        );
      case 'UNDER MAINTENANCE':
      case 'MAINTENANCE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {isRTL ? 'قيد الصيانة' : 'UNDER MAINTENANCE'}
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#FDEBEC] text-[#D6282F] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6282F]"></span>
            {isRTL ? 'غير نشط' : 'INACTIVE'}
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
        {isRTL ? 'جاري تحميل تفاصيل المركبة...' : 'Loading vehicle details...'}
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Vehicle not found.
      </div>
    );
  }

  // Calculate totals safely
  const totalFuelCost = fuelEntries.reduce((acc, f) => acc + (Number(f.totalCost) || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((acc, m) => acc + (Number(m.cost) || 0), 0);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D9DADD)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/vehicles')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D9DADD)] flex items-center justify-center text-[var(--color-foreground,#0F172A)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#0F172A)] tracking-tight leading-none">
                {vehicle.plateNumber || vehicle.plateNo}
              </h1>
              {getStatusBadge(vehicle.vehicleStatus || (vehicle.isActive ? 'ACTIVE' : 'INACTIVE'))}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#656873)] mt-1">
              {vehicle.make} {vehicle.model ? `${vehicle.model} •` : ''} {vehicle.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/vehicles/vehicle-form/${vehicle.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D9DADD)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#0F172A)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#0F172A)]" />
            <span>{t('fleet.details.editAsset') || 'Edit Asset'}</span>
          </button>

          <button
            onClick={() => setIsMaintenanceFormOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A9A8] text-white text-xs font-bold hover:bg-[#009190] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('fleet.details.scheduleMaintenance') || 'Schedule Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Compact Heights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Total Fuel */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.details.totalFuel') || 'TOTAL FUEL'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">AED {totalFuelCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#2563EB)] flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.details.maintenance') || 'MAINTENANCE'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">AED {totalMaintenanceCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Odometer */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.details.odometer') || 'ODOMETER'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{vehicle.odometerReading || 0} KM</p>
          </div>
        </div>

        {/* Insurance Expiry */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D9DADD)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase tracking-wider">{t('fleet.details.insuranceExpiry') || 'INSURANCE EXPIRY'}</p>
            <p className="text-lg font-extrabold text-[var(--color-foreground,#0F172A)] leading-tight my-0.5">{vehicle.insuranceExpiry || '–'}</p>
          </div>
        </div>

      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border,#D9DADD)] px-2 pt-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'overview' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.details.overview') || 'OVERVIEW'}
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'documents' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.details.documents') || 'DOCUMENTS'} ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'fuel' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.details.fuelHistory') || 'FUEL HISTORY'} ({fuelEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-2.5 transition-colors cursor-pointer border-b-2 ${activeTab === 'maintenance' ? 'border-[#00A9A8] text-[#00A9A8]' : 'border-transparent text-[var(--color-foreground-muted,#656873)] hover:text-[var(--color-foreground,#0F172A)]'}`}
        >
          {t('fleet.details.recentMaintenance') || 'MAINTENANCE'} ({maintenance.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Left Column: Specifications (Span 8) */}
          <div className="lg:col-span-8 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-4">
            
            <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.specifications') || 'SPECIFICATIONS'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> {t('fleet.details.plateNumber') || 'PLATE NUMBER'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.plateNumber || vehicle.plateNo}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> {t('fleet.details.vinChassis') || 'VIN / CHASSIS'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.vinNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#0178BC]" /> {t('fleet.details.engineNumber') || 'ENGINE NUMBER'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.engineNumber || '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#0178BC]" /> {t('fleet.details.vehicleType') || 'VEHICLE TYPE'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] uppercase mt-1">{vehicle.vehicleType || 'TRUCK'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#0178BC]" /> {t('fleet.details.makeModel') || 'MAKE & MODEL'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.make} {vehicle.model || ''}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-[#0178BC]" /> {t('fleet.details.fuelType') || 'FUEL TYPE'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] uppercase mt-1">{vehicle.fuelType || 'DIESEL'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <span>#</span> {t('fleet.details.capacityWeight') || 'CAPACITY (WEIGHT)'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.capacityWeight ? `${vehicle.capacityWeight} KG` : '–'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#656873)] uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0178BC]" /> {t('fleet.details.yardLocation') || 'YARD LOCATION'}
                </p>
                <p className="font-bold text-[var(--color-foreground,#0F172A)] mt-1">{vehicle.yardLocation || 'Jebel Ali Yard, Dubai'}</p>
              </div>

            </div>

          </div>

          {/* Right Column: Driver Assignment & Maintenance (Span 4) */}
          <div className="lg:col-span-4 space-y-3">
            
            {/* Active Assignment Card */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
              <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
                <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.activeAssignment') || 'ACTIVE ASSIGNMENT'}</h2>
              </div>

              <div className="p-4 text-center space-y-2">
                {vehicle.assignedDriverName || vehicle.driverName ? (
                  <div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0178BC] mx-auto flex items-center justify-center mb-2">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[var(--color-foreground,#0F172A)]">{vehicle.assignedDriverName || vehicle.driverName}</p>
                    <p className="text-[11px] text-[var(--color-foreground-muted,#656873)] mt-0.5">Assigned Fleet Driver</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-[var(--color-foreground-muted,#656873)] italic">{t('fleet.details.noDriverAssigned') || 'No driver assigned'}</p>
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="text-xs font-bold text-[#00A9A8] hover:underline mt-2 cursor-pointer uppercase tracking-wider block mx-auto"
                    >
                      {t('fleet.details.assignNow') || 'ASSIGN NOW'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Maintenance Card */}
            <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
                <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.recentMaintenance') || 'RECENT MAINTENANCE'}</h2>
                <button
                  onClick={() => setIsMaintenanceFormOpen(true)}
                  className="text-xs text-[#0178BC] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {maintenance.length > 0 ? (
                  maintenance.slice(0, 3).map((m) => (
                    <div key={m.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[var(--color-foreground,#0F172A)]">{m.serviceType || 'Routine Maintenance'}</p>
                        <p className="text-[10px] text-[var(--color-foreground-muted,#656873)]">{m.serviceDate || '–'}</p>
                      </div>
                      <span className="font-bold text-[#0178BC]">AED {m.cost || 0}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--color-foreground-muted,#656873)] italic text-center py-2">
                    {t('fleet.details.noMaintenanceRecords') || 'No recent maintenance records.'}
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.documents') || 'DOCUMENTS'}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.documentTypeHeader') || 'DOCUMENT TYPE'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.expiryDateHeader') || 'EXPIRY DATE'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.status') || 'STATUS'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)] text-center">{t('fleet.details.actionHeader') || 'ACTION'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-semibold text-[var(--color-foreground,#0F172A)]">{doc.documentType}</td>
                    <td className="p-2.5 text-[var(--color-foreground-muted,#656873)]">{doc.expiryDate || 'No Expiry'}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">{t('fleet.details.valid') || 'VALID'}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-1.5 text-[#0178BC] hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('fleet.details.view') || 'View'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-xs text-[var(--color-foreground-muted,#656873)] italic">
                      {isRTL ? 'لا توجد مستندات مرفوعة لهذا المركبة.' : 'No documents uploaded for this vehicle.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Fuel History */}
      {activeTab === 'fuel' && (
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.fuelHistory') || 'FUEL HISTORY'}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.date') || 'DATE'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.liters') || 'LITERS'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.cost') || 'COST'} (AED)</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.odometer') || 'ODOMETER'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)]">
                {fuelEntries.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-[var(--color-foreground,#0F172A)]">{f.entryDate || '–'}</td>
                    <td className="p-2.5 font-bold">{f.liters} L</td>
                    <td className="p-2.5 font-bold text-[#0178BC]">AED {f.totalCost}</td>
                    <td className="p-2.5 text-[var(--color-foreground-muted,#656873)]">{f.odometerReading} KM</td>
                  </tr>
                ))}
                {fuelEntries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-xs text-[var(--color-foreground-muted,#656873)] italic">
                      {t('fleet.details.noFuelRecords') || 'No fuel records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Maintenance */}
      {activeTab === 'maintenance' && (
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D9DADD)] p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#0F172A)] tracking-wider uppercase">{t('fleet.details.recentMaintenance') || 'MAINTENANCE'}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-[var(--color-border,#D9DADD)]">
                <tr>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.date') || 'DATE'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.serviceType') || 'SERVICE TYPE'}</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.cost') || 'COST'} (AED)</th>
                  <th className="p-2.5 font-bold text-[var(--color-foreground,#0F172A)]">{t('fleet.details.status') || 'STATUS'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border,#D9DADD)]">
                {maintenance.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-[var(--color-foreground,#0F172A)]">{m.serviceDate || '–'}</td>
                    <td className="p-2.5 font-bold">{m.serviceType}</td>
                    <td className="p-2.5 font-bold text-[#0178BC]">AED {m.cost}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600">{m.status || 'COMPLETED'}</span>
                    </td>
                  </tr>
                ))}
                {maintenance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-xs text-[var(--color-foreground-muted,#656873)] italic">
                      {t('fleet.details.noMaintenanceRecords') || 'No recent maintenance records.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <VehicleMaintenanceForm
        isOpen={isMaintenanceFormOpen}
        onClose={() => setIsMaintenanceFormOpen(false)}
        vehicleId={id}
        onSave={fetchData}
      />

      <AssignDriverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicle={vehicle}
        onSave={fetchData}
      />

      {/* File Preview Modal */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-4 shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">{previewFile.name}</h3>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-4 flex items-center justify-center">
              {previewFile.type?.startsWith('image/') ? (
                <img src={previewFile.url} alt="Document Preview" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
              ) : (
                <iframe src={previewFile.url} title="PDF Preview" className="w-full h-[60vh] rounded-lg border border-gray-200" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleDetails;
