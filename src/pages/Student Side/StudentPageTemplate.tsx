import React from "react";
import logo from "../../assets/mseuf_logo.webp";

interface PageTemplateProps {
  pageTitle?: string;
  pageSubtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

const StudentPageTemplate: React.FC<PageTemplateProps> = ({
  pageTitle,
  pageSubtitle,
  children,
  className = "",
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{ backgroundColor: "#E8E9F3" }}
    >
      {/* Header Section */}
      <div className="flex flex-col items-center md:items-start p-4 md:p-8">
        {/* Logo + University Name */}
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

        {/* Page Title/Subtitle below logo */}
        {(pageTitle || pageSubtitle) && (
          <div className="mt-4 text-center md:text-left w-full">
            {pageTitle && (
              <h1
                className="text-xl md:text-5xl font-medium"
                style={{ color: "#680000" }}
              >
                {pageTitle}
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

      {/* Content Section */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default StudentPageTemplate;
