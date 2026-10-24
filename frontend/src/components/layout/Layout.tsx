import { Outlet, useLocation } from "react-router";
import { useState } from "react";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/library")
    ? "Lecture library"
    : location.pathname.startsWith("/settings")
      ? "Settings"
      : "Course assistant";

  return (
    <div className="flex h-dvh overflow-hidden bg-background font-sans text-text-primary antialiased">
      {sidebarOpen && <Sidebar />}

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
