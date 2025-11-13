import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { queueService } from "@/services/queueService";
import type { QueueHistory, ServiceType, QueueStatus } from "@/types/queue";

export default function QueueHistoryPage() {
  const [history, setHistory] = useState<QueueHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "">("");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "">("");
  const [stats, setStats] = useState({
    totalQueues: 0,
    completedQueues: 0,
    cancelledQueues: 0,
    medicalQueues: 0,
    dentalQueues: 0,
    averageWaitTime: null as number | null,
  });

  useEffect(() => {
    // Set default dates (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    setStartDate(lastWeek.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadHistory();
      loadStats();
    }
  }, [startDate, endDate, serviceFilter, statusFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await queueService.getQueueHistory(
        startDate,
        endDate,
        serviceFilter || undefined,
        statusFilter || undefined,
        200
      );
      setHistory(data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await queueService.getQueueStats(startDate, endDate);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleArchiveOld = async () => {
    if (
      !window.confirm(
        "Archive all completed/cancelled queues from previous days?"
      )
    ) {
      return;
    }

    try {
      await queueService.archiveOldQueues();
      alert("Old queues archived successfully!");
      loadHistory();
    } catch (error) {
      console.error("Error archiving:", error);
      alert("Failed to archive old queues");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateWaitTime = (created: string, served: string | null) => {
    if (!served) return "N/A";
    const diff = new Date(served).getTime() - new Date(created).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} min`;
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Queue Number",
      "Name",
      "ID Number",
      "Service",
      "Status",
      "Wait Time",
    ];
    const rows = history.map((item) => [
      formatDate(item.queue_date),
      item.queue_number,
      item.name,
      item.id_number,
      item.service_type,
      item.status,
      calculateWaitTime(item.created_at, item.served_at),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `queue-history-${startDate}-to-${endDate}.csv`;
    a.click();
  };

  return (
    <MainTemplate>
      <div className="min-h-screen bg-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-800">Queue History</h1>
            <p className="text-xl text-gray-600 mt-2">
              View past queue records and statistics
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Queues</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalQueues}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.completedQueues}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">
              {stats.cancelledQueues}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Medical</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.medicalQueues}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Dental</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.dentalQueues}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Wait</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageWaitTime ? `${stats.averageWaitTime}m` : "N/A"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={serviceFilter}
                onChange={(e) =>
                  setServiceFilter(e.target.value as ServiceType | "")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000]"
              >
                <option value="">All Services</option>
                <option value="Medical">Medical</option>
                <option value="Dental">Dental</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as QueueStatus | "")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000]"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={exportToCSV}
              disabled={history.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export to CSV
            </button>
            <button
              onClick={handleArchiveOld}
              className="px-6 py-2 bg-[#680000] text-white rounded-lg hover:bg-[#560000]"
            >
              Archive Old Queues
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                No history records found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Queue #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Time In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Wait Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.queue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            item.service_type === "Medical"
                              ? "text-blue-600"
                              : "text-purple-600"
                          }`}
                        >
                          {item.queue_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.id_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.service_type === "Medical"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatTime(item.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {calculateWaitTime(item.created_at, item.served_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainTemplate>
  );
}
