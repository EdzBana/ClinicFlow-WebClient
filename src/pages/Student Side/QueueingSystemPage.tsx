import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queueService } from "@/services/queueService";
import type { ServiceType } from "@/types/queue";
import StudentPageTemplate from "./StudentPageTemplate";

export default function QueueingSystemPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("Medical");
  const [loading, setLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    checkQueueStatus();
  }, []);

  const checkQueueStatus = async () => {
    try {
      setStatusLoading(true);
      const settings = await queueService.getSettings();
      setIsAccepting(settings?.is_accepting_queue ?? true);
      setError(null);
    } catch (error) {
      console.error("Error checking queue status:", error);
      setError("Failed to check queue status. Please refresh the page.");
      setIsAccepting(true);
    } finally {
      setStatusLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Please enter your name");
      return false;
    }

    if (!idNumber.trim()) {
      setError("Please enter your ID number");
      return false;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isAccepting) {
      setError("Queue is currently not accepting new entries");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queue = await queueService.addToQueue(
        name.trim(),
        idNumber.trim(),
        serviceType
      );

      if (!queue || !queue.queue_number) {
        throw new Error("Invalid response from server");
      }

      navigate("/student-assistance/queue/success", { state: { queue } });
    } catch (error) {
      console.error("Error adding to queue:", error);

      if (error instanceof Error) {
        setError(
          error.message || "Failed to get queue number. Please try again."
        );
      } else {
        setError("Failed to get queue number. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/student-assistance");
  };

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 text-center">
          Queueing System
        </h2>

        {/* Queue Status Notice */}
        {!isAccepting && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg w-full sm:w-96">
            <p className="text-yellow-800 text-sm text-center">
              Queue is currently closed. Please check back later.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg w-full sm:w-96">
            <p className="text-red-800 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {statusLoading && (
          <div className="bg-gray-300 rounded-lg p-6 sm:p-8 w-full sm:w-96 shadow-lg">
            <p className="text-center text-gray-600">Loading queue status...</p>
          </div>
        )}

        {/* Form */}
        {!statusLoading && (
          <div className="bg-gray-300 rounded-lg p-6 sm:p-8 w-full sm:w-96 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] focus:border-transparent"
                  disabled={loading || !isAccepting}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => {
                    setIdNumber(e.target.value);
                    setError(null);
                  }}
                  className="w-full px-4 py-2 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] focus:border-transparent"
                  disabled={loading || !isAccepting}
                  placeholder="Enter your ID number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Medical"
                      checked={serviceType === "Medical"}
                      onChange={(e) =>
                        setServiceType(e.target.value as ServiceType)
                      }
                      className="mr-2"
                      disabled={loading || !isAccepting}
                    />
                    Medical
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Dental"
                      checked={serviceType === "Dental"}
                      onChange={(e) =>
                        setServiceType(e.target.value as ServiceType)
                      }
                      className="mr-2"
                      disabled={loading || !isAccepting}
                    />
                    Dental
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isAccepting}
                className="w-full py-3 bg-[#680000] text-white font-semibold rounded-lg hover:bg-[#560000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Get Number"}
              </button>
            </form>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 sm:absolute sm:bottom-8 sm:right-8">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-[#680000] text-white font-semibold rounded-lg hover:bg-[#560000] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </StudentPageTemplate>
  );
}
