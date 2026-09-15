import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ArrowLeft, Search, Filter, Calendar, User, 
  CheckCircle2, PhoneCall, Mail, Calendar as CalendarIcon, 
  FileText, Clock, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const CrmRecentActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/crm/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period: 'ALL_TIME' }
      });
      const data = response.data || {};
      const list = data.recentActivities || [];
      setActivities(list);
    } catch (err) {
      console.error('Failed to fetch recent activities:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'TASK':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'CALL':
      case 'CALL_LOG':
        return <PhoneCall className="w-5 h-5 text-blue-500" />;
      case 'EMAIL':
        return <Mail className="w-5 h-5 text-amber-500" />;
      case 'EVENT':
      case 'MEETING':
        return <CalendarIcon className="w-5 h-5 text-purple-500" />;
      case 'LEAD':
        return <User className="w-5 h-5 text-teal-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch = 
      !searchTerm ||
      act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.performedBy?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || act.type?.toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/crm-dashboard')}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-[#00A3A6]" />
              <h1 className="text-2xl font-bold text-slate-800">Audit Trail & Activity Log</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive log of interactions, task completions, emails, calls, and system events
            </p>
          </div>
        </div>

        <button
          onClick={fetchActivities}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, entity, user or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A3A6] text-sm"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          {['ALL', 'TASK', 'CALL', 'EMAIL', 'EVENT', 'LEAD'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                typeFilter === type
                  ? 'bg-[#00A3A6] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00A3A6] animate-spin mx-auto" />
            <p className="text-slate-500 font-medium text-sm">Loading activity records...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-slate-700 font-semibold">{error}</p>
            <button
              onClick={fetchActivities}
              className="px-4 py-2 bg-[#00A3A6] text-white rounded-xl text-xs font-semibold shadow hover:bg-[#008B8E]"
            >
              Retry
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-medium">No activity records found</p>
            <p className="text-xs text-slate-400">Try refining your search query or filter selection.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act, idx) => (
              <div
                key={act.id || idx}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-slate-100 rounded-xl mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {act.type || 'SYSTEM'}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {act.title || act.description || 'Activity logged'}
                    </h3>
                    {act.description && act.title && (
                      <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">
                        {act.description}
                      </p>
                    )}
                    {act.entityName && (
                      <div className="inline-flex items-center space-x-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs mt-1">
                        <span className="font-medium">Related to:</span>
                        <span className="font-semibold text-slate-800">{act.entityName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-500 self-end sm:self-center">
                  {act.performedBy && (
                    <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{act.performedBy}</span>
                    </div>
                  )}
                  {act.leadId && (
                    <button
                      onClick={() => navigate(`/crm-lead/leadinfo/${act.leadId}`)}
                      className="p-1.5 text-slate-400 hover:text-[#00A3A6] hover:bg-slate-100 rounded-lg transition-all"
                      title="View Lead"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmRecentActivityPage;
