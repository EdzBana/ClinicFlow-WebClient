import React from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const QueueViewPage: React.FC = () => {
  const navigate = useNavigate();

  // Placeholder data for WebSocket-received queue information
  const queueData = {
    inQueue: {
      medical: 5,
      dental: 3,
    },
    nowServing: {
      medical: "M0005",
      dental: "D0011",
    },
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

        {/* Queue Display Container */}
        <div className="flex gap-8 mb-8">
          {/* In Queue Card */}
          <div className="bg-white rounded-lg p-8 w-80 shadow-lg text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-8">
              In Queue:
            </h3>

            <div className="space-y-6">
              {/* Medical Queue Count */}
              <div>
                <p className="text-lg text-gray-700 mb-2">Medical:</p>
                <div className="text-5xl font-bold text-black">
                  {queueData.inQueue.medical}
                </div>
              </div>

              {/* Dental Queue Count */}
              <div>
                <p className="text-lg text-gray-700 mb-2">Dental:</p>
                <div className="text-5xl font-bold text-black">
                  {queueData.inQueue.dental}
                </div>
              </div>
            </div>
          </div>

          {/* Now Serving Card */}
          <div className="bg-white rounded-lg p-8 w-80 shadow-lg text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-8">
              Now
              <br />
              Serving:
            </h3>

            <div className="space-y-6">
              {/* Medical Now Serving */}
              <div>
                <p className="text-lg text-gray-700 mb-2">Medical:</p>
                <div className="text-4xl font-bold text-black">
                  {queueData.nowServing.medical}
                </div>
              </div>

              {/* Dental Now Serving */}
              <div>
                <p className="text-lg text-gray-700 mb-2">Dental:</p>
                <div className="text-4xl font-bold text-black">
                  {queueData.nowServing.dental}
                </div>
              </div>
            </div>
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

export default QueueViewPage;
