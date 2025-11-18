import React, { useState } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/auth/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

interface NavigationSidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activePage = "Dashboard",
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(activePage);
  const { userType } = useAuth();

  const navigate = useNavigate();
  const navigationItems = [
    "Dashboard",
    "Inventory",
    "Inventory Management",
    "Stock Control",
    "Records",
    "Appointments",
  ];

  // Navigation functions for each nav item
  const navigateToDashboard = () => {
    console.log("Navigating to Dashboard");
    navigate("/dashboard");
  };

  const navigateToInventory = () => {
    console.log("Navigating to Inventory");
    navigate("/inventory");
  };

  const navigateToInventoryManagement = () => {
    console.log("Navigating to Inventory Management");
    navigate("/inventory-management");
  };

  const navigateToStockControl = () => {
    console.log("Navigating to Stock Control");
    navigate("/stock-control");
  };

  const navigateToRecords = () => {
    console.log("Navigating to Records");
    navigate("/records");
  };

  const navigateToAppointments = () => {
    console.log("Navigating to Appointments");
    navigate("/appointments");
  };

  // Map navigation items to their respective functions
  const navigationMap: Record<string, () => void> = {
    Dashboard: navigateToDashboard,
    Inventory: navigateToInventory,
    "Inventory Management": navigateToInventoryManagement,
    "Stock Control": navigateToStockControl,
    Records: navigateToRecords,
    Appointments: navigateToAppointments,
  };

  const handlePageClick = (page: string) => {
    setCurrentPage(page);

    // Call the specific navigation function
    const navigationFunction = navigationMap[page];
    if (navigationFunction) {
      navigationFunction();
    }

    // Call the parent's onPageChange if provided
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        console.log("Logout successful");
      } else {
        console.error("Logout error:", result.error);
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
    } finally {
      // Redirect regardless of result
      window.location.href = "/login";
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div
      className="w-56 md:w-64 lg:w-72 xl:w-80 flex flex-col py-6 md:py-8 px-4 md:px-6 sticky top-0 h-screen flex-shrink-0"
      style={{ backgroundColor: "#680000" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-medium">
          Navigation
        </h1>
        <button
          onClick={handleSettings}
          className="text-white hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#680000" }}
        >
          <Settings size={28} className="md:w-8 md:h-8" />
        </button>
      </div>
      <div className="flex justify-start mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-white text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium truncate">
          Mode: {userType}
        </h1>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto">
        {navigationItems.map((item) => (
          <Button
            key={item}
            onClick={() => handlePageClick(item)}
            className={`w-full py-3 md:py-4 px-4 md:px-6 rounded-xl md:rounded-2xl text-left text-base md:text-lg lg:text-xl font-medium transition-all duration-200 h-16 md:h-18 lg:h-20 ${
              currentPage === item
                ? "bg-white text-gray-800 shadow-md"
                : "text-gray-800 hover:opacity-90"
            }`}
            style={{
              backgroundColor: currentPage === item ? "#FFFFFF" : "#FBBC33",
            }}
          >
            <span className="block truncate">{item}</span>
          </Button>
        ))}
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="w-full py-3 md:py-4 px-4 md:px-6 bg-white rounded-xl md:rounded-2xl text-left text-base md:text-lg lg:text-xl font-medium text-gray-800 hover:shadow-md transition-all duration-200 mt-6 md:mt-8 h-14 md:h-15"
      >
        Logout
      </Button>
    </div>
  );
};

export default NavigationSidebar;
