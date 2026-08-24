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
    <div className="bg-[var(--color-card,#ffffff)] rounded-xl shadow-2xs border border-[var(--color-border,#D7E3EE)] p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none">
      
      {/* LEFT SIDE */}
      <div className="space-y-1.5">
        
        {/* Trip Number + Status */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight uppercase font-mono leading-none">
            TRP-{trip.tripNo}
          </h1>

          <StatusChip label={trip.tripStatus} variant={trip.tripStatus} />
        </div>

        {/* Date + Created By */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--color-foreground-muted,#60738E)]">
          
          <div className="flex items-center gap-1.5">
            <FiCalendar size={14} className="text-[var(--color-primary,#0178BC)]" />
            <span>{trip.tripDate}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FiUser size={14} className="text-[var(--color-primary,#0178BC)]" />
            <span>
              Created by{" "}
              <span className="text-[var(--color-foreground,#102A43)] font-bold">
                {trip.createdBy || 'System Admin'}
              </span>
            </span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/fleet-dashboard/trips/trip-form?id=${trip.id}`)}
          className="inline-flex items-center gap-2 bg-[#00A9A8] hover:bg-[#009190] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <FiEdit2 size={13} />
          Edit Trip
        </button>
      </div>
    </div>
  );
};

export default TripDetailsHeader;