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
    <div className="p-6 space-y-8 bg-background min-h-screen animate-fade-in">
      <TripDetailsHeader trip={trip} />
      <TripDetailsInfo trip={trip} />
      <TripStatusTimeline status={trip?.tripStatus} createdAt={trip?.createdAt} />
      
      <div className="bg-card border border-border rounded-theme p-6 shadow-sm">
        <TripComplaintsPanel trip={trip} />
      </div>

      {/* ACTIONS BAR */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            <FiRefreshCw size={16} />
            Change Status
          </button>
          
          {trip?.vendorId && trip?.tripStatus !== 'CLOSED' && (
            <button 
              className="flex items-center gap-3 bg-warning text-white px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md shadow-warning/20 active:scale-95"
              onClick={() => setIsVendorModalOpen(true)}
            >
              <FiCheckCircle size={16} />
              Vendor Payment
            </button>
          )}

          <button 
            className="flex items-center gap-3 bg-card border border-border text-foreground px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:bg-background-muted transition-all active:scale-95 shadow-sm"
            onClick={()=>navigate('/fleet-dashboard/invoices/new') }
          >
            <FiFileText size={16} className="text-primary" />
            Go to Invoice
          </button>
        </div>

        <button className="flex items-center gap-3 bg-error/10 text-error border border-error/20 px-6 py-2.5 rounded-theme text-xs font-black uppercase tracking-widest hover:bg-error/20 transition-all active:scale-95 shadow-sm">
          <FiTrash2 size={16} />
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