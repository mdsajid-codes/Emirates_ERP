import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { X, Save, Upload, User, Camera, Eye, EyeOff, Shield, Maximize2, FileText } from "lucide-react";
import { toast } from "react-toastify";
import AppButton from "../tripManagement/components/dashboard/AppButton";

const DriverForm = ({ isOpen, onClose, onSave, isEditing, initialData }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("LICENSE_COPY");
  const [selectedDocNumber, setSelectedDocNumber] = useState("");
  const [selectedDocExpiry, setSelectedDocExpiry] = useState("");
  const [previewFile, setPreviewFile] = useState(null); // { url, name, type }
  
  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
    phone: "",
    email: "",
    address: "",
    dateOfBirth: "",
    joiningDate: "",
    emergencyContact: "",
    licenseNumber: "",
    licenseType: "",
    licenseExpiry: "",
    emiratesId: "",
    emiratesIdExpiry: "",
    nationality: "",
    visaExpiry: "",
    status: "AVAILABLE",
    notes: "",
    isActive: true,
    assignedVehicleId: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchImageBlob = useCallback(async () => {
    if (isEditing && initialData && initialData.profileImageUrl) {
      try {
        const response = await axios.get(`${API_URL}/fleet/drivers/${initialData.id}/profile-image`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: 'blob'
        });
        const url = URL.createObjectURL(response.data);
        setPreviewUrl(url);
        return url; // Return for cleanup
      } catch (error) {
        console.error("Error fetching preview blob:", error);
      }
    }
    return null;
  }, [isEditing, initialData, API_URL]);

  useEffect(() => {
    let currentUrl = null;
    
    const init = async () => {
      if (isEditing && initialData) {
        setFormData({
          ...initialData,
          assignedVehicleId: initialData.assignedVehicle ? initialData.assignedVehicle.id : ""
        });
        currentUrl = await fetchImageBlob();
        fetchDocuments(initialData.id);
      } else {
        setFormData({
          name: "",
          employeeCode: "",
          phone: "",
          email: "",
          address: "",
          dateOfBirth: "",
          joiningDate: "",
          emergencyContact: "",
          licenseNumber: "",
          licenseType: "",
          licenseExpiry: "",
          emiratesId: "",
          emiratesIdExpiry: "",
          nationality: "",
          visaExpiry: "",
          status: "AVAILABLE",
          notes: "",
          isActive: true,
          assignedVehicleId: "",
          password: ""
        });
        setShowPassword(false);
        setPreviewUrl(null);
        setDocuments([]);
        setPendingDocs([]);
      }

    };

    init();

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [isEditing, initialData, fetchImageBlob]);

  const fetchDocuments = async (driverId) => {
    if (!driverId) return;
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/${driverId}/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isEditing) {
      setPendingDocs(prev => [...prev, {
        id: Date.now(),
        file,
        documentType: selectedDocType,
        documentNumber: selectedDocNumber,
        expiryDate: selectedDocExpiry,
        name: file.name
      }]);
      toast.info("Document added to queue");
      return;
    }

    if (!initialData?.id) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("type", selectedDocType);
    if (selectedDocNumber) formDataUpload.append("documentNumber", selectedDocNumber);
    if (selectedDocExpiry) formDataUpload.append("expiryDate", selectedDocExpiry);

    setUploadingDoc(true);
    try {
      await axios.post(`${API_URL}/fleet/drivers/${initialData.id}/documents`, formDataUpload, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        },
      });
      toast.success("Document uploaded");
      fetchDocuments(initialData.id);
      setSelectedDocNumber("");
      setSelectedDocExpiry("");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingDoc(false);
    }
  };

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
    } catch (error) {
      console.error("Error previewing document:", error);
      toast.error("Could not load preview");
    }
  };

  const removePendingDoc = (id) => {
    setPendingDocs(prev => prev.filter(doc => doc.id !== id));
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !isEditing) {
      if (!isEditing) toast.info("Please create the driver profile first, then upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    const imageFormData = new FormData();
    imageFormData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/fleet/drivers/${initialData.id}/profile-image`, imageFormData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        },
      });
      
      // Update form data and preview immediately
      if (response.data && response.data.profileImageUrl) {
        setFormData(prev => ({ ...prev, profileImageUrl: response.data.profileImageUrl }));
        // Refresh the blob
        fetchImageBlob();
      }
      
      toast.success("Profile image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const url = isEditing 
        ? `${API_URL}/fleet/drivers/${initialData.id}` 
        : `${API_URL}/fleet/drivers`;
      
      // Clean up the request body to match DriverRequest DTO
      const requestData = {
        name: formData.name,
        employeeCode: formData.employeeCode,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        dateOfBirth: formData.dateOfBirth || null,
        joiningDate: formData.joiningDate || null,
        emergencyContact: formData.emergencyContact || null,
        licenseNumber: formData.licenseNumber,
        licenseType: formData.licenseType || null,
        licenseExpiry: formData.licenseExpiry || null,
        emiratesId: formData.emiratesId || null,
        emiratesIdExpiry: formData.emiratesIdExpiry || null,
        nationality: formData.nationality || null,
        visaExpiry: formData.visaExpiry || null,
        profileImageUrl: formData.profileImageUrl || null,
        status: formData.status,
        notes: formData.notes || null,
        assignedVehicleId: (formData.assignedVehicleId && formData.assignedVehicleId !== "") ? Number(formData.assignedVehicleId) : null,
        userId: (formData.userId && formData.userId !== "") ? Number(formData.userId) : null,
        password: formData.password || null
      };

      const method = isEditing ? "put" : "post";
      const response = await axios[method](url, requestData, { headers });
      const savedDriver = response.data;

      // Upload pending docs if new driver
      if (!isEditing && pendingDocs.length > 0) {
        for (const doc of pendingDocs) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", doc.file);
          formDataUpload.append("type", doc.documentType);
          if (doc.documentNumber) formDataUpload.append("documentNumber", doc.documentNumber);
          if (doc.expiryDate) formDataUpload.append("expiryDate", doc.expiryDate);
          try {
            await axios.post(`${API_URL}/fleet/drivers/${savedDriver.id}/documents`, formDataUpload, {
              headers: { 
                ...headers,
                "Content-Type": "multipart/form-data"
              },
            });
          } catch (err) {
            console.error(`Failed to upload queued document ${doc.name}:`, err);
          }
        }
      }

      toast.success(isEditing ? "Driver updated successfully" : "Driver created successfully");
      onSave(savedDriver);
      onClose();
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error(error.response?.data?.message || "Failed to save driver");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-card h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">{isEditing ? "Edit Driver" : "Add New Driver"}</h2>
            <p className="text-xs text-foreground-muted uppercase font-bold tracking-widest mt-1">Logistics Personnel Record</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background-muted rounded-full text-foreground-muted transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-4 py-4 bg-primary/5 rounded-theme border border-primary/10">
            <div className="relative group">
              <div 
                onClick={() => previewUrl && setIsPreviewOpen(true)}
                className={`w-24 h-24 rounded-full bg-background border-4 border-card shadow-lg overflow-hidden flex items-center justify-center text-foreground-muted/30 relative ${previewUrl ? 'cursor-pointer' : ''}`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 size={16} className="text-white" />
                    </div>
                  </>
                ) : (
                  <User size={48} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md cursor-pointer hover:opacity-90 transition-all transform group-hover:scale-110">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-foreground-muted uppercase">Driver Photo</p>
              <p className="text-[10px] text-foreground-muted/60 mt-1">JPEG or PNG, Max 2MB</p>
            </div>
          </div>

          {/* Image Preview Modal */}
          {isPreviewOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsPreviewOpen(false)}
              />
              <div className="relative max-w-2xl w-full bg-card rounded-theme shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-1">
                  <img 
                    src={previewUrl} 
                    alt="Full Preview" 
                    className="w-full h-auto max-h-[80vh] object-contain rounded-theme"
                  />
                </div>
                <div className="px-6 py-4 bg-background-muted/50 border-t border-border flex items-center justify-between">
                   <div>
                      <h3 className="font-bold text-foreground">{formData.name || "Driver Photo"}</h3>
                      <p className="text-xs text-foreground-muted uppercase tracking-widest font-bold">Logistics Personnel Record</p>
                   </div>
                   <button 
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-opacity"
                   >
                    Close View
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Personal Identity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Full Name *</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Employee Code *</label>
                <input required name="employeeCode" value={formData.employeeCode} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Phone *</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
          </div>

          {/* License & Employment */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> License & Employment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">License Number *</label>
                <input required name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">License Type</label>
                <input name="licenseType" value={formData.licenseType} onChange={handleChange} placeholder="e.g. Heavy Truck" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">License Expiry</label>
                <input type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground">
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document tracking & Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Document tracking & Documents
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Emirates ID</label>
                <input name="emiratesId" value={formData.emiratesId} onChange={handleChange} placeholder="784-XXXX-XXXXXXX-X" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Emirates ID Expiry</label>
                <input type="date" name="emiratesIdExpiry" value={formData.emiratesIdExpiry} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Nationality</label>
                <input name="nationality" value={formData.nationality} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Visa Expiry</label>
                <input type="date" name="visaExpiry" value={formData.visaExpiry} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
          </div>

          {/* Contact & Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Contact & Dates
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground-muted uppercase">Home Address</label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Full residential address" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Emergency Contact</label>
                <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Name & Phone" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Joining Date</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Additional Details
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground-muted uppercase">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" placeholder="Any additional information..." className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground resize-none" />
            </div>
          </div>

          {/* Driver Documents Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Document tracking Documents
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Existing Documents */}
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-theme group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded border border-border text-primary">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{doc.documentType}</span>
                      <span className="text-[10px] text-foreground-muted">{doc.filePath.split('/').pop()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending Documents */}
              {pendingDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 border-dashed rounded-theme">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded border border-border text-primary animate-pulse">
                      <Upload size={16} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">{doc.documentType}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full font-black uppercase">Pending</span>
                      </div>
                      <span className="text-[10px] text-foreground-muted underline cursor-pointer hover:text-primary transition-colors" 
                            onClick={() => setPreviewFile({ 
                              url: URL.createObjectURL(doc.file), 
                              name: doc.name,
                              type: doc.file.type 
                            })}>
                        {doc.name}
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removePendingDoc(doc.id)}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <div className="bg-background border border-border rounded-theme p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase">Document Type</label>
                      <select 
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-border rounded-theme text-xs focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="LICENSE_COPY">Driving License Copy</option>
                        <option value="PASSPORT_COPY">Passport Copy</option>
                        <option value="VISA_COPY">Visa Copy</option>
                        <option value="EMIRATES_ID_COPY">Emirates ID Copy</option>
                        <option value="CONTRACT_COPY">Employment Contract</option>
                        <option value="OTHER">Other Document</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase">Document Number</label>
                      <input 
                        type="text"
                        value={selectedDocNumber}
                        onChange={(e) => setSelectedDocNumber(e.target.value)}
                        placeholder="e.g. Pass # or ID #"
                        className="w-full px-2 py-1.5 bg-background border border-border rounded-theme text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase">Expiry Date</label>
                      <input 
                        type="date"
                        value={selectedDocExpiry}
                        onChange={(e) => setSelectedDocExpiry(e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-border rounded-theme text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={handleDocumentUpload}
                      disabled={uploadingDoc}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="p-4 border-2 border-dashed border-border group-hover:border-primary/50 rounded-theme flex flex-col items-center justify-center gap-2 bg-muted/20 transition-all">
                      {uploadingDoc ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload size={18} className="text-foreground-muted group-hover:text-primary" />
                          <span className="text-xs font-bold text-foreground-muted group-hover:text-foreground italic">Click to Upload Selected File</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          </div>
          
          {/* Login Credentials - Only for new drivers */}
          {!isEditing && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-primary"></span> Login Credentials
              </h3>
              <p className="text-[10px] text-foreground-muted/60 bg-primary/5 p-2 rounded-theme flex items-center gap-2 leading-relaxed">
                <Shield size={12} className="text-primary shrink-0" />
                Setting a password will automatically create a user account for this driver. The email address will be used as the login username.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Login Username (Email)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.email || "Enter email above..."} 
                    className="w-full px-3 py-2 bg-background-muted/30 border border-border rounded-theme text-sm text-foreground-muted cursor-not-allowed italic" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">Password *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Min. 8 characters"
                      className="w-full pl-3 pr-10 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted/50 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="px-8 py-6 border-t border-border bg-background-muted/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-primary border-border rounded focus:ring-primary" />
            <label htmlFor="isActive" className="text-sm font-bold text-foreground">Active Staff</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-theme text-sm font-bold text-foreground-muted hover:bg-background-muted transition-colors">Cancel</button>
            <AppButton variant="primary" className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20 px-8" onClick={handleSubmit} disabled={loading} icon={loading ? null : <Save size={18} />}>
              {loading ? "Saving..." : isEditing ? "Update Driver" : "Create Driver"}
            </AppButton>
          </div>
        </div>

      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[85vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Document Preview</h3>
                  <p className="text-xs text-foreground-muted">{previewFile.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (previewFile.url.startsWith('blob:')) {
                    URL.revokeObjectURL(previewFile.url);
                  }
                  setPreviewFile(null);
                }}
                className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted hover:text-foreground"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-muted/10 p-4 overflow-hidden">
              {(previewFile.type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(previewFile.type)) ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img 
                    src={previewFile.url} 
                    alt="Preview" 
                    className="max-w-full max-h-full object-contain rounded shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                  />
                </div>
              ) : (
                <iframe 
                  src={previewFile.url} 
                  className="w-full h-full rounded border border-border bg-white shadow-inner"
                  title="Document Preview"
                />
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-border flex justify-end bg-background-muted/30 gap-3">
              <button
                onClick={() => {
                  if (previewFile.url.startsWith('blob:')) {
                    URL.revokeObjectURL(previewFile.url);
                  }
                  setPreviewFile(null);
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverForm;
