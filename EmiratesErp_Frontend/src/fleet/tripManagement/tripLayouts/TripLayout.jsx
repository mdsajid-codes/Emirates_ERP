import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TripSidebar from "./TripSidebar";
import TripHeader from "./TripHeader";
import { Outlet } from "react-router-dom";

export default function TripLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background font-inter overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <TripSidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden"
            >
              <TripSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TripHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background-muted/20 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}