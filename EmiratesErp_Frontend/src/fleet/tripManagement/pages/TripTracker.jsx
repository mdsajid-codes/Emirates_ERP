import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  User, 
  ChevronLeft, 
  Activity,
  Fuel,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Save,
  RotateCcw,
  Upload,
  FileDown,
  Banknote
} from 'lucide-react';
import { toast } from 'react-toastify';
import RecordPaymentModal from '../components/RecordPaymentModal';

const STATUS_COLORS = {
  CREATED: 'bg-gray-100 text-gray-700 border-gray-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  INVOICED: 'bg-purple-100 text-purple-700 border-purple-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const TripTracker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeStops, setRouteStops] = useState([]);
  
  // Quick Actions State
  const [fuelForm, setFuelForm] = useState({
    fuelDate: new Date().toISOString().split('T')[0],
    fuelStation: '',
    fuelType: 'DIESEL',
    quantityLiters: '',
    amountAed: '',
    odometerReading: '',
    notes: ''
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: 'PREVENTIVE',
    serviceCategory: 'ENGINE_REPAIR',
    requestedDate: new Date().toISOString().split('T')[0],
    scheduledDate: new Date().toISOString().split('T')[0],
    garage: '',
    odometerAtService: '',
    estimatedCost: '',
    serviceNotes: ''
  });

  const [savingFuel, setSavingFuel] = useState(false);
  const [savingMaint, setSavingMaint] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [maintenanceEntries, setMaintenanceEntries] = useState([]);

  const fetchMaintenanceEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/maintenance?tripId=${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMaintenanceEntries(response.data.content || []);
    } catch (error) {
      console.error('Error fetching maintenance entries:', error);
    }
  };

  const fetchTrip = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trips/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTrip(response.data);
      setRouteStops(response.data.routeStops || []);
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };


  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axios.patch(`${API_URL}/fleet/trips/${id}/status`, 
        { newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Trip status updated to ${newStatus}`);
      fetchTrip();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const [receiptFile, setReceiptFile] = useState(null);
  const [fuelEntries, setFuelEntries] = useState([]);

  const fetchFuelEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/fuel?tripId=${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setFuelEntries(response.data.content || []);
    } catch (error) {
      console.error('Error fetching fuel entries:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTrip();
      fetchFuelEntries();
      fetchMaintenanceEntries();
    }
  }, [id]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSavingFuel(true);
    try {
      const payload = {
        ...fuelForm,
        vehicleId: trip.vehicleId,
        driverId: trip.driverId,
        tripId: trip.id,
        quantityLiters: fuelForm.quantityLiters ? Number(fuelForm.quantityLiters) : null,
        amountAed: fuelForm.amountAed ? Number(fuelForm.amountAed) : null,
        odometerReading: fuelForm.odometerReading ? Number(fuelForm.odometerReading) : null
      };
      const response = await axios.post(`${API_URL}/fleet/fuel`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const fuelEntryId = response.data.id;

      // Handle File Upload if selected
      if (receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);
        await axios.post(`${API_URL}/fleet/fuel/${fuelEntryId}/receipt`, formData, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Fuel entry and receipt saved successfully');
      setFuelForm({
        fuelDate: new Date().toISOString().split('T')[0],
        fuelStation: '',
        fuelType: 'DIESEL',
        quantityLiters: '',
        amountAed: '',
        odometerReading: '',
        notes: ''
      });
      setReceiptFile(null);
      fetchFuelEntries(); // Refresh list
    } catch (error) {
      toast.error('Failed to save fuel entry');
    } finally {
      setSavingFuel(false);
    }
  };

  const handleMaintSubmit = async (e) => {
    e.preventDefault();
    setSavingMaint(true);
    try {
      const payload = {
        ...maintenanceForm,
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        odometerAtService: maintenanceForm.odometerAtService ? Number(maintenanceForm.odometerAtService) : null,
        estimatedCost: maintenanceForm.estimatedCost ? Number(maintenanceForm.estimatedCost) : null
      };
      await axios.post(`${API_URL}/fleet/maintenance`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Maintenance request created');
      setMaintenanceForm({
        maintenanceType: 'PREVENTIVE',
        serviceCategory: 'ENGINE_REPAIR',
        requestedDate: new Date().toISOString().split('T')[0],
        scheduledDate: new Date().toISOString().split('T')[0],
        garage: '',
        odometerAtService: '',
        estimatedCost: '',
        serviceNotes: ''
      });
      fetchMaintenanceEntries(); // Refresh list
    } catch (error) {
      toast.error('Failed to create maintenance request');
    } finally {
      setSavingMaint(false);
    }
  };

  const markStopReached = async (stopId) => {
    try {
      await axios.patch(`${API_URL}/fleet/trips/stops/${stopId}/reached`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Stop marked as reached');
      fetchTrip();
    } catch (error) {
      toast.error('Failed to update stop status');
    }
  };

  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const downloadInvoice = async () => {
    setGeneratingInvoice(true);
    try {
      let invoiceId = trip.invoiceId;

      // If no invoice exists, generate one first
      if (!invoiceId) {
        const genRes = await axios.post(`${API_URL}/fleet/trip-invoices`, {
          customerId: trip.customerId,
          tripIds: [trip.id],
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          notes: 'Auto-generated from Trip Tracker'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        invoiceId = genRes.data.id;
        toast.info('Invoice generated automatically');
        fetchTrip(); // Refresh to update trip status to INVOICED
      }

      const response = await axios.get(
        `${API_URL}/fleet/trip-invoices/${invoiceId}/pdf`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${trip.invoiceNumber || 'new'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`Failed to process invoice: ${serverError}`);
      console.error('Invoice Error:', error.response?.data);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RotateCcw className="animate-spin text-primary" size={40} />
          <p className="font-black text-foreground-muted uppercase tracking-widest text-sm">Loading Tracker...</p>
        </div>
      </div>
    );
  }

  if (!trip) return <div className="p-10 text-center font-bold">Trip not found</div>;

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card border border-border rounded-theme p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-background-muted rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Trip Tracking</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${STATUS_COLORS[trip.tripStatus]}`}>
                {trip.tripStatus}
              </span>
            </div>
            <p className="text-xs font-bold text-foreground-muted mt-1">TRIP #{trip.tripNo} • {trip.tripDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <Truck size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-foreground-muted uppercase">Vehicle</p>
              <p className="text-sm font-black text-foreground">{trip.vehiclePlateNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-theme text-primary">
              <User size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-foreground-muted uppercase">Driver</p>
              <p className="text-sm font-black text-foreground">{trip.driverName || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: VERTICAL TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-theme p-8 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-10">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Route Progress</h2>
            </div>

            <div className="relative pl-8 space-y-12">
              {/* Vertical Line */}
              <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border border-dashed border-l-2"></div>

              {/* Start Location */}
              <div className="relative flex items-start gap-6">
                <div className="absolute -left-8 w-7 h-7 bg-primary rounded-full border-4 border-card flex items-center justify-center text-white z-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-widest">Origin</p>
                  <h3 className="text-xl font-black text-foreground mt-1">{trip.fromLocation}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-foreground-muted font-bold">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> Scheduled: {trip.tripDate}</span>
                  </div>
                </div>
              </div>

              {/* Intermediate Stops */}
              {routeStops.length > 0 ? (
                routeStops.map((stop, index) => (
                  <div key={stop.id} className="relative flex items-start gap-6">
                    <div className={`absolute -left-8 w-7 h-7 rounded-full border-4 border-card flex items-center justify-center z-10 ${
                      stop.status === 'COMPLETED' || stop.status === 'REACHED' ? 'bg-green-500 text-white' : 
                      stop.status === 'ARRIVED' ? 'bg-blue-500 text-white' : 'bg-muted text-foreground-muted'
                    }`}>
                      {stop.status === 'COMPLETED' || stop.status === 'REACHED' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-current rounded-full"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-foreground-muted uppercase tracking-widest">Stop {index + 1} • {stop.status}</p>
                          <h3 className="text-lg font-bold text-foreground mt-1">{stop.customerName || stop.address}</h3>
                        </div>
                        {stop.status === 'PENDING' && (
                          <button 
                            onClick={() => markStopReached(stop.id)}
                            className="text-[10px] font-black uppercase bg-green-500/10 text-green-600 border border-green-500/20 px-3 py-1.5 rounded-theme hover:bg-green-500 hover:text-white transition-all flex items-center gap-1.5"
                          >
                            <MapPin size={10} /> Mark Reached
                          </button>
                        )}
                      </div>
                      
                      {stop.status === 'REACHED' && stop.actualArrival && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-bold bg-green-500/5 px-3 py-1 rounded-full w-fit">
                          <Clock size={12} /> Arrived at: {new Date(stop.actualArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}

                      {stop.notes && <p className="text-xs text-foreground-muted mt-2 italic">"{stop.notes}"</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border-y border-dashed border-border/50 opacity-40">
                  <Activity size={32} />
                  <p className="text-xs font-bold mt-2">In Transit between locations</p>
                </div>
              )}

              {/* End Location */}
              <div className="relative flex items-start gap-6">
                <div className="absolute -left-8 w-7 h-7 bg-foreground rounded-full border-4 border-card flex items-center justify-center text-white z-10">
                   <MapPin size={12} />
                </div>
                <div>
                  <p className="text-xs font-black text-foreground-muted uppercase tracking-widest">Destination</p>
                  <h3 className="text-xl font-black text-foreground mt-1">{trip.toLocation}</h3>
                  <p className="text-xs font-bold text-foreground-muted mt-2">End of Trip</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONS */}
        <div className="space-y-6">
          
          {/* STATUS UPDATE CARD */}
          <div className="bg-card border border-border rounded-theme p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-3 bg-primary/5 rounded-bl-3xl">
              <Activity size={24} className="text-primary/20" />
            </div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-6">Trip Controls</h3>
            
            <div className="space-y-3">
              {trip.tripStatus === 'CREATED' && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    disabled={updatingStatus}
                    className="w-full py-3 bg-primary text-white rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Activity size={16} />
                    Start Trip
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={updatingStatus}
                    className="w-full py-3 bg-error/10 text-error border border-error/20 rounded-theme text-xs font-black uppercase tracking-widest hover:bg-error hover:text-white transition-all"
                  >
                    Cancel Trip
                  </button>
                </>
              )}

              {trip.tripStatus === 'IN_PROGRESS' && (
                <button 
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  disabled={updatingStatus}
                  className="w-full py-3 bg-success text-white rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-success/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Complete Trip
                </button>
              )}

              {['COMPLETED', 'CANCELLED', 'INVOICED', 'PAID', 'CLOSED'].includes(trip.tripStatus) && (
                <div className="space-y-3">
                  <div className="p-4 bg-background-muted rounded-theme border border-border text-center">
                    <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">Status: {trip.tripStatus}</p>
                    <p className="text-[9px] font-bold text-foreground-muted/60 uppercase mt-1">No further tracking actions</p>
                  </div>
                  
                  {['COMPLETED', 'INVOICED', 'PAID'].includes(trip.tripStatus) && (
                    <button 
                      onClick={downloadInvoice}
                      disabled={generatingInvoice}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                    >
                      {generatingInvoice ? (
                        <RotateCcw className="animate-spin" size={14} />
                      ) : (
                        <FileDown size={14} />
                      )}
                      {trip.invoiceId ? 'Download Invoice PDF' : 'Generate & Download Invoice'}
                    </button>
                  )}

                  {trip.invoiceId && trip.tripStatus !== 'PAID' && (
                    <button 
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-success/10 text-success border border-success/20 rounded-theme text-xs font-black uppercase tracking-widest hover:bg-success hover:text-white transition-all shadow-sm"
                    >
                      <Banknote size={14} />
                      Record Payment
                    </button>
                  )}
                </div>
              )}

              {updatingStatus && (
                <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <RotateCcw className="animate-spin text-primary" size={24} />
                </div>
              )}
            </div>
          </div>

          {/* FUEL LOG CARD */}
          <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Fuel size={18} className="text-amber-500" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Quick Fuel Entry</h3>
            </div>

            {fuelEntries.length > 0 && (
              <div className="mb-4 space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {fuelEntries.map((entry) => (
                  <div key={entry.id} className="p-2 bg-background-muted rounded-theme border border-border text-[10px] flex justify-between items-center">
                    <div>
                      <p className="font-black text-foreground">{entry.quantityLiters}L @ {entry.amountAed} AED</p>
                      <p className="text-foreground-muted font-bold">{entry.fuelStation || 'Station N/A'} • {entry.odometerReading} KM</p>
                    </div>
                    {entry.receiptPath && (
                      <div className="bg-success/10 p-1 rounded-full text-success">
                        <CheckCircle2 size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleFuelSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="number" 
                  placeholder="Liters" 
                  className="bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  value={fuelForm.quantityLiters}
                  onChange={(e) => setFuelForm({...fuelForm, quantityLiters: e.target.value})}
                  required
                />
                <input 
                  type="number" 
                  placeholder="Amount AED" 
                  className="bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  value={fuelForm.amountAed}
                  onChange={(e) => setFuelForm({...fuelForm, amountAed: e.target.value})}
                  required
                />
              </div>
              <input 
                type="number" 
                placeholder="Odometer Reading (KM)" 
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                value={fuelForm.odometerReading}
                onChange={(e) => setFuelForm({...fuelForm, odometerReading: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Station Name" 
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                value={fuelForm.fuelStation}
                onChange={(e) => setFuelForm({...fuelForm, fuelStation: e.target.value})}
              />
              <div className="relative group">
                <input 
                  type="file" 
                  id="receipt-upload"
                  className="hidden" 
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  accept="image/*,.pdf"
                />
                <label 
                  htmlFor="receipt-upload"
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-background border border-border border-dashed rounded-theme text-[10px] font-bold text-foreground-muted cursor-pointer hover:border-primary hover:text-primary transition-all"
                >
                  <span className="truncate">{receiptFile ? receiptFile.name : 'Upload Receipt (Image/PDF)'}</span>
                  <Upload size={14} />
                </label>
              </div>
              <button 
                type="submit"
                disabled={savingFuel}
                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-theme text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
              >
                {savingFuel ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14} />}
                Log Fuel Entry
              </button>
            </form>
          </div>

          {/* MAINTENANCE CARD */}
          <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Wrench size={18} className="text-red-500" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Report Issue</h3>
            </div>

            {maintenanceEntries.length > 0 && (
              <div className="mb-4 space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                {maintenanceEntries.map((entry) => (
                  <div key={entry.id} className="p-2 bg-background-muted rounded-theme border border-border text-[10px] flex justify-between items-center">
                    <div>
                      <p className="font-black text-foreground">{entry.serviceCategory} • {entry.status}</p>
                      <p className="text-foreground-muted font-bold truncate max-w-[150px]">{entry.serviceNotes}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-primary">{entry.estimatedCost || 0} AED</p>
                       <p className="text-foreground-muted font-bold">{entry.requestedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleMaintSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="w-full bg-background border border-border rounded-theme px-3 py-2 text-xs font-bold outline-none"
                  value={maintenanceForm.maintenanceType}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, maintenanceType: e.target.value})}
                >
                  <option value="PREVENTIVE">PREVENTIVE</option>
                  <option value="CORRECTIVE">CORRECTIVE</option>
                </select>
                <select 
                  className="w-full bg-background border border-border rounded-theme px-3 py-2 text-xs font-bold outline-none"
                  value={maintenanceForm.serviceCategory}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, serviceCategory: e.target.value})}
                >
                  <option value="ENGINE_REPAIR">ENGINE</option>
                  <option value="TYRE_REPLACEMENT">TYRES</option>
                  <option value="BRAKE_SERVICE">BRAKES</option>
                  <option value="ELECTRICAL">ELECTRICAL</option>
                  <option value="BODY_WORK">BODY</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Garage Name" 
                  className="bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none"
                  value={maintenanceForm.garage}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, garage: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="Est. Cost" 
                  className="bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none"
                  value={maintenanceForm.estimatedCost}
                  onChange={(e) => setMaintenanceForm({...maintenanceForm, estimatedCost: e.target.value})}
                />
              </div>

              <textarea 
                placeholder="Describe the issue..."
                className="w-full bg-background border border-border rounded-theme px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows="2"
                value={maintenanceForm.serviceNotes}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, serviceNotes: e.target.value})}
                required
              ></textarea>
              <button 
                type="submit"
                disabled={savingMaint}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-600 border border-red-500/20 rounded-theme text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
              >
                {savingMaint ? <RotateCcw size={14} className="animate-spin" /> : <AlertCircle size={14} />}
                Request Maintenance
              </button>
            </form>
          </div>

        </div>
      </div>
      
      <RecordPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={fetchTrip}
        trip={trip}
      />
    </div>
  );
};

export default TripTracker;
