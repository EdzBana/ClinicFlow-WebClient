import React, { useEffect, useState } from "react";
import NavigationSidebar from "@/components/NavigationSidebar";
import logo from "../assets/mseuf_logo.webp";
import { useMatches } from "react-router-dom";

interface MainTemplateProps {
  children?: React.ReactNode;
}

const MainTemplate: React.FC<MainTemplateProps> = ({ children }) => {
  const matches = useMatches();
  const currentMatch = matches.find((m) => m.handle?.title);
  const currentTitle = currentMatch?.handle?.title || "Dashboard";

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
      <div className="flex-1 flex flex-col">
        {/* Header with Dynamic Page Title and Logo */}
        <header
          className="shadow-sm p-6 flex justify-between items-center"
          style={{ backgroundColor: "#E8E9F3" }}
        >
          <h1 className="text-5xl font-bold text-gray-900">{currentPage}</h1>

          {/* University Logo */}
          <img src={logo} alt="MSEUF Logo" width={120} height={118} />
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8" style={{ backgroundColor: "#E8E9F3" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainTemplate;
