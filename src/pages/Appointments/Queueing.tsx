import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { useAuth } from "@/hooks/useAuth";
import { queueService } from "@/services/queueService";
import type { Queue, ServiceType } from "@/types/queue";
import { RealtimeChannel } from "@supabase/supabase-js";

export default function Queueing() {
  const { userType } = useAuth(); // Returns 'Medical' or 'Dental'
  const [currentServing, setCurrentServing] = useState<Queue | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [waitingQueues, setWaitingQueues] = useState<Queue[]>([]);
  const [isAcceptingQueue, setIsAcceptingQueue] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    if (userType) {
      loadData();

      // Subscribe to realtime changes
      const queueSub: RealtimeChannel = queueService.subscribeToQueue(() => {
        loadData();
      });

      const settingsSub: RealtimeChannel = queueService.subscribeToSettings(
        () => {
          loadSettings();
        }
      );

      return () => {
        queueSub.unsubscribe();
        settingsSub.unsubscribe();
      };
    }
  }, [userType]);

  const loadData = async () => {
    if (!userType) return;

    try {
      const [serving, count, queues] = await Promise.all([
        queueService.getCurrentServing(userType as ServiceType),
        queueService.getWaitingCount(userType as ServiceType),
        queueService.getWaitingQueues(userType as ServiceType),
      ]);
      setCurrentServing(serving);
      setWaitingCount(count);
      setWaitingQueues(queues);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await queueService.getSettings();
      setIsAcceptingQueue(settings?.is_accepting_queue ?? true);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleNextClient = async () => {
    if (!userType) return;

    setLoading(true);
    try {
      await queueService.serveNext(userType as ServiceType);
      await loadData();
    } catch (error) {
      console.error("Error serving next client:", error);
      alert("Error serving next client");
    } finally {
      setLoading(false);
    }
  };

  const handleClearQueue = async () => {
    if (!userType) return;

    if (
      !window.confirm(
        `Are you sure you want to clear the entire ${userType} queue?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await queueService.clearQueue(userType as ServiceType);
      await loadData();
    } catch (error) {
      console.error("Error clearing queue:", error);
      alert("Error clearing queue");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQueue = async () => {
    setLoading(true);
    try {
      const newValue = !isAcceptingQueue;
      await queueService.updateSettings(newValue);
      setIsAcceptingQueue(newValue);
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating queue settings");
    } finally {
      setLoading(false);
    }
  };

  if (!userType) {
    return (
      <MainTemplate>
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600">Loading user information...</p>
          </div>
        </div>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {userType} Queue Management
            </h1>
          </div>
        </div>

        {/* Service Type Banner */}
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  userType === "Medical" ? "bg-blue-500" : "bg-purple-500"
                }`}
              ></div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {userType} Services
                </p>
                <p className="text-sm text-gray-600">
                  Queue Numbers:{" "}
                  {userType === "Medical"
                    ? "M001, M002, M003..."
                    : "D001, D002, D003..."}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <p
                className={`text-lg font-semibold ${
                  isAcceptingQueue ? "text-green-600" : "text-red-600"
                }`}
              >
                {isAcceptingQueue ? "Accepting Queue" : "Queue Closed"}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
          Queueing System
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Now Serving Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Now Serving:
            </h3>

            {currentServing ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Queue Number:</p>
                  <p className="text-4xl font-bold text-[#680000] mb-4">
                    {currentServing.queue_number}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Name:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentServing.name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 mb-2">ID Number:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {currentServing.id_number}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xl text-gray-500 text-center py-12">
                No one is being served
              </p>
            )}
          </div>

          {/* Queue Info and Actions */}
          <div className="space-y-6">
            {/* In Queue Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                In Queue:
              </h3>
              <p className="text-7xl font-bold text-center text-gray-900 mb-4">
                {waitingCount}
              </p>
              {waitingQueues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Next in line:</p>
                  <div className="space-y-1">
                    {waitingQueues.slice(0, 3).map((queue) => (
                      <div
                        key={queue.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-semibold text-[#680000]">
                          {queue.queue_number}
                        </span>
                        <span className="text-gray-700">{queue.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleNextClient}
              disabled={loading || waitingCount === 0}
              className="w-full py-4 bg-[#680000] text-white text-xl font-semibold rounded-lg hover:bg-[#560000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Next Client"}
            </button>

            <button
              onClick={handleClearQueue}
              disabled={loading || waitingCount === 0}
              className="w-full py-4 bg-[#680000] text-white text-xl font-semibold rounded-lg hover:bg-[#560000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Queue
            </button>
          </div>
        </div>

        {/* Queue Toggle */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-lg">Start Queue</p>
            <p className="text-sm text-gray-600">
              Enable to start accepting {userType.toLowerCase()} queue
            </p>
          </div>
          <button
            onClick={handleToggleQueue}
            disabled={loading}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#680000] ${
              isAcceptingQueue ? "bg-green-500" : "bg-gray-300"
            }`}
            aria-label="Toggle queue acceptance"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isAcceptingQueue ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </MainTemplate>
  );
}
