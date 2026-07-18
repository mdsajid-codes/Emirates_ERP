import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiFileText } from "react-icons/fi";
import { toast } from "react-toastify";

const CreateInvoice = () => {
  const [customers, setCustomers] = useState([]);
  const [trips, setTrips] = useState([]);
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const completedTrips = trips.filter(
    (trip) => trip.tripStatus?.trim().toLowerCase() === "completed"
  );

  // ===============================
  // FETCH CUSTOMERS
  // ===============================
    const fetchCustomers = async () => {
      try {
        const CustomerResponse = await axios.get(`${API_URL}/fleet/trip-customers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Fetched Customers:", CustomerResponse.data);
        setCustomers(CustomerResponse.data);
      } catch (error) { 
        console.error("Error fetching customers:", error);
      }
    };
    useEffect(()=>{
      fetchCustomers();
    }, []);

  // ===============================
  // FETCH COMPLETED TRIPS BY CUSTOMER
  // ===============================
  const fetchTripsByCustomer = async (customerId) => {
    try {
      const res = await axios.get(
        `${API_URL}/fleet/trips/by-customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Fetched Trips for Customer:", res.data);
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // HANDLE CUSTOMER CHANGE
  // ===============================
  const handleCustomerChange = (e) => {
    const id = e.target.value;
    setSelectedCustomer(id);
    setSelectedTrips([]);
    if (id) fetchTripsByCustomer(id);
  };

  // ===============================
  // HANDLE TRIP SELECT
  // ===============================
  const handleTripSelect = (trip) => {
    const exists = selectedTrips.find((t) => t.id === trip.id);

    if (exists) {
      setSelectedTrips(selectedTrips.filter((t) => t.id !== trip.id));
    } else {
      setSelectedTrips([...selectedTrips, trip]);
    }
  };

  // ===============================
  // CALCULATE TOTALS
  // ===============================
  const subtotal = selectedTrips.reduce((acc, trip) => acc + (trip.amount + (trip.otherCharges || 0)), 0);
  const tokenAmount = selectedTrips.reduce((acc, trip) => acc + (trip.tokenAmount || 0), 0);
  const vat = subtotal * 0.05; // 5% VAT
  const grandTotal = subtotal + vat - tokenAmount;

  // ===============================
  // CREATE INVOICE
  // ===============================
  const handleGenerateInvoice = async () => {
    if (!selectedCustomer || selectedTrips.length === 0 || !invoiceDate) {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/fleet/trip-invoices`, 
        {
          customerId: selectedCustomer,
          tripIds: selectedTrips.map((t) => t.id),
          invoiceDate,
          dueDate,
          notes,
        }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Invoice Created Successfully!");
      navigate(`/fleet/trip-management/invoices/${response.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>

      <div className="grid grid-cols-3 gap-6">

        {/* LEFT SECTION */}
        <div className="col-span-2 space-y-6">

          {/* SECTION 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Select Customer</h3>

            <select
              value={selectedCustomer}
              onChange={handleCustomerChange}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Choose Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">
              Select Trips (Completed Only)
            </h3>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-t-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div className="col-span-1"></div>
              <div className="col-span-2">Trip No / Date</div>
              <div className="col-span-3">Route</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Other</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
 
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {completedTrips.length > 0 ? completedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`grid grid-cols-12 gap-4 items-center border p-4 rounded-lg transition-all ${
                    selectedTrips.some((t) => t.id === trip.id) 
                    ? 'border-primary bg-blue-50/30' 
                    : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary cursor-pointer"
                      checked={selectedTrips.some((t) => t.id === trip.id)}
                      onChange={() => handleTripSelect(trip)}
                    />
                  </div>

                  <div className="col-span-2">
                    <p className="font-bold text-sm text-gray-800">TRP-{trip.tripNo || trip.id}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{trip.tripDate}</p>
                  </div>

                  <div className="col-span-3 text-xs text-gray-600 font-medium">
                    {trip.fromLocation} → {trip.toLocation}
                  </div>

                  <div className="col-span-2 text-right text-sm text-gray-700">
                    {trip.amount.toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right text-sm text-gray-700">
                    {(trip.otherCharges || 0).toFixed(2)}
                  </div>

                  <div className="col-span-2 text-right font-bold text-sm text-primary">
                    {(trip.amount + (trip.otherCharges || 0)).toFixed(2)}
                  </div>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                  No completed trips
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Invoice Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase text-red-400">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-red-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none"
                />
              </div>

              <textarea
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-2 border rounded-lg p-3"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SUMMARY PANEL */}
        <div className="bg-[#0A1A3E] text-white p-6 rounded-xl shadow-lg h-fit">

          <h3 className="font-semibold mb-6">Invoice Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>AED {subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Token Amount</span>
              <span>AED {tokenAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>VAT (5%)</span>
              <span>AED {vat.toFixed(2)}</span>
            </div>

            <hr className="border-gray-500" />

            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span>AED {grandTotal.toFixed(2)}</span>
            </div>
          </div>      

          <button
            onClick={handleGenerateInvoice}
            disabled={loading}
            className="mt-6 w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500"
          >
            {loading ? "Generating..." : "Generate Invoice"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateInvoice;
