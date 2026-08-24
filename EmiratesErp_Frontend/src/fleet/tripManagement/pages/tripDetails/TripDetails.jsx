import { useEffect, useState } from 'react'
import TripDetailsHeader from './TripDetailsHeader'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import TripDetailsInfo from './TripDetailsInfo';
import TripStatusTimeline from './TripStatusTimeline';
import TripComplaintsPanel from '../../components/TripComplaintsPanel';
import { FiRefreshCw, FiFileText, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import UpdateTripStatusModal from '../../components/trips/UpdateTripStatusModal';
import VendorPaymentModal from '../../components/trips/VendorPaymentModal';

const TripDetails = () => {


    const [loading, setLoading] = useState(false);
    const [trip, setTrip] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const { id } = useParams();
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/fleet/trips/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setTrip(response.data);
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchTrip();
    }, []);

  return (
    <div className="w-full space-y-3 p-3 sm:p-4 font-sans select-none pb-8 animate-fade-in">
      <TripDetailsHeader trip={trip} />
      <TripDetailsInfo trip={trip} />
      <TripStatusTimeline status={trip?.tripStatus} createdAt={trip?.createdAt} />
      
      <div className="bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D7E3EE)] rounded-xl p-3.5 shadow-2xs">
        <TripComplaintsPanel trip={trip} />
      </div>

      {/* ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--color-border,#D7E3EE)]">
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            className="inline-flex items-center gap-2 bg-[var(--color-primary,#0178BC)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-2xs cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <FiRefreshCw size={14} />
            Change Status
          </button>
          
          {trip?.vendorId && trip?.tripStatus !== 'CLOSED' && (
            <button 
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-all shadow-2xs cursor-pointer"
              onClick={() => setIsVendorModalOpen(true)}
            >
              <FiCheckCircle size={14} />
              Vendor Payment
            </button>
          )}

          <button 
            className="inline-flex items-center gap-2 bg-[var(--color-card,#ffffff)] border border-[var(--color-border,#D7E3EE)] text-[var(--color-foreground,#102A43)] px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
            onClick={()=>navigate('/fleet-dashboard/invoices/new') }
          >
            <FiFileText size={14} className="text-[var(--color-primary,#0178BC)]" />
            Go to Invoice
          </button>
        </div>

        <button className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer">
          <FiTrash2 size={14} />
          Delete Trip
        </button>
      </div>

      <UpdateTripStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
        onSuccess={fetchTrip}
      />

      {isVendorModalOpen && (
        <VendorPaymentModal 
          trip={trip}
          onClose={() => setIsVendorModalOpen(false)}
          onSuccess={() => {
            setIsVendorModalOpen(false);
            fetchTrip();
          }}
        />
      )}
    </div>
  );
}

export default TripDetails