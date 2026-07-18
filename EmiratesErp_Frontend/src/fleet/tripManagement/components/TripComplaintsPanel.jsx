import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Calendar, 
  User, 
  Truck, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { complaintApi } from '../../services/complaintApi';
import ComplaintForm from '../../pages/ComplaintForm';

const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  ESCALATED: 'bg-red-100 text-red-700'
};

const RISK_COLORS = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-purple-100 text-purple-700 shadow-sm animate-pulse'
};

export default function TripComplaintsPanel({ trip }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await complaintApi.getAllComplaints({ tripId: trip.id });
      setComplaints(data.content || []);
    } catch (error) {
      console.error('Error fetching trip complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [trip?.id]);

  const handleReportIncident = () => {
    // Pre-populate form data for this trip
    setSelectedComplaint({
      tripId: trip.id,
      vehicleId: trip.vehicle?.id || '',
      driverId: trip.driver?.id || '',
      reportedDate: new Date().toISOString().slice(0, 16),
      reportedByType: 'STAFF',
      riskLevel: 'MEDIUM',
      status: 'OPEN'
    });
    setIsFormOpen(true);
  };

  if (!trip) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <AlertTriangle size={20} className="text-primary" />
          <h3 className="text-lg font-bold">Incidents & Complaints</h3>
        </div>
        <button
          onClick={handleReportIncident}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-theme text-sm font-bold transition-all"
        >
          <Plus size={16} />
          Report Incident
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-muted/30 border border-dashed border-border rounded-theme p-8 text-center">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <MessageSquare size={32} />
            <p className="text-sm font-medium">No incidents reported for this trip</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="bg-card border border-border rounded-theme p-4 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${RISK_COLORS[complaint.riskLevel]}`}>
                  {complaint.riskLevel}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[complaint.status]}`}>
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
              
              <h4 className="font-bold text-sm mb-1">{complaint.type}: {complaint.category}</h4>
              <p className="text-xs text-foreground-muted line-clamp-2 mb-3">{complaint.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                     <Calendar size={12} />
                     {new Date(complaint.reportedDate).toLocaleDateString()}
                   </div>
                   {complaint.assignedToName && (
                     <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                       <User size={12} />
                       {complaint.assignedToName}
                     </div>
                   )}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setIsFormOpen(true);
                  }}
                  className="p-1.5 hover:bg-muted rounded-theme text-foreground-muted group-hover:text-primary transition-colors"
                  title="View Details"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ComplaintForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchComplaints}
        initialData={selectedComplaint}
      />
    </div>
  );
}
