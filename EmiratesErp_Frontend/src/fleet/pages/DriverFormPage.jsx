import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Upload, 
  Trash2, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Award,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const DriverFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('LICENSE');
  const [selectedDocExpiry, setSelectedDocExpiry] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseType: 'HEAVY_TRUCK',
    licenseExpiry: '',
    issuingAuthority: 'RTA Dubai',
    status: 'AVAILABLE',
    assignedVehicleId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    nationality: 'Emirati',
    emergencyContactName: '',
    emergencyContactPhone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
    if (isEditing && id) {
      fetchDriverData(id);
    }
  }, [id, isEditing]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles`, {
        params: { page: 0, size: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setVehicles(response.data?.content || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchDriverData = async (driverId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        setFormData({
          name: response.data.name || response.data.fullName || '',
          employeeCode: response.data.employeeCode || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          licenseNumber: response.data.licenseNumber || '',
          licenseType: response.data.licenseType || 'HEAVY_TRUCK',
          licenseExpiry: response.data.licenseExpiry || '',
          issuingAuthority: response.data.issuingAuthority || 'RTA Dubai',
          status: response.data.status || 'AVAILABLE',
          assignedVehicleId: response.data.assignedVehicleId || '',
          joiningDate: response.data.joiningDate || '',
          nationality: response.data.nationality || 'Emirati',
          emergencyContactName: response.data.emergencyContactName || '',
          emergencyContactPhone: response.data.emergencyContactPhone || '',
          address: response.data.address || '',
          notes: response.data.notes || ''
        });
        fetchDocuments(driverId);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error("Failed to load driver details");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (driverId) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/${driverId}/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isEditing && id) {
      const data = new FormData();
      data.append('file', file);
      data.append('type', selectedDocType);
      if (selectedDocExpiry) data.append('expiryDate', selectedDocExpiry);

      try {
        await axios.post(`${API_URL}/fleet/drivers/${id}/documents`, data, {
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
      }
    } else {
      setPendingDocs(prev => [...prev, {
        id: Date.now(),
        fileName: file.name,
        documentType: selectedDocType,
        expiryDate: selectedDocExpiry || '–',
        fileObj: file
      }]);
      setSelectedDocExpiry('');
      toast.info("Document attached. Will upload upon saving driver.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.warn("Please enter Driver Name and Phone Number");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const payload = {
        name: formData.name,
        employeeCode: formData.employeeCode,
        phone: formData.phone,
        email: formData.email,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType,
        licenseExpiry: formData.licenseExpiry || null,
        issuingAuthority: formData.issuingAuthority,
        status: formData.status || "AVAILABLE",
        assignedVehicleId: (formData.assignedVehicleId && formData.assignedVehicleId !== "") ? Number(formData.assignedVehicleId) : null,
        joiningDate: formData.joiningDate || null,
        nationality: formData.nationality,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        address: formData.address,
        notes: formData.notes
      };

      let savedDriverId = id;
      if (isEditing) {
        await axios.put(`${API_URL}/fleet/drivers/${id}`, payload, { headers });
        toast.success("Driver updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/fleet/drivers`, payload, { headers });
        savedDriverId = response.data?.id;
        toast.success("Driver created successfully");
      }

      // Upload profile image if selected
      if (profileImageFile && savedDriverId) {
        const imgData = new FormData();
        imgData.append('file', profileImageFile);
        try {
          await axios.post(`${API_URL}/fleet/drivers/${savedDriverId}/profile-image`, imgData, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' }
          });
        } catch (imgErr) {
          console.error("Error uploading profile image:", imgErr);
        }
      }

      // Upload pending documents
      if (pendingDocs.length > 0 && savedDriverId) {
        for (const doc of pendingDocs) {
          const docData = new FormData();
          docData.append('file', doc.fileObj);
          docData.append('type', doc.documentType);
          if (doc.expiryDate && doc.expiryDate !== '–') docData.append('expiryDate', doc.expiryDate);

          try {
            await axios.post(`${API_URL}/fleet/drivers/${savedDriverId}/documents`, docData, {
              headers: { ...headers, 'Content-Type': 'multipart/form-data' }
            });
          } catch (docErr) {
            console.error("Error uploading pending doc:", docErr);
          }
        }
      }

      navigate('/fleet-dashboard/drivers');
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(error.response?.data?.message || "Failed to save driver");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج السائق...' : 'Loading driver form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title & Cancel Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.driverForm.editTitle') || 'Edit Driver') : (t('fleet.driverForm.addTitle') || 'Add New Driver')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.driverForm.subtitle') || 'Enter driver details to add to transport personnel.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/drivers')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Personal Specifications */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.driverForm.personalSpecs') || 'Personal Specifications'}</h2>
            </div>

            {/* Profile Avatar Upload Picker */}
            <div className="flex items-center gap-3 py-1">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-[var(--color-border,#C9D8E5)] overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-[var(--color-foreground,#102A43)] cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-[9.5px] text-[var(--color-foreground-muted,#60738E)] mt-1">JPG, PNG (Max 2MB)</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.fullName') || 'Full Name'} *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ahmed Khan"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.employeeCode') || 'Employee Code'} *</label>
                <input
                  type="text"
                  name="employeeCode"
                  placeholder="e.g. EMP-1092"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.phone') || 'Phone Number'} *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="e.g. +971 50 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.email') || 'Email Address'}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. ahmed.khan@emirates.ae"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  placeholder="e.g. Emirati / Pakistani"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

            </div>

          </div>

          {/* Section 2: License Specifications */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.driverForm.licenseSpecs') || 'License Details'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.licenseNumber') || 'License Number'} *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  required
                  placeholder="e.g. LIC-998877"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.licenseType') || 'License Type'} *</label>
                <select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer"
                >
                  <option value="HEAVY_TRUCK">Heavy Truck (No. 4)</option>
                  <option value="LIGHT_VEHICLE">Light Vehicle (No. 3)</option>
                  <option value="BUS">Bus (No. 6)</option>
                  <option value="FORKLIFT">Forklift (No. 7)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.licenseExpiry') || 'License Expiry'} *</label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Issuing Authority</label>
                <input
                  type="text"
                  name="issuingAuthority"
                  placeholder="e.g. RTA Dubai / Abu Dhabi Police"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.driverForm.status') || 'Status'} *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer font-bold text-teal-600"
                >
                  <option value="AVAILABLE">{isRTL ? 'متاح' : 'AVAILABLE'}</option>
                  <option value="ON_TRIP">{isRTL ? 'في رحلة' : 'ON TRIP'}</option>
                  <option value="OFF_DUTY">{isRTL ? 'خارج الخدمة' : 'OFF DUTY'}</option>
                  <option value="ON_LEAVE">{isRTL ? 'في إجازة' : 'ON LEAVE'}</option>
                  <option value="SUSPENDED">{isRTL ? 'موقوف' : 'SUSPENDED'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Assign Vehicle</label>
                <select
                  name="assignedVehicleId"
                  value={formData.assignedVehicleId}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)] transition-colors cursor-pointer"
                >
                  <option value="">No Vehicle Assigned</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber || v.plateNo} ({v.make} {v.model || ''})
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>

        </div>

        {/* Row 2: Section 3 (Emergency) & Section 4 (Documents) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Emergency & Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  placeholder="Relative / Spouse Name"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  name="emergencyContactPhone"
                  placeholder="+971 50 000 0000"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Residential Address</label>
              <textarea
                name="address"
                rows={2}
                placeholder="Accommodation / Villa / Apartment address in UAE"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
              />
            </div>
          </div>

          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Driver Documents</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Doc Type *</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-2 py-1 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                >
                  <option value="LICENSE">Driving License Copy</option>
                  <option value="EMIRATES_ID">Emirates ID Copy</option>
                  <option value="PASSPORT">Passport Copy</option>
                  <option value="VISA">Residence Visa</option>
                  <option value="MEDICAL">Medical Fitness Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={selectedDocExpiry}
                  onChange={(e) => setSelectedDocExpiry(e.target.value)}
                  className="w-full px-2 py-1 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>

            <label className="border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
              <Upload className="w-5 h-5 text-[var(--color-primary,#0178BC)] mb-1" />
              <span className="text-[11px] font-bold text-[var(--color-foreground,#102A43)]">Click to upload document</span>
              <input type="file" onChange={handleDocFileUpload} className="hidden" />
            </label>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/drivers')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.driverForm.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? (t('fleet.driverForm.update') || 'Update Driver') : (t('fleet.driverForm.save') || 'Create Driver'))}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default DriverFormPage;
