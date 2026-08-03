import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FleetSidebar from "./FleetSidebar";
import FleetHeader from "./FleetHeader";
import { Outlet } from "react-router-dom";

export default function FleetLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isDesktopCollapsed || isHovered;

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <FleetHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col bg-sidebar-bg text-sidebar-text border-r border-border overflow-y-auto no-scrollbar transition-all duration-300 ${isExpanded ? 'w-[220px]' : 'w-[68px]'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <FleetSidebar
            isCollapsedMode={!isExpanded}
            isDesktopCollapsed={isDesktopCollapsed}
            setIsDesktopCollapsed={setIsDesktopCollapsed}
          />
        </aside>

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
                className="fixed top-0 left-0 h-full w-64 z-50 bg-sidebar-bg lg:hidden overflow-y-auto no-scrollbar"
              >
                <FleetSidebar onClose={() => setSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background-muted/20 no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
