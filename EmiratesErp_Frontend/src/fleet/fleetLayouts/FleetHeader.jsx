import { Menu, Bell, User, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/logout";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FleetHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const tenantId = localStorage.getItem('tenantId');
  const username = localStorage.getItem('username') || 'Admin';
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const fetchAlertsCount = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/compliance/expiring-documents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const activeAlerts = (response.data || []).filter(doc => 
          doc.status === 'EXPIRED' || doc.status === 'EXPIRING_SOON'
        );
        setAlertsCount(activeAlerts.length);
      } catch (error) {
        console.error("Error fetching alerts count:", error);
      }
    };
    fetchAlertsCount();
  }, [API_URL]);

  return (
    <header className="flex-shrink-0 h-16 bg-header-bg text-header-text border-b border-border shadow-sm flex items-center justify-between px-4 lg:px-6 z-30 relative">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="opacity-70 hover:opacity-100 hover:bg-black/5 p-2 rounded-theme lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-theme flex items-center justify-center text-primary font-bold border border-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="hidden md:block">
            <span className="font-bold text-lg text-header-text">Company Hub</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] bg-black/10 rounded-full font-bold uppercase tracking-wide opacity-70">Fleet</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/fleet-dashboard/alerts')}
          className="p-2 text-header-text/50 hover:text-primary transition-colors relative"
          title="Notifications & Alerts"
        >
          <Bell size={20} />
          {alertsCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-header-bg"></span>
          )}
        </button>

        <div className="w-px h-8 bg-black/10 mx-2"></div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-header-text">{username}</span>
              <span className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">Fleet Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0 border border-primary/10 shadow-sm">
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="w-px h-8 bg-black/10 hidden sm:block"></div>
          <button
            onClick={() => logout(navigate)}
            className="opacity-70 hover:opacity-100 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-black/5"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
