import React, { useState, useEffect } from 'react';
import { Menu, Search, ChevronDown, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { logout } from '../../utils/logout';
import { useLanguage } from '../../context/LanguageContext';

export default function FleetHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const [alertsCount, setAlertsCount] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchAlertsCount = async () => {
      try {
        const response = await axios.get(`${API_URL}/fleet/compliance/expiring-documents`, {
          headers: { Authorization: `Bearer ${token}` }
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

  const handleLogout = () => logout(navigate);

  return (
    <header className={`h-[64px] bg-white border-b border-[#DBE5F3] fixed top-0 ${isRTL ? 'right-0 lg:right-[80px] left-0' : 'left-0 lg:left-[80px] right-0'} z-30 flex items-center justify-between px-4 lg:px-6`}>
      {/* Left: Mobile menu button & Search input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-[#18233B] hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full max-w-[260px]">
          <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#607089]`}>
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder={t('search.placeholder') || "Search anything..."}
            className={`w-full h-[38px] ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-xs bg-white border border-[#E2E8F0] rounded-[8px] text-[#18233B] placeholder-[#94A3B8] focus:outline-none focus:border-[#00A9A8] transition-colors`}
          />
        </div>
      </div>

      {/* Right tools: Language dropdown, Notification bell, User avatar & text, Logout */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#18233B] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{language === 'ar' ? 'العربية' : 'English'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#607089]" />
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-1 w-32 bg-white rounded-lg shadow-lg border border-[#E2E8F0] py-1 z-50`}
              >
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${language === 'en' ? 'font-bold text-[#00A9A8]' : 'text-[#18233B]'}`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 ${language === 'ar' ? 'font-bold text-[#00A9A8]' : 'text-[#18233B]'}`}
                >
                  العربية
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/fleet-dashboard/alerts')}
          className="p-2 text-[#607089] hover:text-[#18233B] hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Notifications & Alerts"
        >
          <Bell className="h-4.5 w-4.5" />
          {alertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </button>

        <div className="w-px h-6 bg-[#E2E8F0] mx-1"></div>

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EAF8FF] text-[#00A9A8] font-bold flex items-center justify-center text-xs border border-[#B3E5F4]">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-[#18233B]">{username}</span>
            <span className="text-[10px] text-[#607089]">Fleet Administrator</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-[#607089] hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 ml-1"
          title="Logout"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </header>
  );
}
