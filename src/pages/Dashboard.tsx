import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { apiClient } from "@/services/api";
import { queueService } from "@/services/queueService";
import { useAuth } from "@/hooks/useAuth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AlertTriangle, Package, Calendar } from "lucide-react";

const NEAR_EXPIRATION_DAYS = 14;

interface DashboardStats {
  lowStockCount: number;
  nearExpirationCount: number;
  expiredCount: number;
}

interface ChartData {
  date: string;
  count: number;
}

interface AppointmentData {
  date: string;
  count: number;
}

interface Transaction {
  created_at: string;
  user_type: string;
}

const calculateDaysDifference = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  return (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
};

const Dashboard = () => {
  const { userType } = useAuth(); // Always "Medical" or "Dental"
  const [stats, setStats] = useState<DashboardStats>({
    lowStockCount: 0,
    nearExpirationCount: 0,
    expiredCount: 0,
  });
  const [dispenseData, setDispenseData] = useState<ChartData[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  // Fetch inventory items for alerts
  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        const response = await apiClient.getItemList();
        if (response.error || !response.data) return;

        const items = response.data.filter(
          (item) => item.item_type === userType
        );

        let lowStock = 0;
        let nearExpiration = 0;
        let expired = 0;

        items.forEach((item) => {
          if (item.expiration_date) {
            const diffDays = calculateDaysDifference(item.expiration_date);
            if (diffDays < 0) expired++;
            else if (diffDays <= NEAR_EXPIRATION_DAYS) nearExpiration++;
          }

          const currentQuantity =
            item.min_thresh_type === "unit"
              ? parseInt(item.quantity_unit, 10)
              : parseInt(item.quantity_box, 10);

          if (currentQuantity <= item.min_threshold) lowStock++;
        });

        setStats({
          lowStockCount: lowStock,
          nearExpirationCount: nearExpiration,
          expiredCount: expired,
        });
      } catch (error) {
        console.error("Error fetching inventory alerts:", error);
      }
    };

    fetchInventoryAlerts();
  }, [userType]);

  // Fetch appointment/queue data
  useEffect(() => {
    const fetchAppointmentData = async () => {
      setAppointmentLoading(true);
      try {
        const daysToShow = Number(timeRange);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - (daysToShow - 1));

        // Narrow userType into a safe ServiceType | undefined
        const serviceType: "Medical" | "Dental" | undefined =
          userType === "Medical" || userType === "Dental"
            ? userType
            : undefined;

        const history = await queueService.getQueueHistory(
          startDate.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
          serviceType,
          undefined,
          1000
        );

        // Define expected type for queue entries
        interface QueueHistoryEntry {
          queue_date: string;
        }

        // Init date map
        const dateMap = new Map<string, number>();
        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          dateMap.set(date.toISOString().split("T")[0], 0);
        }

        history.forEach((queue: QueueHistoryEntry) => {
          if (dateMap.has(queue.queue_date)) {
            dateMap.set(
              queue.queue_date,
              (dateMap.get(queue.queue_date) ?? 0) + 1
            );
          }
        });

        const chartData: AppointmentData[] = [...dateMap.entries()].map(
          ([date, count]) => ({
            date: new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count,
          })
        );

        setAppointmentData(chartData);
      } catch (error) {
        console.error("Error fetching appointment data:", error);
        setAppointmentData([]);
      } finally {
        setAppointmentLoading(false);
      }
    };

    fetchAppointmentData();
  }, [userType, timeRange]);

  // Fetch transaction data for dispense chart
  useEffect(() => {
    const fetchDispenseData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getTransactions(1, 1000);
        if (response.error || !response.data) {
          setDispenseData([]);
          return;
        }

        const filtered = response.data.filter(
          (t: Transaction) => !userType || t.user_type === userType
        );

        const dateMap = new Map<string, number>();
        const daysToShow = parseInt(timeRange);
        const today = new Date();

        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          dateMap.set(dateStr, 0);
        }

        filtered.forEach((transaction: Transaction) => {
          const date = transaction.created_at.split("T")[0];
          if (dateMap.has(date))
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        });

        const chartData = Array.from(dateMap.entries()).map(
          ([date, count]) => ({
            date: new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            count,
          })
        );

        setDispenseData(chartData);
      } catch (error) {
        console.error("Error fetching dispense data:", error);
        setDispenseData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDispenseData();
  }, [userType, timeRange]);

  return (
    <MainTemplate>
      <div className="space-y-6">
        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Expired Items Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Expired Items
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.expiredCount}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items that have passed expiration date
            </p>
          </div>

          {/* Near Expiration Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Near Expiration
                </p>
                <p className="text-3xl font-bold text-orange-500 mt-2">
                  {stats.nearExpirationCount}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Calendar className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items expiring within 14 days
            </p>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-[#680000]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-[#680000] mt-2">
                  {stats.lowStockCount}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Package className="w-8 h-8 text-[#680000]" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Items below minimum threshold
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Dispenses Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Item Dispenses
              </h2>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7" | "30" | "90")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dispenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#680000"
                    strokeWidth={2}
                    name="Dispenses"
                    dot={{ fill: "#680000" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Appointments Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Appointments / Queue
              </h2>
              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7" | "30" | "90")
                }
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#680000] text-sm"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            {appointmentLoading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1e40af"
                    strokeWidth={2}
                    name="Appointments"
                    dot={{ fill: "#1e40af" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => (window.location.href = "/inventory")}
              className="px-6 py-3 bg-[#680000] text-white rounded-lg hover:bg-[#560000] transition-colors"
            >
              View Inventory
            </button>
            <button
              onClick={() => (window.location.href = "/inventory-management")}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Manage Items
            </button>
            <button
              onClick={() => (window.location.href = "/transaction-history")}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Transaction History
            </button>
          </div>
        </div>
      </div>
    </MainTemplate>
  );
};

export default Dashboard;
