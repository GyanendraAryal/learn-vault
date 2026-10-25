import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches,
  );
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/library")
    ? "Lecture library"
    : location.pathname.startsWith("/settings")
      ? "Settings"
      : "Course assistant";

  useEffect(() => {
    const desktopLayout = window.matchMedia("(min-width: 768px)");
    const syncSidebar = () => setSidebarOpen(desktopLayout.matches);

    desktopLayout.addEventListener("change", syncSidebar);
    return () => desktopLayout.removeEventListener("change", syncSidebar);
  }, []);

  const closeSidebarOnMobile = () => {
    if (!window.matchMedia("(min-width: 768px)").matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-background font-sans text-text-primary antialiased">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-shadow/30 md:hidden"
          />
          <Sidebar onNavigate={closeSidebarOnMobile} />
        </>
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          title={pageTitle}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />

        <Outlet />
      </main>
    </div>
  );
}
