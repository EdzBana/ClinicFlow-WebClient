import React from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const QueueNumberPage: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder for WebSocket-received queue number
  const queueNumber = "M0011"; // This will be replaced with WebSocket data

  const handleViewQueue = () => {
    console.log("View Queue clicked");
    navigate("/student-assistance/queue/view");
  };

  const handleBack = () => {
    console.log("Back clicked");
    navigate("/student-assistance");
  };

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className="pb-50 flex flex-col items-center justify-center h-full">
        {/* Queueing System Title */}
        <h2 className="text-3xl font-medium text-gray-900 mb-8">
          Queueing System
        </h2>

        {/* Confirmation Container */}
        <div className="bg-gray-300 rounded-lg p-12 w-96 shadow-lg text-center">
          {/* Success Message */}
          <h3 className="text-2xl font-medium text-green-600 mb-8">
            Number Acquired!
          </h3>

          {/* Queue Number Display */}
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">Your Number is:</p>
            <div className="text-6xl font-bold text-black mb-8">
              {queueNumber}
            </div>
          </div>

          {/* Instructions */}
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Take a screenshot or
            <br />
            leave this page open
          </p>

          {/* View Queue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleViewQueue}
              className="px-8 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: "#680000" }}
            >
              View Queue
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute bottom-8 right-8">
          <button
            onClick={handleBack}
            className="px-8 py-3 text-white font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Back
          </button>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default QueueNumberPage;
