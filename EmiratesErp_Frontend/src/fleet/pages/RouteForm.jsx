import { useEffect, useState } from "react";
import axios from "axios";
import { X, Save, Plus, Trash2, MapPin, Navigation } from "lucide-react";
import { toast } from "react-toastify";
import AppButton from "../tripManagement/components/dashboard/AppButton";

const RouteForm = ({ isOpen, onClose, onSave, isEditing, initialData }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [formData, setFormData] = useState({
    routeName: "",
    driverId: "",
    vehicleId: "",
    routeDate: new Date().toISOString().split('T')[0],
    totalDistanceKm: "",
    estimatedDurationMins: "",
    stops: [
      { stopName: "", address: "", sequence: 1 }
    ]
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        driverId: initialData.driver ? initialData.driver.id : "",
        vehicleId: initialData.vehicle ? initialData.vehicle.id : "",
        stops: initialData.stops && initialData.stops.length > 0 
          ? initialData.stops.map((s, idx) => ({ ...s, sequence: idx + 1 }))
          : [{ stopName: "", address: "", sequence: 1 }]
      });
    } else {
      setFormData({
        routeName: "",
        driverId: "",
        vehicleId: "",
        routeDate: new Date().toISOString().split('T')[0],
        totalDistanceKm: "",
        estimatedDurationMins: "",
        stops: [
          { stopName: "", address: "", sequence: 1 }
        ]
      });
    }
    fetchResources();
  }, [isEditing, initialData]);

  const fetchResources = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const [dRes, vRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/drivers/all`, { headers }),
        axios.get(`${API_URL}/fleet/vehicles/all`, { headers })
      ]);
      setDrivers(dRes.data || []);
      setVehicles(vRes.data || []);
    } catch (error) {
      console.error("Error fetching resources for route:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStopChange = (index, field, value) => {
    const newStops = [...formData.stops];
    newStops[index][field] = value;
    setFormData((prev) => ({ ...prev, stops: newStops }));
  };

  const addStop = () => {
    setFormData((prev) => ({
      ...prev,
      stops: [...prev.stops, { stopName: "", address: "", sequence: prev.stops.length + 1 }]
    }));
  };

  const removeStop = (index) => {
    if (formData.stops.length <= 1) return;
    const newStops = formData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 }));
    setFormData((prev) => ({ ...prev, stops: newStops }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.routeName || !formData.driverId || !formData.vehicleId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const url = `${API_URL}/fleet/routes`;
      
      const requestData = {
        ...formData,
        driverId: Number(formData.driverId),
        vehicleId: Number(formData.vehicleId),
        totalDistanceKm: formData.totalDistanceKm ? Number(formData.totalDistanceKm) : null,
        estimatedDurationMins: formData.estimatedDurationMins ? Number(formData.estimatedDurationMins) : null
      };

      const response = await axios.post(url, requestData, { headers });

      toast.success("Route planned successfully");
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving route:", error);
      toast.error(error.response?.data?.message || "Failed to save route");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-card h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">Plan Route</h2>
            <p className="text-xs text-foreground-muted uppercase font-bold tracking-widest mt-1">Multi-stop Logistics Planning</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background-muted rounded-full text-foreground-muted transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* General Route Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Primary Details
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground-muted uppercase">Route Name *</label>
              <input required name="routeName" value={formData.routeName} onChange={handleChange} placeholder="e.g. Dubai - Abu Dhabi Logistics" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Route Date</label>
                <input type="date" name="routeDate" value={formData.routeDate} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Distance (KM)</label>
                <input type="number" name="totalDistanceKm" value={formData.totalDistanceKm} onChange={handleChange} placeholder="150" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
              </div>
            </div>
          </div>

          {/* Personnel & Asset */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-px bg-primary"></span> Resources
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Assigned Driver *</label>
                <select required name="driverId" value={formData.driverId} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground">
                  <option value="">Select Driver</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground-muted uppercase">Assigned Vehicle *</label>
                <select required name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground">
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} ({v.vehicleType})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Stops Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-px bg-primary"></span> Route Stops
                </h3>
                <button type="button" onClick={addStop} className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80">
                    <Plus size={14} /> Add Stop
                </button>
            </div>
            
            <div className="space-y-4">
                {formData.stops.map((stop, index) => (
                    <div key={index} className="relative p-5 bg-background-muted/50 rounded-theme border border-border flex flex-col gap-4">
                        <div className="absolute -left-3 top-6 w-6 h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary shadow-sm z-10">
                            {index + 1}
                        </div>
                        {formData.stops.length > 1 && (
                            <button type="button" onClick={() => removeStop(index)} className="absolute -right-2 -top-2 p-1.5 bg-error/10 text-error rounded-full border border-error/20 hover:bg-error hover:text-white transition-all shadow-sm">
                                <Trash2 size={14} />
                            </button>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Stop Name</label>
                                <input value={stop.stopName} onChange={(e) => handleStopChange(index, 'stopName', e.target.value)} placeholder="e.g. Warehouse A" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-foreground-muted uppercase">Address / Location</label>
                                <input value={stop.address} onChange={(e) => handleStopChange(index, 'address', e.target.value)} placeholder="e.g. Jebel Ali Port" className="w-full px-3 py-2 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>

        </form>

        <div className="px-8 py-6 border-t border-border bg-background-muted/50 flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-theme text-sm font-bold text-foreground-muted hover:bg-background-muted transition-colors">Cancel</button>
            <AppButton variant="primary" className="bg-primary hover:opacity-90 text-primary-foreground border-none shadow-md shadow-primary/20 px-8" onClick={handleSubmit} disabled={loading} icon={loading ? null : <Save size={18} />}>
              {loading ? "Planning..." : "Save Route Plan"}
            </AppButton>
        </div>

      </div>
    </div>
  );
};

export default RouteForm;
