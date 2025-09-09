import React, { useState } from "react";
import NavigationSidebar from "@/components/NavigationSidebar";
import logo from "../assets/mseuf_logo.webp";

interface MainTemplateProps {
  initialPage?: string;
  children?: React.ReactNode;
}

const MainTemplate: React.FC<MainTemplateProps> = ({
  initialPage = "Dashboard",
  children,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    console.log("Navigate to:", page);
    // Add any additional page change logic here
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add logout logic here
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
          <h1 className="text-5xl font-medium text-gray-900">{currentPage}</h1>

          {/* University Logo Placeholder */}
          <img src={logo} alt="MSEUF Logo" width={120} height={118} />
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 " style={{ backgroundColor: "#E8E9F3" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainTemplate;
