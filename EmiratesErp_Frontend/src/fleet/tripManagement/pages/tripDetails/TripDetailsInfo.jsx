import { FiUser, FiTruck } from "react-icons/fi";
import {IoMdWallet} from "react-icons/io"

const formatCurrency = (value) => {
  if (!value) return "0.00";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const TripDetailsInfo = ({ trip }) => {
  if (!trip) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

      {/* ───────── Route & Driver ───────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="animate-pulse flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </div>
        </div>
        {/* ───────── Customer ───────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="animate-pulse flex flex-col gap-4"> 
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </div>
        </div>
        {/* ───────── Financial Summary ───────── */}
        <div className="bg-primary rounded-xl shadow-lg text-white p-6 space-y-6">  
            <div className="animate-pulse flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
            </div>
        </div>
      </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

      {/* ───────── Route & Driver ───────── */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl shadow-2xs border border-[var(--color-border,#D7E3EE)] p-3.5 space-y-3">
        <h3 className="text-xs font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <FiTruck size={14} className="text-[var(--color-primary,#0178BC)]" />
          Route & Driver
        </h3>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Driver</p>
          <p className="text-sm font-bold text-[var(--color-foreground,#102A43)] mt-0.5">{trip.driverName || 'Unassigned'}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Container No</p>
          <p className="text-xs font-bold text-[var(--color-foreground,#102A43)] font-mono mt-0.5">
            {trip.containerNumber || 'N/A'}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase mb-2">Route Timeline</p>

          <div className="space-y-2.5 text-xs relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border,#D7E3EE)] pl-3.5">
            <div className="relative">
              <span className="w-2.5 h-2.5 absolute -left-3.5 top-1 rounded-full bg-[var(--color-primary,#0178BC)]"></span>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Pickup</p>
                <p className="font-bold text-[var(--color-foreground,#102A43)] mt-0.5 text-xs">
                  {trip.fromLocation || 'N/A'}
                </p>
              </div>
            </div>

            <div className="relative pt-0.5">
              <span className="w-2.5 h-2.5 absolute -left-3.5 top-1.5 rounded-full bg-slate-400"></span>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Drop-off</p>
                <p className="font-bold text-[var(--color-foreground,#102A43)] mt-0.5 text-xs">
                  {trip.toLocation || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Customer ───────── */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl shadow-2xs border border-[var(--color-border,#D7E3EE)] p-3.5 space-y-3">
        <h3 className="text-xs font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider flex items-center gap-1.5 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <FiUser size={14} className="text-[var(--color-primary,#0178BC)]" />
          Customer
        </h3>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Company</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm font-bold text-[var(--color-foreground,#102A43)]">
              {trip.customerName || 'N/A'}
            </p>
            {trip.customerType && (
              <span className="text-[10px] font-bold bg-sky-50 text-[var(--color-primary,#0178BC)] px-2 py-0.5 rounded-md uppercase">
                {trip.customerType}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Contact Person</p>
          <p className="text-xs font-bold text-[var(--color-foreground,#102A43)] mt-0.5">
            {trip.contactPerson || "Not Specified"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Ref / Job No</p>
          <p className="text-xs font-bold text-[var(--color-foreground,#102A43)] font-mono mt-0.5">
            {trip.customerRefJobNo || "N/A"}
          </p>
        </div>

        {trip.remarks && (
          <div className="bg-slate-50 p-2.5 rounded-lg border border-[var(--color-border,#D7E3EE)] text-xs font-medium text-[var(--color-foreground,#102A43)]">
             <span className="block text-[10px] font-bold uppercase text-[var(--color-foreground-muted,#60738E)] mb-1">Remarks</span>
             {trip.remarks}
          </div>
        )}
      </div>

      {/* ───────── Financial Summary ───────── */}
      <div className="bg-[#00A9A8] rounded-xl shadow-2xs text-white p-4 space-y-3 relative overflow-hidden flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/20 pb-2.5">
            <IoMdWallet size={16} className="text-amber-300" />
            Financial Summary
          </h3>

          <div className="space-y-2 text-xs font-bold pt-2">

            <div className="flex justify-between items-center opacity-90">
              <span className="uppercase text-[11px]">Base Amount</span>
              <span className="text-xs font-mono">{formatCurrency(trip.amount)} AED</span>
            </div>

            <div className="flex justify-between items-center opacity-90">
              <span className="uppercase text-[11px]">Token Advance</span>
              <span className="text-xs font-mono">{formatCurrency(trip.tokenAmount)} AED</span>
            </div>

            <div className="flex justify-between items-center opacity-90">
              <span className="uppercase text-[11px]">Other Charges</span>
              <span className="text-xs font-mono">{formatCurrency(trip.otherCharges)} AED</span>
            </div>

            <div className="flex justify-between items-center opacity-90">
              <span className="uppercase text-[11px]">VAT (5%)</span>
              <span className="text-xs font-mono">{formatCurrency(trip.vatAmount)} AED</span>
            </div>

          </div>
        </div>

        <div className="border-t border-white/20 pt-2">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-bold uppercase text-white/80">Total Amount</span>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black tracking-tight">{formatCurrency(trip.totalAmount)}</span>
               <span className="text-xs font-bold opacity-80">AED</span>
            </div>
          </div>

          <div className="mt-2 flex justify-between items-center text-[10px] font-bold uppercase bg-white/10 p-2 rounded-lg">
            <span className="opacity-80">Driver Commission</span>
            <span className="text-amber-300 font-mono">{formatCurrency(trip.driverCommission)} AED</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TripDetailsInfo;