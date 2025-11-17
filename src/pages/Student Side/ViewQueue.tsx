import React, { useEffect, useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";
import { queueService } from "@/services/queueService";
import { RealtimeChannel } from "@supabase/supabase-js";

interface QueueCounts {
  medical: number;
  dental: number;
}

interface NowServing {
  medical: string | null;
  dental: string | null;
}

const ViewQueue: React.FC = () => {
  const navigate = useNavigate();
  const [inQueue, setInQueue] = useState<QueueCounts>({
    medical: 0,
    dental: 0,
  });
  const [nowServing, setNowServing] = useState<NowServing>({
    medical: null,
    dental: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueueData();
    const queueSub: RealtimeChannel = queueService.subscribeToQueue(() =>
      loadQueueData()
    );
    return () => {
      queueSub.unsubscribe();
    };
  }, []);

  const loadQueueData = async () => {
    try {
      const [medicalCount, dentalCount, medicalServing, dentalServing] =
        await Promise.all([
          queueService.getWaitingCount("Medical"),
          queueService.getWaitingCount("Dental"),
          queueService.getCurrentServing("Medical"),
          queueService.getCurrentServing("Dental"),
        ]);
      setInQueue({ medical: medicalCount, dental: dentalCount });
      setNowServing({
        medical: medicalServing?.queue_number || null,
        dental: dentalServing?.queue_number || null,
      });
    } catch (error) {
      console.error("Error loading queue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/student-assistance");

  if (loading) {
    return (
      <StudentPageTemplate
        pageTitle="Health and Dental Services"
        pageSubtitle="Student Assistance"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading queue data...</p>
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

        {/* Responsive queue cards */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8 w-full max-w-4xl">
          {/* In Queue Card */}
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full sm:w-1/2 shadow-lg text-center">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-6 sm:mb-8">
              In Queue:
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-base sm:text-lg text-gray-700">Medical:</p>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-black">
                  {inQueue.medical}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-base sm:text-lg text-gray-700">Dental:</p>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-black">
                  {inQueue.dental}
                </div>
              </div>
            </div>
          </div>

          {/* Now Serving Card */}
          <div className="bg-white rounded-lg p-6 sm:p-8 w-full sm:w-1/2 shadow-lg text-center">
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-6 sm:mb-8">
              Now
              <br />
              Serving:
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-base sm:text-lg text-gray-700">Medical:</p>
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-bold ${
                    nowServing.medical ? "text-black" : "text-gray-400"
                  }`}
                >
                  {nowServing.medical || "---"}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <p className="text-base sm:text-lg text-gray-700">Dental:</p>
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-bold ${
                    nowServing.dental ? "text-black" : "text-gray-400"
                  }`}
                >
                  {nowServing.dental || "---"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live updates enabled</span>
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

export default ViewQueue;
