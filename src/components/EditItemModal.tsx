import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  apiClient,
  type InventoryItemList,
  type ItemCategory,
} from "@/services/api";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItemList;
  onSuccess: () => void;
}

type ThresholdType = "unit" | "box" | "percentage";

const EditItemModal = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}: EditItemModalProps) => {
  const [name, setName] = useState(item.name);
  const [genericName, setGenericName] = useState(item.generic_name || "");
  const [category, setCategory] = useState(item.category);
  const [quantityPerBox, setQuantityPerBox] = useState(
    item.quantity_per_box?.toString() || ""
  );
  const [minThreshold, setMinThreshold] = useState(
    item.min_threshold?.toString() || "0"
  );
  const [minThresholdType, setMinThresholdType] = useState<ThresholdType>(
    item.min_thresh_type || "unit"
  );
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setName(item.name);
      setGenericName(item.generic_name || "");
      setCategory(item.category);
      setQuantityPerBox(item.quantity_per_box?.toString() || "");
      setMinThreshold(item.min_threshold?.toString() || "0");
      setMinThresholdType(item.min_thresh_type || "unit");

      // Fetch categories
      fetchCategories();
    }
  }, [isOpen, item]);

  const fetchCategories = async () => {
    const response = await apiClient.getCategories();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        // itemType is NOT included - it should remain as is
        name,
        genericName: genericName || null,
        category,
        quantityPerBox: quantityPerBox ? parseInt(quantityPerBox) : null,
        minThreshold: parseInt(minThreshold),
        minThresholdType: minThresholdType as "unit" | "box" | "percentage",
      };

      const response = await apiClient.updateItem(item.id, updateData);

      if (response.error) {
        alert("Error: " + response.error);
      } else {
        alert("Item updated successfully!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Type - Display Only (Not Editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Type
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-600">
              {item.item_type}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Item type cannot be changed
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              required
            />
          </div>

          {/* Generic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generic Name
            </label>
            <input
              type="text"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Per Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Per Box
            </label>
            <input
              type="number"
              value={quantityPerBox}
              onChange={(e) => setQuantityPerBox(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          {/* Minimum Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Threshold *
              </label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold Type *
              </label>
              <select
                value={minThresholdType}
                onChange={(e) =>
                  setMinThresholdType(e.target.value as ThresholdType)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                required
              >
                <option value="unit">Unit</option>
                <option value="box">Box</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Updating..." : "Update Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
