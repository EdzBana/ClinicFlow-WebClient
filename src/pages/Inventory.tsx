import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import MainTemplate from "@/components/MainTemplate";
import { apiClient, type InvetoryItemList } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface InventoryItem {
  id: number;
  itemName: string;
  type: string;
  category: string;
  quantityBox: number;
  unitQuantity: number;
  costPerUnit: number;
  costPerBox: number;
  expirationDate: string;
  status: "normal" | "low-stock" | "near-expiration" | "expired";
}

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [parametersFilter, setParametersFilter] = useState("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userType } = useAuth();

  const itemsPerPage = 15;

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getItemList();
        const data = response.data ?? []; // ensure it's an array

        const mappedItems: InventoryItem[] = data.map(
          (item: InvetoryItemList) => {
            const today = new Date();
            const expiry = new Date(item.expiration_date);
            const diffDays =
              (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

            let status: InventoryItem["status"] = "normal";
            if (item.quantity_box <= item.min_threshold) {
              status = "low-stock";
            } else if (diffDays < 0) {
              status = "expired";
            } else if (diffDays <= 14 && diffDays >= 0) {
              status = "near-expiration";
            }

            return {
              id: Number(item.id),
              itemName: item.name,
              type: item.type,
              category: item.category,
              quantityBox: item.quantity_box,
              unitQuantity: item.quantity_unit,
              costPerUnit: item.cost_per_unit,
              costPerBox: item.cost_per_box,
              expirationDate: expiry.toISOString().split("T")[0],
              status,
            };
          }
        );

        setInventoryItems(mappedItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter and search logic
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesUserType =
      !userType || item.type.toLowerCase() === userType.toLowerCase();

    return matchesSearch && matchesCategory && matchesUserType;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const priority = {
      expired: 1,
      "near-expiration": 2,
      "low-stock": 3,
      normal: 4,
    };
    return priority[a.status] - priority[b.status];
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Action handlers
  const handleAddItem = () => {
    console.log("Add Item clicked");
  };

  const handleEditItem = (id: number) => {
    console.log("Edit item:", id);
  };

  const handleDeleteItem = (id: number) => {
    console.log("Delete item:", id);
  };

  const handleFilter = () => {
    console.log("Filter applied");
  };

  const getRowBackgroundColor = (status: string) => {
    switch (status) {
      case "low-stock":
        return "bg-red-200";
      case "near-expiration":
        return "bg-orange-200";
      case "expired":
        return "bg-red-500 text-white";
      default:
        return "bg-white";
    }
  };

  return (
    <MainTemplate initialPage="Inventory">
      <div className="space-y-6">
        {/* Search and Add Item Section */}
        <div className="flex justify-between items-center">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={handleAddItem}
            className="px-6 py-2 text-white font-medium rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: "#680000" }}
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Inventory Table */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  Error: {error}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-lg font-medium">
                  No Items Found
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-500 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Quantity (Box)
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Unit Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Cost Per Unit/Box
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Expiration Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-b ${getRowBackgroundColor(
                          item.status
                        )}`}
                      >
                        <td className="px-4 py-3 text-sm">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm">{item.category}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.quantityBox}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.unitQuantity}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ₱{item.costPerUnit.toFixed(2)}/Unit | ₱
                          {item.costPerBox.toFixed(2)}/Box
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {item.expirationDate}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditItem(item.id)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && filteredItems.length > 0 && (
              <div className="flex justify-center items-center mt-4 gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
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

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Filter Panel */}
          <div className="w-80 space-y-4">
            {/* Filter By Section */}
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
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
                  >
                    <option value="">All Categories</option>
                    <option value="Medical">Medical</option>
                    <option value="Dental">Dental</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parameters
                  </label>
                  <input
                    type="text"
                    placeholder="Parameters"
                    value={parametersFilter}
                    onChange={(e) => setParametersFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <button
                  onClick={handleFilter}
                  className="w-full py-2 text-white font-medium rounded transition-colors duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#680000" }}
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Legend:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Expired</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 rounded"></div>
                  <span className="text-sm">Low Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-200 rounded"></div>
                  <span className="text-sm">Near Expiration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainTemplate>
  );
};

export default Inventory;
