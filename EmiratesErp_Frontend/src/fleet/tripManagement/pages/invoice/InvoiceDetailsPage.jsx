import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  ArrowLeft, 
  ArrowRight,
  Download, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  CircleDollarSign,
  Truck
} from "lucide-react";
import { useLanguage } from "../../../../context/LanguageContext";
import PaymentUpdateModal from "./PaymentUpdateModal";

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const { t, isRTL } = useLanguage();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/fleet/trip-invoices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInvoice(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching invoice details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(`${API_URL}/fleet/trip-invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Error downloading PDF");
    }
  };

  const handleCancelInvoice = async () => {
    if (!window.confirm("Are you sure you want to cancel this invoice? Related trips will return to COMPLETED status.")) return;
    try {
      await axios.patch(`${API_URL}/fleet/trip-invoices/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Invoice cancelled");
      fetchInvoice();
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling invoice");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-[#E3F8EE] text-[#01A958] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01A958]"></span>
            PAID
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-rose-50 text-rose-600 border border-rose-200 inline-flex items-center gap-1.5">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 inline-flex items-center gap-1.5">
            {status || 'GENERATED'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center text-xs text-[var(--color-foreground-muted,#60738E)]">
        {isRTL ? 'جاري تحميل تفاصيل الفاتورة...' : 'Loading invoice details...'}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="w-full p-8 text-center text-xs text-rose-500 font-bold">
        Invoice details not found.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-12" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-card,#ffffff)] p-3 sm:p-4 rounded-xl border border-[var(--color-border,#D7E3EE)] shadow-2xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/fleet-dashboard/invoices')}
            className="w-8 h-8 rounded-lg border border-[var(--color-border,#D7E3EE)] flex items-center justify-center text-[var(--color-foreground,#102A43)] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground,#102A43)] tracking-tight leading-none font-mono">
                {invoice.invoiceNumber}
              </h1>
              {getStatusBadge(invoice.status)}
              {invoice.isOverdue && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 animate-pulse uppercase">
                  Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-foreground-muted,#60738E)] mt-1">
              Customer: <span className="font-semibold text-[var(--color-foreground,#102A43)]">{invoice.customerName}</span> • Date: <span className="font-semibold text-[var(--color-foreground,#102A43)] font-mono">{invoice.invoiceDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-[var(--color-primary,#0178BC)] border border-sky-200 text-xs font-bold hover:bg-[var(--color-primary,#0178BC)] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('fleet.invoiceDetails.downloadPdf') || 'Download PDF'}</span>
          </button>

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('fleet.invoiceDetails.updatePayment') || 'Update Payment'}</span>
            </button>
          )}

          {invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleCancelInvoice}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{t('fleet.invoiceDetails.cancelInvoice') || 'Cancel Invoice'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Customer & Billing */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-primary,#0178BC)] flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">CUSTOMER & ACCOUNT</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{invoice.customerName}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] truncate">{invoice.customerPhone || 'Verified Account'}</p>
          </div>
        </div>

        {/* Invoice & Due Date */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">INVOICE & DUE DATES</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 font-mono truncate">{invoice.invoiceDate}</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono">Due: {invoice.dueDate || 'N/A'}</p>
          </div>
        </div>

        {/* Trips Count */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">BILLED TRIPS</p>
            <p className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] leading-tight my-0.5 truncate">{invoice.tripCount || 1} Transport Trips</p>
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-[var(--color-card,#ffffff)] rounded-xl p-3 border border-[var(--color-border,#D7E3EE)] shadow-2xs flex items-center gap-3 h-[80px]">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase tracking-wider">GRAND TOTAL</p>
            <p className="text-xs font-extrabold text-emerald-600 leading-tight my-0.5 font-mono truncate">{invoice.grandTotal} AED</p>
            <p className="text-[10px] text-[var(--color-foreground-muted,#60738E)] font-mono truncate">VAT 5%: {invoice.vatAmount || 0} AED</p>
          </div>
        </div>

      </div>

      {/* Main Breakdown Card */}
      <div className="bg-[var(--color-card,#ffffff)] rounded-xl border border-[var(--color-border,#D7E3EE)] p-4 shadow-2xs space-y-4">
        <div className="border-b border-[var(--color-border,#E4EAF4)] pb-2.5">
          <h2 className="text-xs font-extrabold text-[var(--color-foreground,#102A43)] tracking-wider uppercase">FINANCIAL SUMMARY & TAX INVOICE SPECS</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Subtotal Amount</p>
            <p className="font-bold font-mono text-[var(--color-foreground,#102A43)] mt-1">{invoice.subtotal || 0} AED</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">VAT (5%)</p>
            <p className="font-bold font-mono text-amber-600 mt-1">+{invoice.vatAmount || 0} AED</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Advance Token Deducted</p>
            <p className="font-bold font-mono text-rose-600 mt-1">-{invoice.tokenAmount || 0} AED</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Net Grand Total</p>
            <p className="font-extrabold font-mono text-emerald-600 mt-1 text-sm">{invoice.grandTotal} AED</p>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-3 border-t border-[var(--color-border,#E4EAF4)]">
            <p className="text-[10px] font-bold text-[var(--color-foreground-muted,#60738E)] uppercase">Invoice Notes / Remarks</p>
            <p className="text-xs font-semibold text-[var(--color-foreground,#102A43)] mt-1">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment Modal Integration */}
      <PaymentUpdateModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoice={invoice}
        onSuccess={() => { fetchInvoice(); setShowPaymentModal(false); }}
      />

    </div>
  );
};

export default InvoiceDetailsPage;
