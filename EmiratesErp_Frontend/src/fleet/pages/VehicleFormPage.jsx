import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Upload, 
  Trash2, 
  FileText, 
  AlertCircle,
  UserCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const VehicleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('REGISTRATION');
  const [selectedDocExpiry, setSelectedDocExpiry] = useState('');

  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'TRUCK',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vinNumber: '',
    fuelType: 'DIESEL',
    capacityWeight: '',
    capacityVolume: '',
    odometerReading: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    registrationExpiry: '',
    permitExpiry: '',
    engineNumber: '',
    yardLocation: '',
    vehicleStatus: 'ACTIVE',
    assignedDriverId: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchDrivers();
    if (isEditing && id) {
      fetchVehicleData(id);
    }
  }, [id, isEditing]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchVehicleData = async (vehicleId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        setFormData({
          plateNumber: response.data.plateNumber || '',
          vehicleType: response.data.vehicleType || 'TRUCK',
          make: response.data.make || '',
          model: response.data.model || '',
          year: response.data.year || new Date().getFullYear(),
          color: response.data.color || '',
          vinNumber: response.data.vinNumber || '',
          fuelType: response.data.fuelType || 'DIESEL',
          capacityWeight: response.data.capacityWeight || '',
          capacityVolume: response.data.capacityVolume || '',
          odometerReading: response.data.odometerReading || '',
          insuranceNumber: response.data.insuranceNumber || '',
          insuranceExpiry: response.data.insuranceExpiry || '',
          registrationExpiry: response.data.registrationExpiry || '',
          permitExpiry: response.data.permitExpiry || '',
          engineNumber: response.data.engineNumber || '',
          yardLocation: response.data.yardLocation || '',
          vehicleStatus: response.data.vehicleStatus || 'ACTIVE',
          assignedDriverId: response.data.assignedDriverId || '',
          notes: response.data.notes || '',
          isActive: response.data.isActive ?? true
        });
        fetchDocuments(vehicleId);
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (vehicleId) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/${vehicleId}/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isEditing && id) {
      setUploadingDoc(true);
      const data = new FormData();
      data.append('file', file);
      data.append('type', selectedDocType);
      if (selectedDocExpiry) data.append('expiryDate', selectedDocExpiry);

      try {
        await axios.post(`${API_URL}/fleet/vehicles/${id}/documents`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        toast.success("Document uploaded successfully");
        fetchDocuments(id);
        setSelectedDocExpiry('');
      } catch (error) {
        console.error("Error uploading document:", error);
        toast.error("Failed to upload document");
      } finally {
        setUploadingDoc(false);
      }
    } else {
      setPendingDocs(prev => [...prev, {
        id: Date.now(),
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        documentType: selectedDocType,
        expiryDate: selectedDocExpiry || '–',
        fileObj: file
      }]);
      setSelectedDocExpiry('');
      toast.info("Document attached. Will upload upon saving vehicle.");
    }
  };

  const handleRemovePendingDoc = (docId) => {
    setPendingDocs(prev => prev.filter(d => d.id !== docId));
  };

  const handleDeleteExistingDoc = async (docId) => {
    if (!window.confirm("Delete this document permanently?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/vehicles/documents/${docId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Document deleted");
      fetchDocuments(id);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plateNumber || !formData.make) {
      toast.warn("Please enter Plate Number and Make");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const payload = {
        plateNumber: formData.plateNumber,
        vehicleType: formData.vehicleType,
        make: formData.make,
        model: formData.model,
        year: formData.year ? Number(formData.year) : new Date().getFullYear(),
        color: formData.color,
        vinNumber: formData.vinNumber,
        fuelType: formData.fuelType || "DIESEL",
        capacityWeight: formData.capacityWeight ? Number(formData.capacityWeight) : null,
        capacityVolume: formData.capacityVolume ? Number(formData.capacityVolume) : null,
        odometerReading: formData.odometerReading ? Number(formData.odometerReading) : null,
        insuranceNumber: formData.insuranceNumber || null,
        insuranceExpiry: formData.insuranceExpiry || null,
        registrationExpiry: formData.registrationExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        engineNumber: formData.engineNumber || null,
        yardLocation: formData.yardLocation || null,
        vehicleStatus: formData.vehicleStatus || "ACTIVE",
        assignedDriverId: (formData.assignedDriverId && formData.assignedDriverId !== "") ? Number(formData.assignedDriverId) : null,
        notes: formData.notes || null,
        isActive: formData.isActive
      };

      let savedVehicleId = id;
      if (isEditing) {
        await axios.put(`${API_URL}/fleet/vehicles/${id}`, payload, { headers });
        toast.success("Vehicle updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/fleet/vehicles`, payload, { headers });
        savedVehicleId = response.data?.id;
        toast.success("Vehicle created successfully");
      }

      if (pendingDocs.length > 0 && savedVehicleId) {
        for (const doc of pendingDocs) {
          const data = new FormData();
          data.append('file', doc.fileObj);
          data.append('type', doc.documentType);
          if (doc.expiryDate && doc.expiryDate !== '–') data.append('expiryDate', doc.expiryDate);

          try {
            await axios.post(`${API_URL}/fleet/vehicles/${savedVehicleId}/documents`, data, {
              headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (docErr) {
            console.error("Error uploading pending doc:", docErr);
          }
        }
      }

      navigate('/fleet-dashboard/vehicles');
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(error.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج المركبة...' : 'Loading vehicle form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title & Cancel Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.form.editTitle') || 'Edit Vehicle') : (t('fleet.form.addTitle') || 'Add New Vehicle')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.form.subtitle') || 'Enter vehicle details to add to your fleet.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/vehicles')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.form.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Basic Specifications */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.basicSpecs') || 'Basic Specifications'}</h2>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.activeStatus') || 'Active Status'}</p>
                  <p className="text-[9.5px] text-[var(--color-foreground-muted,#60738E)]">{t('fleet.form.activeDesc') || 'Enable to make active'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00A9A8]"></div>
                </label>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.plateNumber') || 'Plate Number'} *</label>
                <input
                  type="text"
                  name="plateNumber"
                  required
                  placeholder="e.g. DXB-12345"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.vehicleType') || 'Vehicle Type'} *</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer"
                >
                  <option value="TRUCK">TRUCK</option>
                  <option value="VAN">VAN</option>
                  <option value="PICKUP">PICKUP</option>
                  <option value="SUV">SUV</option>
                  <option value="CAR">CAR</option>
                  <option value="TRAILER">TRAILER</option>
                  <option value="BUS">BUS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.make') || 'Make'} *</label>
                <input
                  type="text"
                  name="make"
                  required
                  placeholder="e.g. Mercedes"
                  value={formData.make}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.model') || 'Model'} *</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g. Actros"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.year') || 'Year'} *</label>
                <input
                  type="number"
                  name="year"
                  placeholder="e.g. 2026"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.color') || 'Color'} *</label>
                <input
                  type="text"
                  name="color"
                  placeholder="e.g. White"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

            </div>

          </div>

          {/* Section 2: Technical & Operational */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.techOps') || 'Technical & Operational'}</h2>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.vinNumber') || 'VIN Number'} *</label>
                <input
                  type="text"
                  name="vinNumber"
                  placeholder="17-digit VIN"
                  value={formData.vinNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.engineNumber') || 'Engine Number'}</label>
                <input
                  type="text"
                  name="engineNumber"
                  placeholder="Engine Serial"
                  value={formData.engineNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.fuelType') || 'Fuel Type'} *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer"
                >
                  <option value="DIESEL">DIESEL</option>
                  <option value="PETROL">PETROL (Super 98 / Special 95)</option>
                  <option value="ELECTRIC">ELECTRIC</option>
                  <option value="HYBRID">HYBRID</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.odometer') || 'Odometer (KM)'} *</label>
                <input
                  type="number"
                  name="odometerReading"
                  placeholder="e.g. 0"
                  value={formData.odometerReading}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.yardLocation') || 'Yard Location'} *</label>
                <input
                  type="text"
                  name="yardLocation"
                  placeholder="e.g. Jebel Ali Yard, Dubai"
                  value={formData.yardLocation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.vehicleStatus') || 'Vehicle Status'} *</label>
                <select
                  name="vehicleStatus"
                  value={formData.vehicleStatus}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer font-bold text-teal-600"
                >
                  <option value="ACTIVE">{isRTL ? 'نشط' : 'ACTIVE'}</option>
                  <option value="MAINTENANCE">{isRTL ? 'قيد الصيانة' : 'UNDER MAINTENANCE'}</option>
                  <option value="INACTIVE">{isRTL ? 'غير نشط' : 'INACTIVE'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.capacityWeight') || 'Capacity (Weight - KG)'}</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="capacityWeight"
                    placeholder="e.g. 5000"
                    value={formData.capacityWeight}
                    onChange={handleInputChange}
                    className="w-full pl-2.5 pr-10 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                  />
                  <span className="absolute right-0 top-0 bottom-0 px-2 bg-slate-50 border-l border-[var(--color-border,#C9D8E5)] rounded-r-lg flex items-center text-[9.5px] font-bold text-[var(--color-foreground,#102A43)]">
                    KG
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.capacityVolume') || 'Capacity (Volume - M³)'}</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    name="capacityVolume"
                    placeholder="e.g. 40"
                    value={formData.capacityVolume}
                    onChange={handleInputChange}
                    className="w-full pl-2.5 pr-10 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                  />
                  <span className="absolute right-0 top-0 bottom-0 px-2 bg-slate-50 border-l border-[var(--color-border,#C9D8E5)] rounded-r-lg flex items-center text-[9.5px] font-bold text-[var(--color-foreground,#102A43)]">
                    M³
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Row 2: Section 3 (Legal), Section 4 (Assignment), Section 5 (Documents) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          
          {/* Section 3: Legal & Document Tracking (Span 4) */}
          <div className="lg:col-span-4 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3 h-full">
            
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.legalTracking') || 'Legal & Document Tracking'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.insuranceNumber') || 'Insurance Number'}</label>
                <input
                  type="text"
                  name="insuranceNumber"
                  placeholder="Policy #"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.insuranceExpiry') || 'Insurance Expiry'}</label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.registrationExpiry') || 'Registration Expiry'}</label>
                <input
                  type="date"
                  name="registrationExpiry"
                  value={formData.registrationExpiry}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.permitExpiry') || 'Permit Expiry'}</label>
                <input
                  type="date"
                  name="permitExpiry"
                  value={formData.permitExpiry}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>
            </div>

            {/* Compliance Info banner */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-2 text-xs text-blue-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <div>
                <span className="font-bold">{t('fleet.form.complianceReminder') || 'Compliance Reminder'}</span>
                <p className="text-[10.5px] text-blue-600 mt-0.5">{t('fleet.form.complianceDesc') || 'Ensure all legal documents are valid and updated for UAE road compliance.'}</p>
              </div>
            </div>

          </div>

          {/* Section 4: Assignment (Span 4) */}
          <div className="lg:col-span-4 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3 h-full">
            
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.assignment') || 'Assignment'}</h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.assignedDriver') || 'Assigned Driver'}</label>
              <select
                name="assignedDriverId"
                value={formData.assignedDriverId}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer"
              >
                <option value="">{t('fleet.form.noDriver') || 'No Driver Assigned'}</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.fullName || d.name} ({d.driverCode || `ID: ${d.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#00A9A8] text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.needAssign') || 'Need to assign a driver?'}</p>
                <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)]">Manage driver licenses in directory.</p>
                <button 
                  type="button"
                  onClick={() => navigate('/fleet-dashboard/drivers')}
                  className="text-[11px] font-bold text-[var(--color-primary,#0178BC)] hover:underline mt-0.5 cursor-pointer inline-flex items-center gap-1"
                >
                  <span>{t('fleet.form.driverListLink') || 'Go to Driver List'}</span>
                  {isRTL ? <ArrowLeft className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            </div>

          </div>

          {/* Section 5: Vehicle Documents (Span 4) */}
          <div className="lg:col-span-4 bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3 h-full">
            
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                5
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.vehicleDocs') || 'Vehicle Documents'}</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.docType') || 'Doc Type'} *</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-2 py-1 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                >
                  <option value="REGISTRATION">Mulkiya / Registration</option>
                  <option value="INSURANCE">Insurance Policy</option>
                  <option value="PERMIT">RTA / Transport Permit</option>
                  <option value="MAINTENANCE">Maintenance Record</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.form.expiryDate') || 'Expiry Date'} *</label>
                <input
                  type="date"
                  value={selectedDocExpiry}
                  onChange={(e) => setSelectedDocExpiry(e.target.value)}
                  className="w-full px-2 py-1 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>

            {/* Upload Dropzone Box */}
            <label className="border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
              <Upload className="w-5 h-5 text-[var(--color-primary,#0178BC)] mb-1" />
              <span className="text-[11px] font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.clickToUpload') || 'Click to upload or drag and drop'}</span>
              <span className="text-[9.5px] text-[var(--color-foreground-muted,#60738E)]">{t('fleet.form.uploadHint') || 'PDF, JPG, PNG (Max 10MB)'}</span>
              <input type="file" onChange={handleDocFileUpload} className="hidden" />
            </label>

            {/* Document List */}
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              <p className="text-[10.5px] font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.uploadedDocs') || 'Uploaded Documents'}</p>

              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-[var(--color-foreground,#102A43)] truncate">{doc.fileName || doc.documentType}</p>
                      <p className="text-[9px] text-[var(--color-foreground-muted,#60738E)]">{doc.expiryDate || 'No Expiry'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingDoc(doc.id)}
                    className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {pendingDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-[var(--color-foreground,#102A43)] truncate">{doc.fileName}</p>
                      <p className="text-[9px] text-emerald-700 font-medium">Pending Save • {doc.expiryDate}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePendingDoc(doc.id)}
                    className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {documents.length === 0 && pendingDocs.length === 0 && (
                <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] italic">{t('fleet.form.noDocs') || 'No documents attached yet.'}</p>
              )}
            </div>

          </div>

        </div>

        {/* Section 6: Additional Remarks */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
              6
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.additionalRemarks') || 'Additional Remarks'}</h2>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.form.notes') || 'Notes'}</label>
              <span className="text-[9.5px] text-[var(--color-foreground-muted,#60738E)]">0 / 500</span>
            </div>
            <textarea
              name="notes"
              rows={2}
              placeholder="Maintenance history, damage reports, special instructions, etc."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
            />
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/vehicles')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.form.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? (t('fleet.form.saving') || 'Saving...') : (isEditing ? (t('fleet.form.update') || 'Update Vehicle') : (t('fleet.form.save') || 'Create Vehicle'))}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default VehicleFormPage;
