import React, { useEffect, useState } from "react";
import logo from "../../assets/mseuf_logo.webp";
import { useMatches } from "react-router-dom";

interface PageTemplateProps {
  pageTitle?: string;
  pageSubtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

interface RouteHandle {
  title?: string;
}

const StudentPageTemplate: React.FC<PageTemplateProps> = ({
  pageTitle,
  pageSubtitle,
  children,
  className = "",
}) => {
  // 🔹 Detect current route using useMatches()
  const matches = useMatches();
  const currentMatch = matches.find((m) => (m.handle as RouteHandle)?.title);
  const currentTitle =
    (currentMatch?.handle as RouteHandle)?.title ?? pageTitle ?? "Dashboard";

  // 🔹 Set page title dynamically
  const [currentPage, setCurrentPage] = useState(currentTitle);

  useEffect(() => {
    setCurrentPage(currentTitle);
    document.title = `${currentTitle} | Health and Dental System`;
  }, [currentTitle]);

  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{ backgroundColor: "#E8E9F3" }}
    >
      {/* Header Section */}
      <div className="flex flex-col items-center md:items-start p-4 md:p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-4 self-start">
          <img
            src={logo}
            alt="MSEUF Logo"
            className="w-14 h-auto md:w-[180px]"
          />
          <div className="hidden md:block">
            <h1
              className="text-2xl md:text-4xl font-medium mb-1"
              style={{ color: "#680000" }}
            >
              Manuel S. Enverga
            </h1>
            <h2
              className="text-2xl md:text-4xl font-medium"
              style={{ color: "#680000" }}
            >
              University Foundation
            </h2>
          </div>
        </div>

        {/* Page Title/Subtitle */}
        {(currentPage || pageSubtitle) && (
          <div className="mt-4 text-center md:text-left w-full">
            {currentPage && (
              <h1
                className="text-xl md:text-5xl font-medium"
                style={{ color: "#680000" }}
              >
                {currentPage}
              </h1>
            )}
            {pageSubtitle && (
              <h2
                className="text-base md:text-4xl font-medium"
                style={{ color: "#680000" }}
              >
                {pageSubtitle}
              </h2>
            )}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default StudentPageTemplate;
