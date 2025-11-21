import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import MainTemplate from "@/components/MainTemplate";
import {
  apiClient,
  type InventoryItemList,
  type ItemCategory,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface InventoryItem {
  id: string;
  itemName: string;
  genericName: string | null; // ✅ NEW
  type: string;
  category: string;
  quantityBox: number;
  unitQuantity: number;
  costPerUnit: number;
  costPerBox: number;
  expirationDate: string;
  receivedAt: string; // ✅ NEW
  status: "normal" | "low-stock" | "near-expiration" | "expired";
}

const STATUS_PRIORITY: Record<InventoryItem["status"], number> = {
  expired: 1,
  "near-expiration": 2,
  "low-stock": 3,
  normal: 4,
};

const ITEMS_PER_PAGE = 15;
const NEAR_EXPIRATION_DAYS = 14;

const TABLE_COLUMNS = [
  { key: "itemName", label: "Item Name" },
  { key: "genericName", label: "Generic Name" }, // ✅ NEW
  { key: "category", label: "Category" },
  { key: "quantityBox", label: "Quantity (Box)" },
  { key: "unitQuantity", label: "Unit Quantity" },
  { key: "costPerUnit", label: "Cost Per Unit" },
  { key: "costPerBox", label: "Cost Per Box" },
  { key: "expirationDate", label: "Expiration Date" },
  { key: "receivedAt", label: "Received At" }, // ✅ NEW (last column)
] as const;

const getRowBackgroundColor = (status: InventoryItem["status"]): string => {
  const colorMap: Record<InventoryItem["status"], string> = {
    "low-stock": "bg-red-200",
    "near-expiration": "bg-orange-200",
    expired: "bg-red-500 text-white",
    normal: "bg-white",
  };
  return colorMap[status];
};

const calculateDaysDifference = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  return (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
};

const determineItemStatus = (
  item: InventoryItemList
): InventoryItem["status"] => {
  // Priority 1: Expiration
  if (item.expiration_date) {
    const diffDays = calculateDaysDifference(item.expiration_date);
    if (diffDays < 0) return "expired";
    if (diffDays <= NEAR_EXPIRATION_DAYS) return "near-expiration";
  }

  // Priority 2: Stock threshold
  const currentQuantity =
    item.min_thresh_type === "unit"
      ? parseInt(item.quantity_unit, 10)
      : parseInt(item.quantity_box, 10);

  if (currentQuantity <= item.min_threshold) {
    return "low-stock";
  }

  return "normal";
};

const mapToInventoryItem = (item: InventoryItemList): InventoryItem => {
  const status = determineItemStatus(item);

  return {
    id: item.id,
    itemName: item.name,
    genericName: item.generic_name,
    type: item.item_type,
    category: item.category,
    quantityBox: parseInt(item.quantity_box, 10) || 0,
    unitQuantity: parseInt(item.quantity_unit, 10) || 0,
    costPerUnit: item.cost_per_unit ?? 0,
    costPerBox: item.cost_per_box ?? 0,
    expirationDate: item.expiration_date
      ? new Date(item.expiration_date).toISOString().split("T")[0]
      : "N/A",
    receivedAt: item.received_at
      ? new Date(item.received_at).toISOString().split("T")[0]
      : "N/A",
    status,
  };
};

const Inventory = () => {
  const { userType } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem;
    direction: "asc" | "desc";
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getItemList();

        if (response.error) {
          setError(response.error);
          return;
        }

        const data = response.data ?? [];
        setInventoryItems(data.map(mapToInventoryItem));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories();
        if (!response.error) {
          setCategories(response.data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = inventoryItems.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower);

      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;

      const matchesUserType =
        !userType || item.type.toLowerCase() === userType.toLowerCase();

      return matchesSearch && matchesCategory && matchesUserType;
    });

    return filtered.sort((a, b) => {
      const priorityDiff =
        STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (priorityDiff !== 0) return priorityDiff;

      if (sortConfig) {
        const { key, direction } = sortConfig;
        const aVal = a[key];
        const bVal = b[key];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [inventoryItems, searchTerm, categoryFilter, userType, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredAndSortedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (key: keyof InventoryItem) => {
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderEmptyState = () => {
    if (loading) {
      return <div className="p-4 text-center">Loading...</div>;
    }

    if (error) {
      return <div className="p-4 text-center text-red-600">Error: {error}</div>;
    }

    if (filteredAndSortedItems.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 text-lg">
          No Items Found
        </div>
      );
    }

    return null;
  };

  return (
    <MainTemplate>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {renderEmptyState() || (
                <table className="w-full">
                  <thead className="bg-gray-500 text-white">
                    <tr>
                      {TABLE_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() =>
                            handleSort(col.key as keyof InventoryItem)
                          }
                          className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-gray-600"
                        >
                          {col.label}{" "}
                          {sortConfig?.key === col.key &&
                            (sortConfig.direction === "asc" ? "▲" : "▼")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() =>
                          navigate(`/inventory-management/view-item/${item.id}`)
                        }
                        className={`border-b cursor-pointer hover:bg-gray-100 transition ${getRowBackgroundColor(
                          item.status
                        )}`}
                      >
                        <td className="px-4 py-3 text-sm">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.genericName || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.category}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.quantityBox}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.unitQuantity}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ₱{item.costPerUnit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ₱{item.costPerBox.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.expirationDate}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.receivedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && filteredAndSortedItems.length > 0 && (
              <div className="flex justify-center items-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-red-800 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <aside className="w-80 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Filter By:</h3>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="category-filter"
                    className="block text-sm font-medium mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-800"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Legend:</h3>
              <div className="space-y-2">
                <LegendItem color="bg-red-500" label="Expired" />
                <LegendItem color="bg-orange-200" label="Near Expiration" />
                <LegendItem color="bg-red-200" label="Low Stock" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </MainTemplate>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 ${color} rounded`} />
    <span className="text-sm">{label}</span>
  </div>
);

export default Inventory;
