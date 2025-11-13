import { useState } from "react";
import { X } from "lucide-react";
import { apiClient, type InventoryItemList } from "@/services/api";

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItemList;
  onSuccess: () => void;
}

const RestockModal = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}: RestockModalProps) => {
  const [quantityBox, setQuantityBox] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [costPerBox, setCostPerBox] = useState("");
  const [costPerUnit, setCostPerUnit] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const qtyBox = parseInt(quantityBox) || 0;
    const qtyUnit = parseInt(quantityUnit) || 0;

    if (qtyBox === 0 && qtyUnit === 0) {
      alert("Please enter at least one quantity (box or unit)");
      return;
    }

    setLoading(true);

    try {
      const restockData = {
        itemId: item.id,
        quantityBox: qtyBox,
        quantityUnit: qtyUnit,
        costPerBox: costPerBox ? parseFloat(costPerBox) : null,
        costPerUnit: costPerUnit ? parseFloat(costPerUnit) : null,
        expirationDate: expirationDate || null,
      };

      const response = await apiClient.restockItem(restockData);

      if (response.error) {
        alert("Error: " + response.error);
      } else {
        alert("Item restocked successfully!");
        onSuccess();
        onClose();
        // Reset form
        setQuantityBox("");
        setQuantityUnit("");
        setCostPerBox("");
        setCostPerUnit("");
        setExpirationDate("");
      }
    } catch (error) {
      console.error("Error restocking item:", error);
      alert("Failed to restock item");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantityBox("");
    setQuantityUnit("");
    setCostPerBox("");
    setCostPerUnit("");
    setExpirationDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Restock Item</h2>
            <p className="text-sm text-gray-600 mt-1">{item.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Boxes)
                </label>
                <input
                  type="number"
                  value={quantityBox}
                  onChange={(e) => setQuantityBox(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Units)
                </label>
                <input
                  type="number"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * At least one quantity field must be filled
            </p>
          </div>

          {/* Cost Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              Cost (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Box (₱)
                </label>
                <input
                  type="number"
                  value={costPerBox}
                  onChange={(e) => setCostPerBox(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Unit (₱)
                </label>
                <input
                  type="number"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800"
            />
          </div>

          {/* Summary */}
          {item.quantity_per_box &&
            (parseInt(quantityBox) > 0 || parseInt(quantityUnit) > 0) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Stock Summary
                </h3>
                <p className="text-sm text-blue-800">
                  Adding: {parseInt(quantityBox) || 0} box(es) +{" "}
                  {parseInt(quantityUnit) || 0} unit(s)
                </p>
                <p className="text-sm text-blue-800 font-semibold mt-1">
                  Total Units:{" "}
                  {(parseInt(quantityBox) || 0) * item.quantity_per_box +
                    (parseInt(quantityUnit) || 0)}{" "}
                  units
                </p>
              </div>
            )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Restocking..." : "Restock Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
