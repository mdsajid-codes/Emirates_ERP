import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit2, 
  Trash2, 
  Navigation, 
  Calendar, 
  User, 
  Truck, 
  RefreshCw, 
  CheckCircle, 
  FileText,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import TripStatusTimeline from '../tripManagement/pages/tripDetails/TripStatusTimeline';
import TripComplaintsPanel from '../tripManagement/components/TripComplaintsPanel';
import UpdateTripStatusModal from '../tripManagement/components/trips/UpdateTripStatusModal';
import VendorPaymentModal from '../tripManagement/components/trips/VendorPaymentModal';

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const response = await axios.get(`${API_URL}/fleet/trips/${id}`, { headers });
      setTrip(response.data);
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Failed to load trip manifest");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/trips/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Trip deleted successfully");
      navigate('/fleet-dashboard/trips');
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return "0.00";
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'CLOSED':
      case 'PAID':
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            {status}
          </span>
        );
      case 'IN_PROGRESS':
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-blue-50 text-[#0178BC] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0178BC]"></span>
            {status}
          </span>
        );
      case 'SCHEDULED':
      case 'CREATED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#FFF4E5] text-[#FF9800] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9800]"></span>
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-slate-100 text-slate-700 inline-flex items-center gap-1.5">
            {status || 'CREATED'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل الرحلة...' : 'Loading trip details...'}
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Trip manifest not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-card,#ffffff)] p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        
        {/* Left Side Info */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/trips')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-foreground,#102A43)] tracking-tight uppercase font-mono">
                TRP-{trip.tripNo}
              </h1>
              {getStatusBadge(trip.tripStatus)}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-[var(--color-foreground-muted,#60738E)] mt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--color-primary,#0178BC)]" />
                <span>{trip.tripDate || '–'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--color-primary,#0178BC)]" />
                <span>Created by <span className="text-[var(--color-foreground,#102A43)]">{trip.createdBy || 'System Admin'}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Header Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/trips/trip-form/${trip.id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary,#0178BC)] text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Trip</span>
          </button>
        </div>

      </div>

      {/* Grid: Route & Driver | Customer | Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* 1. Route & Driver */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-3">
            <Truck className="w-4 h-4 text-[var(--color-primary,#0178BC)]" />
            Route & Driver
          </h3>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Driver</p>
            <p className="text-base font-bold text-[var(--color-foreground,#102A43)] mt-0.5">{trip.driverName || trip.driver?.name || 'Unassigned'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Container No</p>
            <p className="text-sm font-bold text-[var(--color-foreground,#102A43)] font-mono mt-0.5">{trip.containerNumber || 'N/A'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase mb-3">Route Timeline</p>
            <div className="space-y-3 text-xs relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border,#D7E3EE)] pl-4">
              <div className="relative">
                <span className="w-2.5 h-2.5 absolute -left-4 top-1 rounded-full bg-[var(--color-primary,#0178BC)]"></span>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Pickup</p>
                <p className="font-bold text-[var(--color-foreground,#102A43)] mt-0.5">{trip.fromLocation || 'N/A'}</p>
              </div>
              <div className="relative pt-1">
                <span className="w-2.5 h-2.5 absolute -left-4 top-2 rounded-full bg-slate-400"></span>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Drop-off</p>
                <p className="font-bold text-[var(--color-foreground,#102A43)] mt-0.5">{trip.toLocation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Customer Information */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-3">
            <User className="w-4 h-4 text-[var(--color-primary,#0178BC)]" />
            Customer
          </h3>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Company</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-base font-bold text-[var(--color-foreground,#102A43)]">{trip.customerName || trip.customer?.companyName || 'N/A'}</p>
              {trip.customerType && (
                <span className="text-[10px] font-bold bg-sky-50 text-[var(--color-primary,#0178BC)] px-2 py-0.5 rounded-md uppercase">
                  {trip.customerType}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Contact Person</p>
            <p className="text-sm font-bold text-[var(--color-foreground,#102A43)] mt-0.5">{trip.contactPerson || "Not Specified"}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Ref / Job No</p>
            <p className="text-sm font-bold text-[var(--color-foreground,#102A43)] font-mono mt-0.5">{trip.customerRefJobNo || "N/A"}</p>
          </div>

          {trip.remarks && (
            <div className="bg-slate-50 p-3 rounded-lg border border-[var(--color-border,#D7E3EE)] text-xs text-[var(--color-foreground,#102A43)]">
              <span className="block text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase mb-1">Remarks</span>
              {trip.remarks}
            </div>
          )}
        </div>

        {/* 3. Financial Summary */}
        <div className="bg-[var(--color-primary,#0178BC)] rounded-xl text-white p-5 shadow-sm space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-white/20 pb-3">
              <Wallet className="w-4 h-4 text-amber-300" />
              Financial Summary
            </h3>

            <div className="space-y-2.5 text-xs font-bold pt-3">
              <div className="flex justify-between items-center opacity-90">
                <span className="uppercase text-[11px]">Base Amount</span>
                <span>AED {formatCurrency(trip.amount)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span className="uppercase text-[11px]">Token Advance</span>
                <span>AED {formatCurrency(trip.tokenAmount)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span className="uppercase text-[11px]">Other Charges</span>
                <span>AED {formatCurrency(trip.otherCharges)}</span>
              </div>
              <div className="flex justify-between items-center opacity-90">
                <span className="uppercase text-[11px]">VAT (5%)</span>
                <span>AED {formatCurrency(trip.vatAmount)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-3">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold uppercase text-white/70">Total Amount</span>
              <div className="text-2xl font-black">
                AED {formatCurrency(trip.totalAmount)}
              </div>
            </div>

            <div className="mt-2.5 flex justify-between items-center text-[10px] font-bold uppercase bg-white/10 p-2 rounded-lg">
              <span className="opacity-80">Driver Commission</span>
              <span className="text-amber-300">AED {formatCurrency(trip.driverCommission)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Trip Status Timeline */}
      <TripStatusTimeline status={trip.tripStatus} createdAt={trip.createdAt} />

      {/* Trip Complaints & Incidents Panel */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs">
        <TripComplaintsPanel trip={trip} />
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--color-border,#D7E3EE)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            className="inline-flex items-center gap-2 bg-[var(--color-primary,#0178BC)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-2xs cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Change Status
          </button>
          
          {trip?.vendorId && trip?.tripStatus !== 'CLOSED' && (
            <button 
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-2xs cursor-pointer"
              onClick={() => setIsVendorModalOpen(true)}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Vendor Payment
            </button>
          )}

          <button 
            className="inline-flex items-center gap-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D7E3EE)] text-[var(--color-foreground,#102A43)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            onClick={() => navigate('/fleet-dashboard/invoices/new')}
          >
            <FileText className="w-3.5 h-3.5 text-[var(--color-primary,#0178BC)]" />
            Go to Invoice
          </button>
        </div>

        <button 
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Trip
        </button>
      </div>

      {/* Modals */}
      <UpdateTripStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
        onSuccess={fetchTrip}
      />

      {isVendorModalOpen && (
        <VendorPaymentModal 
          trip={trip}
          onClose={() => setIsVendorModalOpen(false)}
          onSuccess={() => {
            setIsVendorModalOpen(false);
            fetchTrip();
          }}
        />
      )}

    </div>
  );
};

export default TripDetailsPage;
