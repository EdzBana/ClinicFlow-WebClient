import React, { useEffect, useState } from "react";
import NavigationSidebar from "@/components/NavigationSidebar";
import logo from "../assets/mseuf_logo.webp";
import { useMatches } from "react-router-dom";

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

  const [currentPage, setCurrentPage] = useState(currentTitle);

  useEffect(() => {
    setCurrentPage(currentTitle);
    document.title = `${currentTitle} | Health and Dental System`;
  }, [currentTitle]);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    console.log("Navigate to:", page);
  };

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#E8E9F3" }}>
      {/* Sidebar Navigation */}
      <NavigationSidebar
        activePage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Dynamic Page Title and Logo */}
        <header
          className="shadow-sm p-4 md:p-6 lg:p-8 flex justify-between items-center gap-4"
          style={{ backgroundColor: "#E8E9F3" }}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 truncate">
            {currentPage}
          </h1>

          {/* University Logo */}
          <img
            src={logo}
            alt="MSEUF Logo"
            className="w-16 h-auto md:w-20 lg:w-24 xl:w-28 flex-shrink-0"
          />
        </header>

        {/* Content Area */}
        <main
          className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto"
          style={{ backgroundColor: "#E8E9F3" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainTemplate;
