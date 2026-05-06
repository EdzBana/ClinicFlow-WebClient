import React, { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import logo from "../assets/mseuf_logo.webp";
import { useMatches } from "react-router-dom";
import { Toaster } from "./ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface MainTemplateProps {
  children?: React.ReactNode;
}

interface RouteHandle {
  title?: string;
}

const MainTemplate: React.FC<MainTemplateProps> = ({ children }) => {
  const matches = useMatches();
  const currentMatch = matches.find((m) => (m.handle as RouteHandle)?.title);
  const currentTitle =
    (currentMatch?.handle as RouteHandle)?.title ?? "Dashboard";

  // Check if screen is desktop size (xl breakpoint = 1280px)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.title = `${currentTitle} | Health and Dental System`;
  }, [currentTitle]);

  return (
    <SidebarProvider defaultOpen={isDesktop}>
      <div
        className="flex min-h-screen w-full overflow-hidden"
        style={{ backgroundColor: "#E8E9F3" }}
      >
        <Toaster position="top-center" richColors closeButton />

        {/* Sidebar - Drawer on mobile/tablet, Fixed on desktop (xl and up) */}
        <div className="xl:fixed xl:inset-y-0 xl:left-0 xl:z-40">
          <AppSidebar />
        </div>

        {/* Main Content Area - Add left margin on desktop to account for fixed sidebar */}
        <div className="flex-1 flex flex-col min-w-0 xl:ml-64 h-screen overflow-hidden">
          {/* Header with Dynamic Page Title and Logo */}
          <header
            className="shadow-sm p-4 md:p-6 lg:p-8 flex justify-between items-center gap-4 flex-shrink-0"
            style={{ backgroundColor: "#E8E9F3" }}
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 truncate">
                {currentTitle}
              </h1>
            </div>
            {/* University Logo */}
            <img
              src={logo}
              alt="MSEUF Logo"
              className="w-16 h-auto md:w-20 lg:w-24 xl:w-28 flex-shrink-0"
            />
          </header>

          {/* Content Area - Scrollable */}
          <main
            className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto"
            style={{ backgroundColor: "#E8E9F3" }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainTemplate;
