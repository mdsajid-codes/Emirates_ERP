import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Truck, 
  Fuel, 
  Wrench, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  Weight, 
  Activity,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import VehicleMaintenanceForm from './VehicleMaintenanceForm';
import VehicleForm from './VehicleForm';
import AssignDriverModal from './AssignDriverModal';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [vRes, dRes, fRes, mRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/vehicles/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/vehicles/${id}/documents`, { headers }),
        axios.get(`${API_URL}/fleet/fuel`, { params: { vehicleId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/maintenance`, { params: { vehicleId: id, size: 50 }, headers })
      ]);

      setVehicle(vRes.data);
      setDocuments(dRes.data || []);
      setFuelEntries(fRes.data.content || []);
      setMaintenance(mRes.data.content || []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground-muted font-medium animate-pulse">Loading vehicle statistics...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) return <div className="p-20 text-center">Vehicle not found</div>;

  const totalFuelCost = fuelEntries.reduce((sum, entry) => sum + (entry.amountAed || 0), 0);
  const totalMaintenanceCost = maintenance.reduce((sum, entry) => sum + (entry.actualCost || entry.estimatedCost || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/fleet-dashboard/vehicles')}
            className="p-2 hover:bg-background rounded-full transition-colors text-foreground-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Truck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{vehicle.plateNumber}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  vehicle.vehicleStatus === 'ACTIVE' ? 'bg-success/10 text-success' :
                  vehicle.vehicleStatus === 'UNDER_MAINTENANCE' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                }`}>
                  {vehicle.vehicleStatus || 'ACTIVE'}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-theme text-sm font-bold hover:bg-muted transition-all"
          >
            <Edit size={16} /> Edit Asset
          </button>
          <button 
            onClick={() => setIsMaintenanceFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={16} /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fuel', value: `AED ${totalFuelCost.toLocaleString()}`, icon: <Fuel />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Maintenance', value: `AED ${totalMaintenanceCost.toLocaleString()}`, icon: <Wrench />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Odometer', value: `${vehicle.odometerReading?.toLocaleString() || 0} KM`, icon: <Activity />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Insurance Expiry', value: vehicle.insuranceExpiry || 'N/A', icon: <Clock />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-4 rounded-theme border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground-muted uppercase tracking-tight">{stat.label}</p>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-8 overflow-x-auto no-scrollbar scroll-smooth">
        {['overview', 'documents', 'fuel history', 'maintenance'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-primary' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-bottom-1" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Specifications</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { label: 'Plate Number', value: vehicle.plateNumber, icon: <Hash size={14} /> },
                    { label: 'VIN / Chassis', value: vehicle.vinNumber, icon: <Hash size={14} /> },
                    { label: 'Engine Number', value: vehicle.engineNumber, icon: <Activity size={14} /> },
                    { label: 'Vehicle Type', value: vehicle.vehicleType, icon: <Truck size={14} /> },
                    { label: 'Make & Model', value: `${vehicle.make} ${vehicle.model}`, icon: <Truck size={14} /> },
                    { label: 'Fuel Type', value: vehicle.fuelType, icon: <Fuel size={14} /> },
                    { label: 'Weight Capacity', value: `${vehicle.capacityWeight} KG`, icon: <Weight size={14} /> },
                    { label: 'Volume Capacity', value: `${vehicle.capacityVolume} m³`, icon: <Weight size={14} /> },
                    { label: 'Insurance Policy', value: vehicle.insuranceNumber, icon: <FileText size={14} /> },
                    { label: 'Color', value: vehicle.color, icon: <Activity size={14} /> },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-foreground-muted uppercase flex items-center gap-1">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-sm font-medium text-foreground">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {vehicle.notes && (
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Notes</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap">{vehicle.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Active Assignment</h3>
                </div>
                <div className="p-6">
                  {vehicle.assignedDriverId ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{vehicle.assignedDriverName}</p>
                        <p className="text-xs text-foreground-muted">Assigned Driver</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/fleet-dashboard/driver-details/${vehicle.assignedDriverId}`)}
                        className="ml-auto p-2 hover:bg-background rounded-full transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-foreground-muted italic">No driver assigned</p>
                      <button 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="mt-3 text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                      >
                        Assign Now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Maintenance</h3>
                  <ArrowUpRight size={14} className="text-foreground-muted" />
                </div>
                <div className="divide-y divide-border">
                  {maintenance.slice(0, 3).map((m, i) => (
                    <div key={i} className="p-4 flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        m.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        <Wrench size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{m.serviceCategory?.replace('_', ' ')}</p>
                        <p className="text-[10px] text-foreground-muted">{m.requestedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-foreground">AED {m.actualCost || m.estimatedCost}</p>
                        <p className="text-[10px] text-foreground-muted uppercase font-bold">{m.status}</p>
                      </div>
                    </div>
                  ))}
                  {maintenance.length === 0 && (
                    <div className="p-8 text-center text-xs text-foreground-muted italic">No history available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {documents.map((doc, i) => (
              <div key={i} className="bg-card border border-border rounded-theme p-4 shadow-sm group hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                    <FileText size={24} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handlePreview(doc)}
                      className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{doc.documentType?.replace('_', ' ')}</h4>
                <p className="text-[10px] text-foreground-muted mb-3 font-mono">{doc.documentNumber || 'N/A'}</p>
                <div className="flex items-center justify-between text-[10px] bg-background-muted/50 p-2 rounded-lg">
                  <span className="font-bold text-foreground-muted uppercase tracking-tighter">Expiry</span>
                  <span className={`font-black ${
                    new Date(doc.expiryDate) < new Date() ? 'text-error' : 'text-foreground'
                  }`}>
                    {doc.expiryDate || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="col-span-full py-20 text-center bg-card rounded-theme border border-dashed border-border">
                <p className="text-foreground-muted italic">No documents uploaded for this asset</p>
                <button className="mt-4 text-sm font-bold text-primary hover:underline">Upload Document</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fuel history' && (
          <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Quantity (L)</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Unit Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Total Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Odometer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Driver</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fuelEntries.map((entry, i) => (
                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{entry.fuelDate}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{entry.quantityLiters}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">
                        {entry.amountAed && entry.quantityLiters ? `AED ${(entry.amountAed / entry.quantityLiters).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">AED {entry.amountAed}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{entry.odometerReading} KM</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{entry.driverName || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fuelEntries.length === 0 && (
              <div className="p-20 text-center">
                <Fuel size={48} className="mx-auto text-muted mb-4 opacity-20" />
                <p className="text-foreground-muted italic">No fuel consumption records found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Scheduled</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Garage</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Cost</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {maintenance.map((m, i) => (
                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Wrench size={14} className="text-primary" />
                          <span className="text-sm font-bold text-foreground">{m.serviceCategory?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-foreground-muted uppercase tracking-wider">{m.maintenanceType}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{m.scheduledDate || m.requestedDate}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{m.garage || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          m.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                          m.status === 'SCHEDULED' ? 'bg-indigo/10 text-indigo' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-foreground">AED {m.actualCost || m.estimatedCost}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors" title="View details">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {maintenance.length === 0 && (
              <div className="p-20 text-center">
                <Wrench size={48} className="mx-auto text-muted mb-4 opacity-20" />
                <p className="text-foreground-muted italic">No maintenance history recorded</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Maintenance Form Modal */}
      <VehicleMaintenanceForm 
        isOpen={isMaintenanceFormOpen}
        onClose={() => setIsMaintenanceFormOpen(false)}
        vehicleId={id}
        onSave={fetchData}
      />

      {/* Document Preview Modal */}
      {isPreviewOpen && previewFile && (
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
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                  setIsPreviewOpen(false);
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
                  URL.revokeObjectURL(previewFile.url);
                  setPreviewFile(null);
                  setIsPreviewOpen(false);
                }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-theme font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      <VehicleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={true}
        initialData={vehicle}
        onSave={fetchData}
      />

      <AssignDriverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicle={vehicle}
        onSave={fetchData}
      />
    </div>
  );
};

export default VehicleDetails;
