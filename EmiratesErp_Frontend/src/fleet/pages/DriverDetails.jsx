import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
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
  Hash
} from 'lucide-react';
import { toast } from 'react-toastify';
import DriverForm from './DriverForm';
import DriverPerformanceForm from './DriverPerformanceForm';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPerformanceFormOpen, setIsPerformanceFormOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      
      const [dRes, docRes, tRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/fleet/drivers/${id}`, { headers }),
        axios.get(`${API_URL}/fleet/drivers/${id}/documents`, { headers }),
        axios.get(`${API_URL}/fleet/trips`, { params: { driverId: id, size: 50 }, headers }),
        axios.get(`${API_URL}/fleet/performance`, { params: { driverId: id, size: 50 }, headers })
      ]);

      setDriver(dRes.data);
      setDocuments(docRes.data || []);
      setTrips(tRes.data.content || []);
      setPerformances(pRes.data.content || []);

      if (dRes.data.profileImageUrl) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-foreground-muted font-medium animate-pulse">Loading personnel records...</p>
        </div>
      </div>
    );
  }

  if (!driver) return <div className="p-20 text-center text-foreground font-bold">Driver not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-theme shadow-sm border border-border sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/fleet-dashboard/drivers')}
            className="p-2 hover:bg-background rounded-full transition-colors text-foreground-muted hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                {profileImage ? (
                   <img src={profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card flex items-center justify-center ${
                driver.status === 'AVAILABLE' ? 'bg-success' : 'bg-warning'
              }`}>
                {driver.status === 'AVAILABLE' ? <CheckCircle2 size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{driver.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  driver.status === 'AVAILABLE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {driver.status || 'AVAILABLE'}
                </span>
              </div>
              <p className="text-sm text-foreground-muted">Emp ID: {driver.employeeCode} • {driver.nationality || 'Nationality Not Set'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Edit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: trips.length.toLocaleString(), icon: <Truck />, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Performance', value: performances.length > 0 ? (performances.reduce((acc, p) => acc + p.rating, 0) / performances.length).toFixed(1) : 'N/A', icon: <Award />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Joining Date', value: driver.joiningDate || 'N/A', icon: <Calendar />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'License Expiry', value: driver.licenseExpiry || 'N/A', icon: <Clock />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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
        {['overview', 'documents', 'trip history', 'performance'].map((tab) => (
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
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Personnel Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  {[
                    { label: 'Full Name', value: driver.name, icon: <User size={14} /> },
                    { label: 'Employee Code', value: driver.employeeCode, icon: <Hash size={14} /> },
                    { label: 'Phone Number', value: driver.phone, icon: <Phone size={14} /> },
                    { label: 'Email Address', value: driver.email, icon: <Mail size={14} /> },
                    { label: 'License Number', value: driver.licenseNumber, icon: <CreditCard size={14} /> },
                    { label: 'License Type', value: driver.licenseType, icon: <Award size={14} /> },
                    { label: 'Emirates ID', value: driver.emiratesId, icon: <CreditCard size={14} /> },
                    { label: 'Nationality', value: driver.nationality, icon: <Globe size={14} /> },
                    { label: 'Address', value: driver.address, icon: <MapPin size={14} /> },
                    { label: 'Date of Birth', value: driver.dateOfBirth, icon: <Calendar size={14} /> },
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
              
              {driver.notes && (
                <div className="bg-card p-6 rounded-theme border border-border shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Professional Bio / Notes</h3>
                  <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap">{driver.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Assigned Vehicle</h3>
                </div>
                <div className="p-6">
                  {driver.assignedVehicleId ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Truck size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{driver.assignedVehiclePlateNumber}</p>
                        <p className="text-xs text-foreground-muted">Active Fleet Asset</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/fleet-dashboard/vehicle-details/${driver.assignedVehicleId}`)}
                        className="ml-auto p-2 hover:bg-background rounded-full transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-foreground-muted italic">No vehicle assigned</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Emergency Contact</h3>
                  <AlertCircle size={14} className="text-error" />
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-foreground">{driver.emergencyContact || 'Not Set'}</p>
                  <p className="text-xs text-foreground-muted uppercase font-bold tracking-tighter mt-1">Emergency Relation/Phone</p>
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
                <p className="text-foreground-muted italic">No tracking documents found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trip history' && (
          <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Trip No</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Route</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trips.map((trip, i) => (
                    <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-foreground">{trip.tripNo}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{trip.tripDate}</td>
                      <td className="px-6 py-4 text-sm text-foreground-muted">{trip.customerName}</td>
                      <td className="px-6 py-4 text-xs font-medium text-foreground-muted">{trip.fromLocation} → {trip.toLocation}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          trip.tripStatus === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {trip.tripStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-details/${trip.id}`)}
                          className="p-1.5 hover:bg-primary/10 text-primary rounded transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {trips.length === 0 && (
              <div className="p-20 text-center">
                <Truck size={48} className="mx-auto text-muted mb-4 opacity-20" />
                <p className="text-foreground-muted italic">No trip records found for this driver</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button 
                onClick={() => setIsPerformanceFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
              >
                <Plus size={16} /> Evaluate Performance
              </button>
            </div>
            <div className="bg-card rounded-theme border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Period</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">Trips</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted">On-Time %</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-center">Incidents</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-center">Fuel Score</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground-muted text-right">Incentive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {performances.map((p, i) => (
                      <tr key={i} className="hover:bg-background-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-foreground uppercase">{p.evaluationPeriod}</td>
                        <td className="px-6 py-4 text-sm text-foreground-muted">{p.tripsCompleted}</td>
                        <td className="px-6 py-4 text-sm text-foreground-muted">{p.onTimeDeliveryPercent}%</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${p.incidentsCount > 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                            {p.incidentsCount} Incidents
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-primary">{p.fuelEfficiencyScore}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground">AED {p.incentiveAmount?.toLocaleString()}</span>
                            {p.penaltyAmount > 0 && <span className="text-[10px] text-error font-bold">-{p.penaltyAmount} Penalty</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {performances.length === 0 && (
                <div className="p-20 text-center">
                  <Award size={48} className="mx-auto text-muted mb-4 opacity-20" />
                  <p className="text-foreground-muted italic">No performance data available</p>
                  <button 
                    onClick={() => setIsPerformanceFormOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-theme text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
                  >
                    <Plus size={16} /> Add First Evaluation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
      
      <DriverForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        isEditing={true}
        initialData={driver}
        onSave={fetchData}
      />
      
      <DriverPerformanceForm
        isOpen={isPerformanceFormOpen}
        onClose={() => setIsPerformanceFormOpen(false)}
        onSave={fetchData}
        driverId={id}
      />
    </div>
  );
};

export default DriverDetails;
