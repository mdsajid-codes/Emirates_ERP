import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiDownload, FiCheckCircle, FiXCircle, FiArrowLeft, FiPrinter, FiCalendar, FiUser, FiMapPin } from "react-icons/fi";
import AppButton from "../../components/dashboard/AppButton";
import PaymentUpdateModal from "./PaymentUpdateModal";

const InvoiceDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/fleet/trip-invoices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInvoice(res.data);
      
      // Fetch trips for this invoice if not included in response
      // (The response should include tripCount, but we might want full trip details)
      // For now, assume the backend TripInvoiceResponse might need to be enhanced 
      // or we use the invoice object if it has them.
      // In my backend update, I didn't add full trips to response to keep it light.
      // But for detail view we need them.
      
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
      link.setAttribute('download', `invoice-${invoice.invoiceNumber}.pdf`);
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

  if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Invoice {invoice.invoiceNumber}
              <span className={`text-xs px-2 py-1 rounded-full uppercase ${
                invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                invoice.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {invoice.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500">Generated on {invoice.invoiceDate}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiPrinter size={16} /> Print / PDF
          </button>
          
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <>
              <button 
                onClick={handleCancelInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <FiXCircle size={16} /> Cancel
              </button>
              <AppButton onClick={() => setShowPaymentModal(true)} icon={<FiCheckCircle />}>
                Record Payment
              </AppButton>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Dates Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FiUser size={18} /></div>
                <div>
                  <p className="font-bold text-gray-800">{invoice.customerName}</p>
                  <p className="text-sm text-gray-500">ID: #{invoice.customerId}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Important Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-gray-600">Invoice Date:</span>
                  <span className="font-medium text-gray-800 ml-auto">{invoice.invoiceDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCalendar className="text-red-400" />
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-bold text-red-600 ml-auto">{invoice.dueDate || "Not Set"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info (If Paid) */}
          {invoice.status === 'PAID' && (
             <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4">Payment Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-green-600 uppercase">Received Date</p>
                    <p className="font-bold text-green-800">{invoice.paymentReceivedDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 uppercase">Method</p>
                    <p className="font-bold text-green-800">{invoice.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 uppercase">Reference</p>
                    <p className="font-bold text-green-800">{invoice.chequeNumber || invoice.otherReference || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 uppercase">Notes</p>
                    <p className="text-xs text-green-800 truncate">{invoice.notes || "No notes"}</p>
                  </div>
                </div>
             </div>
          )}

          {/* Trips Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Invoiced Trips ({invoice.tripCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Trip No</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-[10px) font-bold text-gray-400 uppercase">Route</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Other</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">VAT</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {invoice.trips && invoice.trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">TRP-{trip.tripNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{trip.tripDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                        {trip.fromLocation} → {trip.toLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">{trip.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">{trip.otherCharges?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">{trip.vatAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-primary">{trip.totalAmount?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#0A1A3E] text-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold mb-6 text-blue-200">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span>AED {invoice.subTotalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Token Deductions</span>
                <span className="text-red-300">- AED {invoice.totalTokenAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Other Charges</span>
                <span>AED {invoice.totalOtherCharges?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">VAT (5%)</span>
                <span>AED {invoice.totalVatAmount?.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-700 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase mb-1">Grand Total</p>
                  <p className="text-2xl font-bold text-yellow-400">AED {invoice.grandTotal?.toFixed(2)}</p>
                </div>
                {invoice.status === 'PAID' && <div className="bg-green-500 p-1 rounded-full"><FiCheckCircle size={20} /></div>}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Internal Notes</h3>
             <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes || "No additional notes provided for this invoice."}</p>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentUpdateModal 
          invoice={invoice} 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchInvoice();
          }}
        />
      )}
    </div>
  );
};

export default InvoiceDetailView;
