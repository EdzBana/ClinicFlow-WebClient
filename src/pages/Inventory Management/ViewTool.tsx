import { useState, useEffect, useMemo } from "react";
import { Search, ArrowLeft } from "lucide-react";
import MainTemplate from "@/components/MainTemplate";
import { useNavigate } from "react-router-dom";
import { toolService } from "@/services/toolService";
import type { Tool } from "@/types/tools";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
  receivedAt: string;
}

const CONDITION_COLORS: Record<string, string> = {
  excellent: "bg-green-100",
  good: "bg-blue-100",
  fair: "bg-yellow-100",
  poor: "bg-orange-100",
  damaged: "bg-red-100",
};

const ITEMS_PER_PAGE = 15;

const TOOL_COLUMNS = [
  { key: "name", label: "Tool Name" },
  { key: "category", label: "Category" },
  { key: "quantity", label: "Quantity" },
  { key: "condition", label: "Condition" },
  { key: "receivedAt", label: "Received At" },
] as const;

const mapToToolItem = (tool: Tool): ToolItem => ({
  id: tool.id,
  name: tool.name,
  category: tool.category,
  quantity: tool.quantity,
  condition: tool.condition,
  receivedAt: tool.created_at
    ? new Date(tool.created_at).toISOString().split("T")[0]
    : "N/A",
});

const ViewTool = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [toolItems, setToolItems] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Fetch tools
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await toolService.getToolsList();
        if (!response.error) {
          setToolItems((response.data ?? []).map(mapToToolItem));
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tools");
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const allCategories = useMemo(() => {
    return [...new Set(toolItems.map((t) => t.category))].sort();
  }, [toolItems]);

  const filteredAndSortedItems = useMemo(() => {
    const itemsToShow = toolItems.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.condition.toLowerCase().includes(searchLower);

      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    return itemsToShow.sort((a, b) => {
      if (sortConfig) {
        const { key, direction } = sortConfig;
        const aVal = (a as any)[key];
        const bVal = (b as any)[key];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [toolItems, searchTerm, categoryFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredAndSortedItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (key: string) => {
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

  const handleToolClick = (toolId: string) => {
    navigate(`/tools-management/view-tool/${toolId}`);
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
          No Tools Found
        </div>
      );
    }

    return null;
  };

  return (
    <MainTemplate>
      <div className="space-y-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tools Management
          </button>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Tool..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              {renderEmptyState() || (
                <table className="w-full">
                  <thead className="bg-gray-500 text-white">
                    <tr>
                      {TOOL_COLUMNS.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
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
                    {paginatedItems.map((item) => {
                      const bgColor =
                        CONDITION_COLORS[item.condition] || "bg-white";

                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleToolClick(item.id)}
                          className={`border-b ${bgColor} cursor-pointer hover:opacity-80 transition`}
                        >
                          <td className="px-4 py-3 text-sm">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.category}</td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm capitalize">
                            {item.condition}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.receivedAt}
                          </td>
                        </tr>
                      );
                    })}
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
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-800"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Legend:</h3>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Tools Condition:
                </p>
                <LegendItem color="bg-green-100" label="Excellent" />
                <LegendItem color="bg-blue-100" label="Good" />
                <LegendItem color="bg-yellow-100" label="Fair" />
                <LegendItem color="bg-orange-100" label="Poor" />
                <LegendItem color="bg-red-100" label="Damaged" />
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

export default ViewTool;
