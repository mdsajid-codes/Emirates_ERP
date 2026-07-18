import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Truck,
  User,
  MapPin,
  Calendar,
  Clock,
  Package,
  ChevronLeft,
  Plus,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Activity,
  Eye
} from 'lucide-react';
import DispatchJobForm from '../../pages/DispatchJobForm';
import DispatchAssignModal from '../../pages/DispatchAssignModal';
import PodUploadModal from '../../pages/PodUploadModal';

const STATUS_COLORS = {
  CREATED: 'bg-gray-100 text-gray-700 border-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  INVOICED: 'bg-purple-100 text-purple-700 border-purple-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DISPATCH_STATUS_COLORS = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  DISPATCHED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const TripDispatchPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [trip, setTrip] = useState(null);
  const [dispatchJobs, setDispatchJobs] = useState([]);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchTrip = async () => {
    try {
      setLoadingTrip(true);
      const response = await axios.get(`${API_URL}/fleet/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip details.');
    } finally {
      setLoadingTrip(false);
    }
  };

  const fetchDispatchJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await axios.get(`${API_URL}/fleet/dispatch/jobs?tripId=${tripId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDispatchJobs(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error fetching dispatch jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleViewPod = async (job) => {
    try {
      const response = await axios.get(`${API_URL}/fleet/dispatch/jobs/pods/${job.proofOfDeliveryPath}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing POD:', error);
      toast.error('Failed to load POD file');
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTrip();
      fetchDispatchJobs();
    }
  }, [tripId]);

  if (loadingTrip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-foreground-muted uppercase tracking-widest">Loading Trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground-muted font-bold">Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">

      {/* ── Sticky Header ───────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground-muted hover:text-primary transition-colors mb-1"
          >
            <ChevronLeft size={14} /> Back to Trips
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-primary uppercase tracking-tight">
              Trip Dispatch & Scheduling
            </h1>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20">
              TRIP #{trip.tripNo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/fleet-dashboard/trips/trip-tracker/${tripId}`)}
            className="flex items-center gap-2 px-5 py-2 bg-card border border-border text-foreground rounded-theme font-bold text-sm hover:bg-muted transition-all shadow-sm"
          >
            <Activity size={18} className="text-primary" /> Track Trip
          </button>
          <button
            onClick={() => { setSelectedJob(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-theme font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} /> Create Dispatch Job
          </button>
        </div>
      </div>

      <div className="space-y-8 mt-6">

      {/* ── Trip Context Card ───────────────────── */}
      <div className="bg-card border border-border rounded-theme shadow-sm p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted mb-4">Trip Summary</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-theme">
              <Calendar size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-foreground-muted opacity-60">Date</p>
              <p className="text-sm font-black text-foreground">{trip.tripDate || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-theme">
              <MapPin size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-foreground-muted opacity-60">Route</p>
              <p className="text-sm font-black text-foreground truncate">{trip.fromLocation}</p>
              <p className="text-[10px] font-bold text-primary opacity-50">→</p>
              <p className="text-sm font-black text-foreground truncate">{trip.toLocation}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-theme">
              <Truck size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-foreground-muted opacity-60">Vehicle</p>
              <p className="text-sm font-black text-foreground">{trip.vehiclePlateNumber || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-theme">
              <User size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-foreground-muted opacity-60">Driver</p>
              <p className="text-sm font-black text-foreground">{trip.driverName || 'Unassigned'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-theme">
              <Package size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-foreground-muted opacity-60">Trip Status</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${STATUS_COLORS[trip.tripStatus] || 'bg-gray-100 text-gray-700'}`}>
                {trip.tripStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Operational Flow Steps ──────────────── */}
      <div className="bg-card border border-border rounded-theme shadow-sm p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground-muted mb-5">Dispatch Workflow Steps</p>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {[
            { step: '01', label: 'Trip Created', done: true },
            { step: '02', label: 'Create Dispatch Job', done: dispatchJobs.length > 0 },
            { step: '03', label: 'Assign Vehicle & Driver', done: dispatchJobs.some(j => j.assignedVehiclePlate) || (trip.vehicleId && trip.driverId) },
            { step: '04', label: 'In Transit', done: dispatchJobs.some(j => j.deliveryStatus === 'IN_TRANSIT' || j.deliveryStatus === 'DELIVERED' || j.proofOfDeliveryPath) || ['IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'INVOICED', 'PAID', 'CLOSED'].includes(trip.tripStatus) },
            { step: '05', label: 'POD & Delivered', done: dispatchJobs.some(j => j.proofOfDeliveryPath) || ['DELIVERED', 'COMPLETED', 'INVOICED', 'PAID', 'CLOSED'].includes(trip.tripStatus) },
          ].map((s, i, arr) => (
            <div key={s.step} className="flex items-center flex-shrink-0">
              <div className={`flex flex-col items-center gap-1 px-4 py-3 rounded-theme transition-all ${s.done ? 'bg-primary/10' : 'bg-background-muted'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${s.done ? 'bg-primary text-white' : 'bg-border text-foreground-muted'}`}>
                  {s.done ? '✓' : s.step}
                </div>
                <p className={`text-[9px] font-black uppercase tracking-wider text-center max-w-[80px] ${s.done ? 'text-primary' : 'text-foreground-muted opacity-50'}`}>
                  {s.label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className={`h-0.5 w-8 flex-shrink-0 ${s.done ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dispatch Jobs Table ──────────────────── */}
      <div className="bg-card border border-border rounded-theme shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-primary" />
            <p className="text-sm font-black text-foreground uppercase tracking-tight">Dispatch Jobs for this Trip</p>
          </div>
          <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full">
            {dispatchJobs.length} job{dispatchJobs.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                {['Job No', 'Customer', 'Route', 'Assigned Resources', 'Priority', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-[10px] font-black uppercase tracking-wider text-foreground-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingJobs ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-foreground-muted">Loading dispatch jobs...</p>
                    </div>
                  </td>
                </tr>
              ) : dispatchJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <ClipboardList size={48} />
                      <p className="text-base font-bold">No dispatch jobs for this trip yet</p>
                      <p className="text-sm">Click "Create Dispatch Job" to begin scheduling</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dispatchJobs.map(job => (
                  <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-black text-primary text-sm">{job.jobNo}</span>
                      <p className="text-[10px] text-foreground-muted">{job.jobDate}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{job.customerName || '—'}</td>
                    <td className="px-6 py-4 text-xs text-foreground-muted">
                      <div className="flex flex-col">
                        <span>{job.pickupLocation}</span>
                        <span className="font-bold text-[10px] text-primary/50">→</span>
                        <span>{job.dropLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {job.assignedVehiclePlate ? (
                        <div className="flex flex-col gap-1 text-xs">
                          <div className="flex items-center gap-1.5"><Truck size={11} className="text-foreground-muted" /><span className="font-medium">{job.assignedVehiclePlate}</span></div>
                          <div className="flex items-center gap-1.5"><User size={11} className="text-foreground-muted" /><span>{job.assignedDriverName}</span></div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded border bg-muted text-foreground-muted">{job.priority || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${DISPATCH_STATUS_COLORS[job.deliveryStatus] || 'bg-gray-100 text-gray-700'}`}>
                        {job.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/fleet-dashboard/trips/trip-tracker/${tripId}`)}
                          title="Track Trip"
                          className="p-2 hover:bg-muted rounded-theme text-foreground-muted hover:text-primary transition-all"
                        >
                          <Activity size={16} />
                        </button>
                        {job.deliveryStatus === 'PENDING' && (
                          <button
                            onClick={() => { setSelectedJob(job); setIsAssignModalOpen(true); }}
                            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-theme font-bold hover:bg-primary hover:text-white transition-all"
                          >
                            Assign
                          </button>
                        )}
                        {(job.deliveryStatus === 'DISPATCHED' || job.deliveryStatus === 'IN_TRANSIT') && (
                          <button
                            onClick={() => { setSelectedJob(job); setIsPodModalOpen(true); }}
                            className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-theme font-bold hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5 border border-green-100"
                          >
                            <Camera size={14} /> POD
                          </button>
                        )}
                        {job.proofOfDeliveryPath && (
                          <button
                            onClick={() => handleViewPod(job)}
                            title="View POD"
                            className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-theme hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────── */}
      <DispatchJobForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => { fetchDispatchJobs(); setIsFormOpen(false); }}
        initialData={selectedJob}
        prefilledTripId={tripId}
        prefilledData={trip ? {
          customerId: trip.customerId,
          pickupLocation: trip.fromLocation,
          dropLocation: trip.toLocation,
          cargoDetails: trip.cargoType,
          loadWeight: trip.loadWeightKg
        } : null}
      />

      <DispatchAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={() => { fetchDispatchJobs(); setIsAssignModalOpen(false); }}
        job={selectedJob}
        tripContext={trip}
      />

      <PodUploadModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        onSave={() => { fetchDispatchJobs(); setIsPodModalOpen(false); }}
        job={selectedJob}
      />
      </div>
    </div>
  );
};

export default TripDispatchPage;
