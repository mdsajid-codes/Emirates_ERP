import { useEffect, useState } from "react";
import axios from "axios";
import { X, UserPlus, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import AppButton from "../tripManagement/components/dashboard/AppButton";

const AssignDriverModal = ({ isOpen, onClose, vehicle, onSave }) => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      setSelectedDriverId(vehicle?.assignedDriverId || "");
    }
  }, [isOpen, vehicle]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/drivers/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to load drivers");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      // We send only the required fields plus the new driver ID
      const requestData = {
        plateNumber: vehicle.plateNumber,
        vehicleType: vehicle.vehicleType,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || new Date().getFullYear(),
        color: vehicle.color,
        vinNumber: vehicle.vinNumber,
        fuelType: vehicle.fuelType,
        capacityWeight: vehicle.capacityWeight,
        capacityVolume: vehicle.capacityVolume,
        odometerReading: vehicle.odometerReading,
        insuranceNumber: vehicle.insuranceNumber,
        insuranceExpiry: vehicle.insuranceExpiry,
        registrationExpiry: vehicle.registrationExpiry,
        notes: vehicle.notes,
        assignedDriverId: selectedDriverId !== "" ? Number(selectedDriverId) : null,
      };

      await axios.put(`${API_URL}/fleet/vehicles/${vehicle.id}`, requestData, { headers });
      
      toast.success("Driver assigned successfully");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error(error.response?.data?.message || "Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card rounded-theme shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Assign Driver</h3>
              <p className="text-xs text-foreground-muted font-bold uppercase tracking-wider">
                Vehicle: {vehicle?.plateNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Select Personnel</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-theme text-sm focus:ring-2 focus:ring-primary outline-none text-foreground transition-all"
            >
              <option value="">Unassigned (Clear Driver)</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.licenseType} ({d.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-background-muted/50 p-4 rounded-theme border border-border/50">
            <p className="text-xs text-foreground-muted italic">
              Tip: Assigning a driver here will automatically update the driver's profile and unassign them from any previous vehicles.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background-muted/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-theme text-sm font-bold text-foreground-muted hover:bg-background-muted transition-colors"
          >
            Cancel
          </button>
          <AppButton
            variant="primary"
            className="px-8"
            onClick={handleSubmit}
            disabled={loading}
            icon={loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          >
            {loading ? "Saving..." : "Save Assignment"}
          </AppButton>
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;
