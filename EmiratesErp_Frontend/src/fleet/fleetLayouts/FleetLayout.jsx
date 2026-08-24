import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import FleetSidebar from './FleetSidebar';
import FleetHeader from './FleetHeader';
import { useLanguage } from '../../context/LanguageContext';

export default function FleetLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRTL } = useLanguage();

  const [companyInfo, setCompanyInfo] = useState({ name: 'Company Hub', logoPath: null, logoBlob: null });
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const cachedName = sessionStorage.getItem('company_name');
    const cachedLogo = sessionStorage.getItem('company_logo');

    if (cachedName) {
      setCompanyInfo({ name: cachedName, logoPath: null, logoBlob: cachedLogo || null });
      return;
    }

    const fetchCompanyInfo = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_URL}/company-info`, { headers });
        const realName = res.data.companyName || 'Company Hub';
        sessionStorage.setItem('company_name', realName);

        if (res.data.logoPath) {
          setCompanyInfo({ name: realName, logoPath: res.data.logoPath, logoBlob: cachedLogo || null });
        }
      } catch (err) {
        console.error('Failed to fetch company info', err);
      }
    };
    fetchCompanyInfo();
  }, [API_URL]);

  const displayLogo = companyInfo.logoBlob || '/icon.svg';

  return (
    <div className="h-screen bg-[#F7FAFF] flex flex-col font-sans overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <FleetHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar and Main Content Area */}
      <div className="flex pt-[64px] h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block fixed ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 z-40 w-[80px]`}>
          <FleetSidebar companyLogo={displayLogo} />
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 ${isRTL ? 'lg:mr-[80px]' : 'lg:ml-[80px]'} h-[calc(100vh-64px)] overflow-y-auto no-scrollbar`}>
          <Outlet />
        </main>

        {/* Mobile sidebar drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: isRTL ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: isRTL ? '100%' : '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-[80px] z-50 bg-[#003E5B] shadow-2xl lg:hidden`}
              >
                <FleetSidebar companyLogo={displayLogo} onLinkClick={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
