import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  X, 
  Save, 
  Upload, 
  Store, 
  Phone, 
  Mail, 
  CreditCard,
  FileText,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Fuel
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const VendorFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contractFile, setContractFile] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    vendorType: 'MAINTENANCE_WORKSHOP',
    serviceCategory: 'VEHICLE_REPAIR',
    trnNumber: '',
    tradeLicenseNumber: '',
    contactPersonName: '',
    phone: '',
    email: '',
    designation: 'Account Manager',
    paymentTermsDays: '30',
    status: 'ACTIVE',
    bankName: 'Emirates NBD',
    ibanNumber: '',
    billingAddress: '',
    emirate: 'Dubai',
    country: 'United Arab Emirates',
    notes: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchVendorData(id);
    }
  }, [id, isEditing]);

  const fetchVendorData = async (vendorId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data) {
        setFormData({
          companyName: response.data.companyName || response.data.name || '',
          vendorType: response.data.vendorType || 'MAINTENANCE_WORKSHOP',
          serviceCategory: response.data.serviceCategory || 'VEHICLE_REPAIR',
          trnNumber: response.data.trnNumber || '',
          tradeLicenseNumber: response.data.tradeLicenseNumber || '',
          contactPersonName: response.data.contactPersonName || response.data.contactPerson || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          designation: response.data.designation || 'Account Manager',
          paymentTermsDays: response.data.paymentTermsDays || '30',
          status: response.data.status || 'ACTIVE',
          bankName: response.data.bankName || 'Emirates NBD',
          ibanNumber: response.data.ibanNumber || '',
          billingAddress: response.data.billingAddress || response.data.address || '',
          emirate: response.data.emirate || 'Dubai',
          country: response.data.country || 'United Arab Emirates',
          notes: response.data.notes || ''
        });
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
      toast.error("Failed to load vendor details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContractFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone) {
      toast.warn("Please enter Company Name and Phone Number");
      return;
    }

    setSubmitting(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const payload = {
        companyName: formData.companyName,
        name: formData.companyName,
        vendorType: formData.vendorType,
        serviceCategory: formData.serviceCategory,
        trnNumber: formData.trnNumber,
        tradeLicenseNumber: formData.tradeLicenseNumber,
        contactPersonName: formData.contactPersonName,
        contactPerson: formData.contactPersonName,
        phone: formData.phone,
        email: formData.email,
        designation: formData.designation,
        paymentTermsDays: formData.paymentTermsDays ? Number(formData.paymentTermsDays) : 30,
        status: formData.status || "ACTIVE",
        bankName: formData.bankName,
        ibanNumber: formData.ibanNumber,
        billingAddress: formData.billingAddress,
        address: formData.billingAddress,
        emirate: formData.emirate,
        country: formData.country,
        notes: formData.notes
      };

      let savedVendorId = id;
      if (isEditing) {
        await axios.put(`${API_URL}/fleet/vendors/${id}`, payload, { headers });
        toast.success("Vendor updated successfully");
      } else {
        const response = await axios.post(`${API_URL}/fleet/vendors`, payload, { headers });
        savedVendorId = response.data?.id;
        toast.success("Vendor created successfully");
      }

      // Upload contract file if attached
      if (contractFile && savedVendorId) {
        const fileData = new FormData();
        fileData.append('file', contractFile);
        try {
          await axios.post(`${API_URL}/fleet/vendors/${savedVendorId}/contract`, fileData, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' }
          });
        } catch (fileErr) {
          console.error("Error uploading contract:", fileErr);
        }
      }

      navigate('/fleet-dashboard/vendors');
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(error.response?.data?.message || "Failed to save vendor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل نموذج المورد...' : 'Loading vendor form...'}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {isEditing ? (t('fleet.vendorForm.editTitle') || 'Edit Vendor') : (t('fleet.vendorForm.addTitle') || 'Create New Vendor')}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.vendorForm.subtitle') || 'Enter vendor supplier information and financial terms.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/vendors')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Vendor Specifications */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.vendorForm.corporateSpecs') || 'Vendor Specifications'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.customerForm.companyName') || 'Company Name'} *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Emirates Auto Workshop LLC"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none focus:border-[var(--color-primary,#0178BC)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.vendorForm.serviceCategory') || 'Service Category'} *</label>
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="VEHICLE_REPAIR">Vehicle Repair & Maintenance</option>
                  <option value="FUEL_SUPPLIER">Fuel Station & Petroleum</option>
                  <option value="SPARE_PARTS">Spare Parts & Tyres</option>
                  <option value="INSURANCE_PROVIDER">Insurance & Inspection</option>
                  <option value="GPS_TRACKING">GPS Telematics & Tech</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.customerForm.trnNumber') || 'TRN / VAT Number'}</label>
                <input
                  type="text"
                  name="trnNumber"
                  placeholder="e.g. 100987654300003"
                  value={formData.trnNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.customerForm.tradeLicense') || 'Trade License Number'}</label>
                <input
                  type="text"
                  name="tradeLicenseNumber"
                  placeholder="e.g. DUB-887766"
                  value={formData.tradeLicenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Person Details */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">{t('fleet.customerForm.contactPerson') || 'Contact Person Details'}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.customerForm.personName') || 'Contact Person Name'}</label>
                <input
                  type="text"
                  name="contactPersonName"
                  placeholder="e.g. Salim Al Rashid"
                  value={formData.contactPersonName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="e.g. Key Account Manager"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.drivers.contact') || 'Phone Number'} *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="e.g. +971 4 333 4455"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.drivers.contact') || 'Email Address'}</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. service@emiratesauto.ae"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Section 3 & Section 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Banking & Payment Specs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="Emirates NBD"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.customerForm.paymentTerms') || 'Payment Terms (Days)'}</label>
                <input
                  type="number"
                  name="paymentTermsDays"
                  placeholder="30"
                  value={formData.paymentTermsDays}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">{t('fleet.vehicles.status') || 'Status'}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none font-bold text-emerald-600 cursor-pointer"
                >
                  <option value="ACTIVE">{isRTL ? 'نشط' : 'ACTIVE'}</option>
                  <option value="INACTIVE">{isRTL ? 'غير نشط' : 'INACTIVE'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">IBAN Number</label>
              <input
                type="text"
                name="ibanNumber"
                placeholder="AE030330000012345678901"
                value={formData.ibanNumber}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none font-mono"
              />
            </div>
          </div>

          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Contract & Uploads</h2>
            </div>

            <label className="border-2 border-dashed border-sky-200 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors block">
              <Upload className="w-6 h-6 text-[var(--color-primary,#0178BC)] mb-1" />
              <span className="text-xs font-bold text-[var(--color-foreground,#102A43)]">Upload Vendor Agreement (PDF, Max 10MB)</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleContractFile} className="hidden" />
            </label>

            {contractFile && (
              <p className="text-xs font-bold text-emerald-600 text-center">Attached: {contractFile.name}</p>
            )}
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/vendors')}
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
            <span>{submitting ? (t('fleet.driverForm.saving') || 'Saving...') : (isEditing ? 'Update Vendor' : 'Create Vendor')}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default VendorFormPage;
