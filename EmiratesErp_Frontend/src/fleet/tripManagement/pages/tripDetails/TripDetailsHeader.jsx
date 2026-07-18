import { useNavigate } from "react-router-dom";
import { FiEdit2, FiPrinter, FiCalendar, FiUser } from "react-icons/fi";
import StatusChip from "../../components/table/StatusChip";

const TripDetailsHeader = ({ trip }) => {
  const navigate = useNavigate();

  if (!trip) return (
    <div className="bg-card rounded-theme shadow-sm border border-border p-6">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-6 w-1/3 bg-background-muted rounded-theme"></div>
        <div className="h-6 w-1/3 bg-background-muted rounded-theme"></div>
        <div className="h-6 w-1/3 bg-background-muted rounded-theme"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-theme shadow-sm border border-border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-slide-down">
      
      {/* LEFT SIDE */}
      <div className="space-y-3">
        
        {/* Trip Number + Status */}
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-primary tracking-tight uppercase">
            TRP-{trip.tripNo}
          </h1>

          <StatusChip label={trip.tripStatus} variant={trip.tripStatus} />
        </div>

        {/* Date + Created By */}
        <div className="flex flex-wrap items-center gap-8 text-[10px] font-black text-foreground-muted uppercase tracking-widest">
          
          <div className="flex items-center gap-2">
            <FiCalendar size={16} className="text-primary" />
            <span>{trip.tripDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiUser size={16} className="text-primary" />
            <span>
              Created by{" "}
              <span className="text-foreground">
                {trip.createdBy}
              </span>
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex items-center gap-4">
        
        <button
          onClick={() => navigate(`/fleet-dashboard/trips/trip-form?id=${trip.id}`)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
        >
          <FiEdit2 size={14} />
          Edit Trip
        </button>

        {/* <button
          className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          <FiPrinter size={14} />
          Print BOL
        </button> */}

      </div>
    </div>
  );
};

export default TripDetailsHeader;