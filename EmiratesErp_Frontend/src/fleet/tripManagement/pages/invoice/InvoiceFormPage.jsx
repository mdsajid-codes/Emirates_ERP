import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X, Save, FileText, Calendar, User, CheckCircle2, Circle, Truck, AlertCircle, CircleDollarSign } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../../../../context/LanguageContext";

const InvoiceFormPage = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();

  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const completedTrips = trips.filter(
    (trip) => trip.tripStatus?.trim().toLowerCase() === "completed"
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-customers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCustomers(response.data || []);
    } catch (error) { 
      console.error("Error fetching customers:", error);
    }
  };

  const fetchTripsByCustomer = async (customerId) => {
    try {
      const res = await axios.get(
        `${API_URL}/fleet/trips/by-customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTrips(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    setSelectedCustomer(id);
    setSelectedTrips([]);
    if (id) fetchTripsByCustomer(id);
  };

  const handleTripSelect = (trip) => {
    const exists = selectedTrips.find((t) => t.id === trip.id);
    if (exists) {
      setSelectedTrips(selectedTrips.filter((t) => t.id !== trip.id));
    } else {
      setSelectedTrips([...selectedTrips, trip]);
    }
  };

  // Calculations
  const subtotal = selectedTrips.reduce((acc, trip) => acc + (trip.amount + (trip.otherCharges || 0)), 0);
  const tokenAmount = selectedTrips.reduce((acc, trip) => acc + (trip.tokenAmount || 0), 0);
  const vat = subtotal * 0.05; // 5% VAT
  const grandTotal = subtotal + vat - tokenAmount;

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || selectedTrips.length === 0 || !invoiceDate) {
      toast.warning("Please select Customer, Invoice Date, and at least 1 completed trip");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: parseInt(selectedCustomer),
        tripIds: selectedTrips.map((t) => t.id),
        invoiceDate,
        dueDate: dueDate || null,
        notes: notes || null,
      };

      await axios.post(`${API_URL}/fleet/trip-invoices`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Invoice generated successfully");
      navigate("/fleet-dashboard/invoices");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-tight">
            {t('fleet.invoiceForm.addTitle') || 'Create Customer Invoice'}
          </h1>
          <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-0.5">
            {t('fleet.invoiceForm.subtitle') || 'Select customer completed trips, calculate 5% VAT, and generate tax invoice'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fleet-dashboard/invoices')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] text-[var(--color-foreground,#102A43)] text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <X className="w-4 h-4 text-[var(--color-foreground,#102A43)]" />
          <span>{t('fleet.driverForm.cancel') || 'Cancel'}</span>
        </button>
      </div>

      <form onSubmit={handleGenerateInvoice} className="space-y-3">
        
        {/* Row 1: Section 1 & Section 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          
          {/* Section 1: Customer Selection */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Customer & Account Details</h2>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Target Customer *</label>
                <select
                  value={selectedCustomer}
                  onChange={handleCustomerChange}
                  required
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none cursor-pointer"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactPerson || 'Account'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Billing Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional billing instructions or PO reference numbers..."
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Invoice Schedule Dates */}
          <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Invoice Schedule & Due Terms</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Invoice Date *</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-foreground,#102A43)] mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#C9D8E5)] rounded-lg text-xs text-[var(--color-foreground,#102A43)] outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Section 3 - Unbilled Completed Trips Selection */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-3.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[var(--color-primary,#0178BC)] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-foreground,#102A43)]">Select Completed Customer Trips</h2>
            </div>
            
            <span className="text-[11px] font-bold text-[var(--color-primary,#0178BC)] bg-sky-50 px-2.5 py-0.5 rounded-md">
              {selectedTrips.length} Selected
            </span>
          </div>

          {!selectedCustomer ? (
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] italic py-3 text-center">
              Please select a customer first to load available completed trips.
            </p>
          ) : completedTrips.length === 0 ? (
            <p className="text-xs text-rose-500 font-bold py-3 text-center">
              No unbilled completed trips found for this customer.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {completedTrips.map((trip) => {
                const isSelected = selectedTrips.some((t) => t.id === trip.id);
                return (
                  <div
                    key={trip.id}
                    onClick={() => handleTripSelect(trip)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-sky-50/80 border-[var(--color-primary,#0178BC)] ring-1 ring-[var(--color-primary,#0178BC)]"
                        : "bg-white border-[var(--color-border,#D7E3EE)] hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--color-foreground,#102A43)] font-mono">TRIP #{trip.tripNo}</span>
                        <span className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">{trip.date}</span>
                      </div>
                      <p className="text-xs text-[var(--color-foreground,#102A43)] font-semibold">
                        {trip.fromLocation} → {trip.toLocation}
                      </p>
                      <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">
                        Freight: {trip.amount} AED {trip.otherCharges ? `+ Charges: ${trip.otherCharges} AED` : ''} {trip.tokenAmount ? `- Token: ${trip.tokenAmount} AED` : ''}
                      </p>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-primary,#0178BC)] fill-sky-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Financial Summary Box */}
        {selectedTrips.length > 0 && (
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400">FINANCIAL SUMMARY & TAX BREAKDOWN</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono border-t border-slate-800 pt-3">
              <div>
                <p className="text-[10px] text-slate-400">Subtotal</p>
                <p className="font-bold text-sm text-white">{subtotal.toFixed(2)} AED</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">VAT (5%)</p>
                <p className="font-bold text-sm text-amber-400">+{vat.toFixed(2)} AED</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">Token Advance Paid</p>
                <p className="font-bold text-sm text-rose-400">-{tokenAmount.toFixed(2)} AED</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400">Grand Total Payable</p>
                <p className="font-extrabold text-base text-emerald-400">{grandTotal.toFixed(2)} AED</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => navigate('/fleet-dashboard/invoices')}
            className="px-5 py-2 border border-[var(--color-border,#D7E3EE)] bg-[var(--color-card,#ffffff)] rounded-xl text-xs font-bold text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            {t('fleet.driverForm.cancel') || 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={submitting || selectedTrips.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#00A9A8] hover:bg-[#009190] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? 'Generating...' : 'Generate Tax Invoice'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default InvoiceFormPage;
