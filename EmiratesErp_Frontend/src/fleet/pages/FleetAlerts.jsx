import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Bell, ShieldCheck, AlertCircle, Clock, Car, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FleetAlerts = () => {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/fleet/compliance/expiring-documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      // Filter for EXPIRED and EXPIRING_SOON
      const activeAlerts = (response.data || []).filter(doc => 
        doc.status === 'EXPIRED' || doc.status === 'EXPIRING_SOON'
      );
      setAlerts(activeAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleAction = (alert) => {
    if (alert.entityType === 'VEHICLE') {
      navigate(`/fleet-dashboard/vehicle-details/${alert.entityId}`);
    } else {
      navigate(`/fleet-dashboard/driver-details/${alert.entityId}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Bell className="text-primary" size={32} />
            Notifications & Alerts
          </h1>
          <p className="text-gray-500 mt-1">Action items and document tracking warnings for your fleet</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white p-12 rounded-theme border border-border flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear!</h3>
          <p className="text-gray-500 max-w-sm">There are no active alerts or document tracking warnings requiring your attention right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Action Required ({alerts.length})</h3>
          {alerts.map((alert, index) => (
            <div key={index} className={`bg-white p-5 rounded-theme border ${alert.status === 'EXPIRED' ? 'border-red-200 shadow-sm shadow-red-100/50' : 'border-orange-200 shadow-sm shadow-orange-100/50'} flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all hover:-translate-y-0.5`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full mt-1 ${alert.status === 'EXPIRED' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                  {alert.status === 'EXPIRED' ? <AlertCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${alert.status === 'EXPIRED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      {alert.entityType === 'VEHICLE' ? <Car size={12} /> : <User size={12} />}
                      {alert.entityType}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 text-lg">
                    {alert.documentType.replace('_', ' ')} for {alert.entityName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {alert.status === 'EXPIRED' 
                      ? `This document expired ${Math.abs(alert.daysUntilExpiry)} days ago on ${alert.expiryDate}.` 
                      : `This document will expire in ${alert.daysUntilExpiry} days on ${alert.expiryDate}.`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleAction(alert)}
                className={`flex items-center gap-2 px-4 py-2 rounded-theme font-bold text-sm transition-colors whitespace-nowrap ${
                  alert.status === 'EXPIRED' 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
              >
                Resolve Issue <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetAlerts;
