import { useEffect, useState } from "react";
import axios from "axios";
import { X, Save, AlertCircle, FileText, Upload, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AppButton from "../tripManagement/components/dashboard/AppButton";

const VehicleForm = ({ isOpen, onClose, onSave, isEditing, initialData }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("REGISTRATION");
  const [selectedDocExpiry, setSelectedDocExpiry] = useState("");
  const [previewFile, setPreviewFile] = useState(null); // { url, name, type }
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    vinNumber: "",
    fuelType: "DIESEL",
    capacityWeight: "",
    capacityVolume: "",
    odometerReading: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    registrationExpiry: "",
    permitExpiry: "",
    engineNumber: "",
    yardLocation: "",
    vehicleStatus: "ACTIVE",
    assignedDriverId: "",
    notes: "",
    isActive: true
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        assignedDriverId: initialData.assignedDriverId || ""
      });
      fetchDocuments(initialData.id);
    } else {
      setFormData({
        plateNumber: "",
        vehicleType: "",
        make: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        vinNumber: "",
        fuelType: "DIESEL",
        capacityWeight: "",
        capacityVolume: "",
        odometerReading: "",
        insuranceNumber: "",
        insuranceExpiry: "",
        registrationExpiry: "",
        permitExpiry: "",
        engineNumber: "",
        yardLocation: "",
        vehicleStatus: "ACTIVE",
        assignedDriverId: "",
        notes: "",
        isActive: true
      });
      setDocuments([]);
      setPendingDocs([]);
    }
    fetchDrivers();
  }, [isEditing, initialData]);

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

  const fetchDocuments = async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const response = await axios.get(`${API_URL}/fleet/vehicles/${vehicleId}/documents`, {
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
      // For new vehicles, add to pending list to upload after creation
      setPendingDocs(prev => [...prev, {
        id: Date.now(),
        file,
        documentType: selectedDocType,
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
    if (selectedDocExpiry) {
      formDataUpload.append("expiryDate", selectedDocExpiry);
    }

    setUploadingDoc(true);
    try {
      await axios.post(`${API_URL}/fleet/vehicles/${initialData.id}/documents`, formDataUpload, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data"
        },
      });
      toast.success("Document uploaded");
      fetchDocuments(initialData.id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const url = isEditing 
        ? `${API_URL}/fleet/vehicles/${initialData.id}` 
        : `${API_URL}/fleet/vehicles`;
      
      const requestData = {
        ...formData,
        assignedDriverId: (formData.assignedDriverId && formData.assignedDriverId !== "") ? Number(formData.assignedDriverId) : null,
        year: formData.year ? Number(formData.year) : new Date().getFullYear(),
        capacityWeight: formData.capacityWeight ? Number(formData.capacityWeight) : null,
        capacityVolume: formData.capacityVolume ? Number(formData.capacityVolume) : null,
        odometerReading: formData.odometerReading ? Number(formData.odometerReading) : null,
        insuranceExpiry: formData.insuranceExpiry || null,
        registrationExpiry: formData.registrationExpiry || null,
        permitExpiry: formData.permitExpiry || null,
        engineNumber: formData.engineNumber || null,
        yardLocation: formData.yardLocation || null,
        vehicleStatus: formData.vehicleStatus || "ACTIVE"
      };

      const method = isEditing ? "put" : "post";
      const response = await axios[method](url, requestData, { headers });
      const savedVehicle = response.data;

      // If we have pending documents for a new vehicle, upload them now
      if (!isEditing && pendingDocs.length > 0) {
        for (const doc of pendingDocs) {
          const formDataUpload = new FormData();
          formDataUpload.append("file", doc.file);
          formDataUpload.append("type", doc.documentType);
          if (doc.expiryDate) {
            formDataUpload.append("expiryDate", doc.expiryDate);
          }
          try {
            await axios.post(`${API_URL}/fleet/vehicles/${savedVehicle.id}/documents`, formDataUpload, {
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

      toast.success(isEditing ? "Vehicle updated successfully" : "Vehicle created successfully");
      onSave(savedVehicle);
      onClose();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      const errorMessage = error.response?.data?.message || "Failed to save vehicle";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl bg-card h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEditing ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>
            <p className="text-xs text-foreground-muted uppercase font-bold tracking-widest mt-1">
              Fleet Asset Record
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Basic Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Plate Number *</label>
                <input
                  required
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  placeholder="e.g. DXB-12345"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                >
                  <option value="">Select Type</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="TRAILER">Trailer</option>
                  <option value="FORKLIFT">Forklift</option>
                  <option value="CAR">Staff Car</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Make</label>
                <input
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="Mercedes"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Model</label>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Actros"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Color</label>
                <input
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="White"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Technical & Operational
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">VIN Number</label>
                <input
                  name="vinNumber"
                  value={formData.vinNumber}
                  onChange={handleChange}
                  placeholder="17-digit VIN"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Engine Number</label>
                <input
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  placeholder="Engine Serial"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                >
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Odometer (km)</label>
                <input
                  type="number"
                  name="odometerReading"
                  value={formData.odometerReading}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Yard Location</label>
                <input
                  name="yardLocation"
                  value={formData.yardLocation}
                  onChange={handleChange}
                  placeholder="Main Yard / Section A"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Vehicle Status</label>
                <select
                  name="vehicleStatus"
                  value={formData.vehicleStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Capacity (Weight - kg)</label>
                <input
                  type="number"
                  name="capacityWeight"
                  value={formData.capacityWeight}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Capacity (Volume - m³)</label>
                <input
                  type="number"
                  name="capacityVolume"
                  value={formData.capacityVolume}
                  onChange={handleChange}
                  placeholder="e.g. 40"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Legal & Document tracking
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Insurance Number</label>
                <input
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleChange}
                  placeholder="Policy #"
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Insurance Expiry</label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Registration Expiry</label>
                <input
                  type="date"
                  name="registrationExpiry"
                  value={formData.registrationExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Permit Expiry</label>
                <input
                  type="date"
                  name="permitExpiry"
                  value={formData.permitExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Assignment
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground-muted uppercase">Assigned Driver</label>
              <select
                name="assignedDriverId"
                value={formData.assignedDriverId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground"
              >
                <option value="">No Driver Assigned</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>{driver.name} ({driver.employeeId})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Vehicle Documents
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
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending Documents (Queued for Upload) */}
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
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <div className="bg-background border border-border rounded-theme p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground-muted uppercase">Doc Type</label>
                      <select 
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="w-full px-2 py-1.5 bg-background border border-border rounded-theme text-xs focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="REGISTRATION">Registration</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="PERMIT">Permit</option>
                        <option value="MULKIYA">Mulkiya</option>
                        <option value="OTHER">Other</option>
                      </select>
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

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Additional Remarks
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground-muted uppercase">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Maintenance history, damage reports, etc."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground resize-none"
              />
            </div>
          </div>
        </form>

      <div className="px-8 py-6 border-t border-border bg-background-muted/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-foreground">Active Asset</label>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-theme text-sm font-bold text-foreground-muted hover:bg-background-muted transition-colors"
            >
              Cancel
            </button>
            <AppButton
              variant="primary"
              className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20 px-8"
              onClick={handleSubmit}
              disabled={loading}
              icon={loading ? null : <Save size={18} />}
            >
              {loading ? "Saving..." : isEditing ? "Update Vehicle" : "Create Vehicle"}
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

export default VehicleForm;
