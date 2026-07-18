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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

      {/* ───────── Route & Driver ───────── */}
      <div className="bg-card rounded-theme shadow-sm border border-border p-6 space-y-6">
        <h3 className="text-xs font-black text-foreground-muted uppercase tracking-widest flex items-center gap-2 border-b border-border pb-4">
          <FiTruck size={16} className="text-primary" />
          Route & Driver
        </h3>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Driver</p>
          <p className="text-lg font-black text-foreground tracking-tight">{trip.driverName}</p>
        </div>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Container No</p>
          <p className="text-base font-bold text-foreground">
            {trip.containerNumber}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mb-4 opacity-60">Route Timeline</p>

          <div className="space-y-4 text-sm relative before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            <div className="flex items-start gap-4 relative">
              <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-primary ring-4 ring-primary/10 z-10"></span>
              <div>
                <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Pickup</p>
                <p className="font-bold text-foreground">
                  {trip.fromLocation}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative">
              <span className="w-2.5 h-2.5 mt-1.5 rounded-full bg-foreground/20 z-10"></span>
              <div>
                <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Drop-off</p>
                <p className="font-bold text-foreground">
                  {trip.toLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Customer ───────── */}
      <div className="bg-card rounded-theme shadow-sm border border-border p-6 space-y-6">
        <h3 className="text-xs font-black text-foreground-muted uppercase tracking-widest flex items-center gap-2 border-b border-border pb-4">
          <FiUser size={16} className="text-primary" />
          Customer
        </h3>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Company</p>
          <div className="flex items-center gap-3">
            <p className="text-lg font-black text-foreground tracking-tight">
              {trip.customerName}
            </p>
            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
              {trip.customerType}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Contact Person</p>
          <p className="text-base font-bold text-foreground">
            {trip.contactPerson || "Not Specified"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest opacity-60">Ref / Job No</p>
          <p className="text-base font-bold text-foreground">
            {trip.customerRefJobNo || "N/A"}
          </p>
        </div>

        {trip.remarks && (
          <div className="bg-background-muted p-4 rounded-theme border border-border/50 text-xs font-bold text-foreground-muted leading-relaxed">
             <span className="block text-[10px] uppercase tracking-widest mb-2 opacity-50">Remarks</span>
             {trip.remarks}
          </div>
        )}
      </div>

      {/* ───────── Financial Summary ───────── */}
      <div className="bg-primary rounded-theme shadow-xl text-primary-foreground p-8 space-y-8 relative overflow-hidden group">
        
        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110" />

        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/20 pb-4">
            <IoMdWallet size={20} className="text-warning" />
            Financial Summary
        </h3>

        <div className="space-y-4 text-xs font-bold">

          <div className="flex justify-between items-center opacity-80">
            <span className="uppercase tracking-widest">Base Amount</span>
            <span className="text-sm">{formatCurrency(trip.amount)} AED</span>
          </div>

          <div className="flex justify-between items-center opacity-80">
            <span className="uppercase tracking-widest">Token Advance</span>
            <span className="text-sm">{formatCurrency(trip.tokenAmount)} AED</span>
          </div>

          <div className="flex justify-between items-center opacity-80">
            <span className="uppercase tracking-widest">Other Charges</span>
            <span className="text-sm">{formatCurrency(trip.otherCharges)} AED</span>
          </div>

          <div className="flex justify-between items-center opacity-80">
            <span className="uppercase tracking-widest">VAT (5%)</span>
            <span className="text-sm">{formatCurrency(trip.vatAmount)} AED</span>
          </div>

          <div className="border-t border-white/30 pt-6 flex flex-col items-end gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Amount</span>
            <div className="flex items-baseline gap-2">
               <span className="text-4xl font-black tracking-tight">{formatCurrency(trip.totalAmount)}</span>
               <span className="text-sm opacity-60 font-black">AED</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest bg-white/10 p-3 rounded-theme">
            <span className="opacity-70">Driver Commission</span>
            <span className="text-warning">{formatCurrency(trip.driverCommission)} AED</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TripDetailsInfo;