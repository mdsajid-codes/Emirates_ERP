import { ArrowLeft, MapPin, Calendar, User, Truck, Clock, Navigation, CheckCircle2, Circle } from "lucide-react";
import AppButton from "../tripManagement/components/dashboard/AppButton";

const RouteDetails = ({ route, onBack }) => {
  if (!route) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between bg-card p-4 rounded-theme shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-background-muted rounded-full transition-colors text-foreground-muted"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{route.routeName}</h1>
            <p className="text-xs text-foreground-muted font-bold uppercase tracking-widest mt-0.5">Route Timeline & Execution</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          route.status === 'COMPLETED' ? 'bg-success/10 text-success' : 
          route.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary animate-pulse' : 
          'bg-foreground-muted/10 text-foreground-muted'
        }`}>
          {route.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Info Cards */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-background-muted/30">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Asset Allocation</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground-muted uppercase">Driver</p>
                  <p className="text-sm font-bold text-foreground">{route.driverName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground-muted uppercase">Vehicle</p>
                  <p className="text-sm font-bold text-foreground">{route.vehiclePlateNumber}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-foreground-muted uppercase">Date</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-foreground">
                    <Calendar size={14} className="text-primary" />
                    <span>{route.routeDate}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground-muted uppercase">Distance</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-foreground">
                    <Navigation size={14} className="text-primary" />
                    <span>{route.distance || route.totalDistanceKm + " KM"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-theme shadow-sm border border-border p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">Management</h3>
            <AppButton variant="primary" className="w-full justify-center py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white border-none transition-all">
              Optimize Route
            </AppButton>
            <AppButton variant="secondary" className="w-full justify-center py-3">
              Print Manifest
            </AppButton>
          </div>
        </div>

        {/* Right Column: Stops Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-theme shadow-sm border border-border overflow-hidden min-h-[500px]">
            <div className="px-6 py-4 border-b border-border bg-background-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Journey Stops</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {route.stops?.length || 0} Total Points
              </span>
            </div>
            
            <div className="p-8">
              {route.stops && route.stops.length > 0 ? (
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-border before:to-transparent">
                  {route.stops.map((stop, index) => (
                    <div key={stop.id} className="relative flex items-start gap-6 group">
                      {/* Timeline Node */}
                      <div className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        stop.status === 'COMPLETED' ? 'bg-success border-success text-white shadow-lg shadow-success/20' : 
                        stop.status === 'IN_PROGRESS' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 animate-pulse' : 
                        'bg-background border-border text-foreground-muted'
                      }`}>
                        {stop.status === 'COMPLETED' ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{index + 1}</span>}
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 bg-background-muted/30 rounded-theme border border-border p-5 hover:border-primary/30 transition-all hover:shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <h4 className="font-bold text-foreground">{stop.stopName || `Stop #${index + 1}`}</h4>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                            stop.status === 'COMPLETED' ? 'bg-success/10 text-success' : 
                            'bg-foreground-muted/10 text-foreground-muted'
                          }`}>
                            {stop.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-foreground-muted leading-relaxed">{stop.address || "No address provided"}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Clock size={14} className="text-primary mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-foreground-muted uppercase">Est. Arrival</p>
                                <p className="text-xs text-foreground">{stop.estimatedArrival ? new Date(stop.estimatedArrival).toLocaleString() : 'Not set'}</p>
                            </div>
                          </div>
                        </div>

                        {stop.deliveryOrderNumber && (
                          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-foreground-muted uppercase">Order Reference</p>
                            <p className="text-xs font-bold text-primary hover:underline cursor-pointer">#{stop.deliveryOrderNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-foreground-muted opacity-50">
                  <Navigation size={48} strokeWidth={1} />
                  <p className="mt-4 font-medium">No stops defined for this route</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;
