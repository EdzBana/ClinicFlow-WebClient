import React, { useEffect, useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate, useLocation } from "react-router-dom";
import type { Queue } from "@/types/queue";

const QueueSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queueData, setQueueData] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { queue?: Queue };
    if (state?.queue) {
      setQueueData(state.queue);
    } else {
      navigate("/student-assistance");
    }
    setLoading(false);
  }, [location, navigate]);

  const handleViewQueue = () => navigate("/student-assistance/queue/view");
  const handleBack = () => navigate("/student-assistance");

  if (loading) {
    return (
      <StudentPageTemplate
        pageTitle="Health and Dental Services"
        pageSubtitle="Student Assistance"
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </StudentPageTemplate>
    );
  }

  if (!queueData) {
    return (
      <StudentPageTemplate
        pageTitle="Health and Dental Services"
        pageSubtitle="Student Assistance"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">No queue data found</p>
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
  }

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className="pb-50 flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-6 sm:mb-8 text-center">
          Queueing System
        </h2>

        <div className="bg-gray-300 rounded-lg p-6 sm:p-12 w-full max-w-md shadow-lg text-center">
          <h3 className="text-xl sm:text-2xl font-medium text-green-600 mb-6 sm:mb-8">
            Number Acquired!
          </h3>

          <div className="mb-6">
            <span
              className={`inline-block px-4 py-2 rounded-full text-white text-sm font-medium ${
                queueData.service_type === "Medical"
                  ? "bg-blue-500"
                  : "bg-purple-500"
              }`}
            >
              {queueData.service_type}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-base sm:text-lg text-gray-700 mb-4">
              Your Number is:
            </p>
            <div className="text-5xl sm:text-6xl font-bold text-black mb-8">
              {queueData.queue_number}
            </div>
          </div>

          <div className="mb-6 text-left bg-white bg-opacity-50 rounded-lg p-4">
            <div className="mb-2">
              <p className="text-sm text-gray-600">Name:</p>
              <p className="text-lg font-medium text-gray-900">
                {queueData.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID Number:</p>
              <p className="text-lg font-medium text-gray-900">
                {queueData.id_number}
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Take a screenshot or
            <br />
            leave this page open
          </p>

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

        <div className="mt-6 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto px-8 py-3 text-white font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Back
          </button>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default QueueSuccess;
