import MainTemplate from "@/components/MainTemplate";
import { ArrowLeft, Package } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  apiClient,
  type InventoryItemList,
  type ItemBatch,
} from "@/services/api";
import RecordSearch from "@/components/RecordSearch";
import RestockModal from "@/components/RestockModal";
import EditItemModal from "@/components/EditItemModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useAuth } from "@/hooks/useAuth";

const ItemCard = ({
  item,
  onRestock,
  onEdit,
  onDelete,
}: {
  item: InventoryItemList;
  onRestock: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-gray-200 rounded-lg p-6 mb-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
          <Package className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{item.name}</h1>
          {item.generic_name && (
            <p className="text-gray-600 text-lg mb-1">({item.generic_name})</p>
          )}
          <p className="text-gray-600 text-lg mb-1">{item.category}</p>
          <p className="text-gray-600 text-base">
            <span className="font-semibold">Type:</span> {item.item_type}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRestock}
          className="px-6 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
        >
          Restock
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
        >
          Edit Item
        </button>
        <button
          onClick={onDelete}
          className="px-6 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200"
        >
          Delete Item
        </button>
      </div>
    </div>

    {/* Stock Summary */}
    <div className="mt-6 pt-4 border-t border-gray-300">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Boxes</p>
          <p className="text-xl font-semibold text-gray-900">
            {item.quantity_box || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Units</p>
          <p className="text-xl font-semibold text-gray-900">
            {item.quantity_unit || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Stock</p>
          <p className="text-xl font-semibold text-gray-900">
            {item.total_stock || 0} units
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType } = useAuth();

  const [item, setItem] = useState<InventoryItemList | null>(null);
  const [batches, setBatches] = useState<ItemBatch[]>([]);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  /** Fetch item details by ID */
  const fetchItem = useCallback(async () => {
    if (!id) return;
    setIsLoadingItem(true);
    try {
      const response = await apiClient.getItemDetailsById(id);
      if (response.data) {
        setItem(response.data);
      } else {
        setItem(null);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
      setItem(null);
    } finally {
      setIsLoadingItem(false);
    }
  }, [id]);

  /** Fetch item batches */
  const fetchBatches = useCallback(async () => {
    if (!id) return;
    setIsLoadingBatches(true);
    try {
      const response = await apiClient.getItemBatches(id);
      if (response.data) {
        setBatches(response.data);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
      setBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [id]);

  const handleItemClick = useCallback(
    (selectedItem: InventoryItemList) => {
      navigate(`/inventory-management/view-item/${selectedItem.id}`);
    },
    [navigate]
  );

  const searchItems = useCallback(
    (query: string) => apiClient.searchItems(query, 10, userType ?? undefined),
    [userType]
  );

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      const response = await apiClient.deleteItem(id);
      if (response.error) {
        alert("Error: " + response.error);
      } else {
        alert("Item deleted successfully");
        navigate("/inventory-management/view-item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleEditSuccess = () => {
    fetchItem();
    fetchBatches();
  };

  const handleRestockSuccess = () => {
    fetchItem();
    fetchBatches();
  };

  useEffect(() => {
    fetchItem();
    fetchBatches();
  }, [fetchItem, fetchBatches]);

  return (
    <MainTemplate>
      <div className="flex justify-start mb-6">
        <button
          type="button"
          onClick={() => navigate("/inventory-management")}
          className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Inventory Management
        </button>
      </div>
      {/* Search Bar */}
      <div className="flex justify-center items-start mb-8">
        <RecordSearch<InventoryItemList>
          placeholder="Enter Item Name"
          searchFunction={searchItems}
          onSelect={handleItemClick}
          getKey={(item) => item.id}
          renderItem={(item) => (
            <>
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-600">
                {item.category} • {item.item_type}
              </div>
            </>
          )}
        />

        <button
          className="ml-5 px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200"
          onClick={() => setRestockModalOpen(true)}
        >
          Restock
        </button>
      </div>

      {/* Item Info */}
      {isLoadingItem ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Loading item...</p>
        </div>
      ) : item ? (
        <ItemCard
          item={item}
          onRestock={() => setRestockModalOpen(true)}
          onEdit={() => setEditModalOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Item not found</p>
        </div>
      )}

      {/* Batches Section */}
      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Available Batches
            </h2>
            {item && (
              <span className="text-sm text-gray-500">
                {batches.length} batch{batches.length !== 1 ? "es" : ""} found
              </span>
            )}
          </div>

          {isLoadingBatches ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading batches...</p>
            </div>
          ) : batches.length > 0 ? (
            <div className="space-y-3">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Batch #{batch.id.slice(0, 8)}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Boxes:</span>{" "}
                          {batch.quantity_box || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Units:</span>{" "}
                          {batch.quantity_unit || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Cost/Box:</span> ₱
                          {batch.cost_per_box?.toFixed(2) || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Cost/Unit:</span> ₱
                          {batch.cost_per_unit?.toFixed(2) || "N/A"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Received:{" "}
                      {batch.received_at
                        ? new Date(batch.received_at).toLocaleDateString()
                        : "N/A"}
                      {batch.expiration_date && (
                        <span className="ml-3 text-orange-600">
                          • Expires:{" "}
                          {new Date(batch.expiration_date).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 italic">
                {item
                  ? "No batches found for this item."
                  : "Select an item to view batches."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {item && (
        <>
          <RestockModal
            isOpen={restockModalOpen}
            onClose={() => setRestockModalOpen(false)}
            item={item}
            onSuccess={handleRestockSuccess}
          />
          <EditItemModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            item={item}
            onSuccess={handleEditSuccess}
          />
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            itemName={item.name}
          />
        </>
      )}
    </MainTemplate>
  );
};

export default ItemDetail;
