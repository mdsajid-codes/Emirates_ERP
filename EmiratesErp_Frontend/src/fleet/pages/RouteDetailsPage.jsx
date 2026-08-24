import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight,
  Edit, 
  Trash2, 
  Navigation, 
  User, 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const RouteDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const response = await axios.get(`${API_URL}/fleet/routes/${id}`, { headers });
      setRoute(response.data);
    } catch (error) {
      console.error('Error fetching route details:', error);
      toast.error('Failed to load route details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    try {
      await axios.delete(`${API_URL}/fleet/routes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Route deleted successfully");
      navigate('/fleet-dashboard/routes');
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Failed to delete route");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-amber-50 text-amber-600 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 inline-flex items-center gap-1.5">
            {status || 'PLANNED'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل المسار...' : 'Loading route details...'}
      </div>
    );
  }

  if (!route) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Route not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/routes')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none">
                {route.routeName}
              </h1>
              {getStatusBadge(route.status)}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Date: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{route.routeDate || '–'}</span> • Distance: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{route.totalDistanceKm ? `${route.totalDistanceKm} KM` : 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/fleet-dashboard/routes/route-form/${route.id}`)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-[var(--color-foreground,#102A43)]" />
            <span>{t('fleet.routeDetails.editRoute') || 'Edit Route'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Driver & Vehicle */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">DRIVER & VEHICLE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{route.driverName || 'Unassigned'}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono truncate">{route.vehiclePlateNumber || 'Unassigned'}</p>
          </div>
        </div>

        {/* Date & Distance */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">DATE & DISTANCE</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{route.routeDate}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">{route.totalDistanceKm ? `${route.totalDistanceKm} KM` : 'N/A'}</p>
          </div>
        </div>

        {/* Waypoints & Stops */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">WAYPOINTS & STOPS</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{route.stops?.length || 0} Journey Points</p>
          </div>
        </div>

        {/* Duration */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">ESTIMATED DURATION</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{route.estimatedDurationMins ? `${route.estimatedDurationMins} Mins` : 'N/A'}</p>
          </div>
        </div>

      </div>

      {/* Journey Stops Timeline Section */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">JOURNEY STOPS TIMELINE</h2>
          <span className="text-[10px] font-bold text-[var(--color-primary,#0178BC)] bg-sky-50 px-2.5 py-0.5 rounded-md">
            {route.stops?.length || 0} Waypoint Points
          </span>
        </div>

        {route.stops && route.stops.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border,#D7E3EE)]">
            {route.stops.map((stop, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary,#0178BC)] text-white text-[10px] font-bold flex items-center justify-center absolute -left-6 top-0.5 z-10">
                  {stop.sequence || idx + 1}
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-[var(--color-border,#D7E3EE)]">
                  <p className="text-xs font-bold text-[var(--color-foreground,#102A43)]">{stop.stopName || `Stop ${idx + 1}`}</p>
                  <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">{stop.address || 'Location Address'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
            No specific waypoints recorded for this route.
          </div>
        )}
      </div>

      {/* Actions Bottom Bar */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--color-border,#D7E3EE)]">
        <button 
          onClick={handleDelete}
          className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Route
        </button>
      </div>

    </div>
  );
};

export default RouteDetailsPage;
