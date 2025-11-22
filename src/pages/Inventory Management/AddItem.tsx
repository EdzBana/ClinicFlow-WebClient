import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { useAuth } from "@/hooks/useAuth";
import {
  apiClient,
  type CreateItemRequest,
  type ItemCategory,
} from "@/services/api";
import { toolService } from "@/services/toolService";
import type { CreateToolRequest } from "@/types/tools";
import { logout } from "@/auth/auth";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AddItem = () => {
  const { userType } = useAuth();

  // Toggle between inventory and tool
  const [addMode, setAddMode] = useState<"inventory" | "tool">("inventory");

  // Inventory form state
  const [inventoryFormData, setInventoryFormData] = useState({
    name: "",
    category: "",
    genericName: "",
    quantityBox: "",
    quantityUnit: "",
    costPerUnit: "",
    costPerBox: "",
    expirationDate: "",
    minThreshold: "",
    minThresholdType: "unit",
    quantityPerBox: "",
  });

  // Tool form state
  const [toolFormData, setToolFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    condition: "good",
    notes: "",
  });

  // UI state
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [quantityMode, setQuantityMode] = useState<"box" | "unit">("box");

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      if (response.error) {
        console.error("Error fetching categories:", response.error);
        setCategories([]);
        return;
      }
      setCategories(response.data ?? []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleInventoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInventoryFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleToolInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setToolFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateInventoryForm = () => {
    const newErrors: Record<string, string> = {};

    if (!inventoryFormData.name.trim())
      newErrors.name = "Item name is required";
    if (!inventoryFormData.category)
      newErrors.category = "Category is required";

    if (quantityMode === "box") {
      if (
        !inventoryFormData.quantityBox ||
        +inventoryFormData.quantityBox <= 0
      ) {
        newErrors.quantityBox = "Box quantity is required and must be > 0";
      }
      if (
        !inventoryFormData.quantityPerBox ||
        +inventoryFormData.quantityPerBox <= 0
      ) {
        newErrors.quantityPerBox =
          "Quantity per box is required and must be > 0";
      }
      if (!inventoryFormData.costPerBox || +inventoryFormData.costPerBox <= 0) {
        newErrors.costPerBox = "Cost per box is required and must be > 0";
      }
    }

    if (quantityMode === "unit") {
      if (
        !inventoryFormData.quantityUnit ||
        +inventoryFormData.quantityUnit <= 0
      ) {
        newErrors.quantityUnit = "Unit quantity is required and must be > 0";
      }
      if (
        !inventoryFormData.costPerUnit ||
        +inventoryFormData.costPerUnit <= 0
      ) {
        newErrors.costPerUnit = "Cost per unit is required and must be > 0";
      }
    }

    if (inventoryFormData.minThreshold && +inventoryFormData.minThreshold < 0) {
      newErrors.minThreshold = "Minimum threshold must be positive";
    }

    return newErrors;
  };

  const validateToolForm = () => {
    const newErrors: Record<string, string> = {};

    if (!toolFormData.name.trim()) newErrors.name = "Tool name is required";
    if (!toolFormData.category.trim())
      newErrors.category = "Category is required";
    if (!toolFormData.quantity || +toolFormData.quantity < 0) {
      newErrors.quantity = "Quantity is required and must be >= 0";
    }
    if (!toolFormData.condition) newErrors.condition = "Condition is required";

    return newErrors;
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      alert("Your session has expired. Please log in again.");
      logout();
      return;
    }

    const validationErrors = validateInventoryForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const itemData: CreateItemRequest = {
        itemType: userType,
        name: inventoryFormData.name.trim(),
        category: inventoryFormData.category,
        genericName: inventoryFormData.genericName.trim() || null,

        quantityBox:
          quantityMode === "box" && inventoryFormData.quantityBox
            ? parseInt(inventoryFormData.quantityBox)
            : null,
        quantityPerBox:
          quantityMode === "box" && inventoryFormData.quantityPerBox
            ? parseInt(inventoryFormData.quantityPerBox)
            : null,
        costPerBox:
          quantityMode === "box" && inventoryFormData.costPerBox
            ? parseFloat(inventoryFormData.costPerBox)
            : null,

        quantityUnit:
          quantityMode === "unit" && inventoryFormData.quantityUnit
            ? parseInt(inventoryFormData.quantityUnit)
            : null,
        costPerUnit:
          quantityMode === "unit" && inventoryFormData.costPerUnit
            ? parseFloat(inventoryFormData.costPerUnit)
            : null,

        expirationDate: inventoryFormData.expirationDate || null,
        minThreshold: inventoryFormData.minThreshold
          ? parseInt(inventoryFormData.minThreshold)
          : 0,
        minThresholdType: inventoryFormData.minThresholdType as
          | "unit"
          | "box"
          | "percentage",
      };

      const response = await apiClient.createItem(itemData);
      if (response.error) {
        setErrors({ submit: response.error });
        return;
      }

      toast.success("Inventory item successfully added!");
      handleInventoryReset();
    } catch (error) {
      console.error("Error adding item:", error);
      setErrors({ submit: "Failed to add item. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleToolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateToolForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const toolData: CreateToolRequest = {
        name: toolFormData.name.trim(),
        category: toolFormData.category.trim(),
        quantity: parseInt(toolFormData.quantity),
        condition: toolFormData.condition,
        notes: toolFormData.notes.trim() || undefined,
      };

      const response = await toolService.createTool(toolData);
      if (response.error) {
        setErrors({ submit: response.error });
        return;
      }

      toast.success("Tool successfully added!");
      handleToolReset();
    } catch (error) {
      console.error("Error adding tool:", error);
      setErrors({ submit: "Failed to add tool. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryReset = () => {
    setInventoryFormData({
      name: "",
      category: "",
      genericName: "",
      quantityBox: "",
      quantityUnit: "",
      costPerUnit: "",
      costPerBox: "",
      expirationDate: "",
      minThreshold: "",
      minThresholdType: "unit",
      quantityPerBox: "",
    });
  };

  const handleToolReset = () => {
    setToolFormData({
      name: "",
      category: "",
      quantity: "",
      condition: "good",
      notes: "",
    });
  };

  return (
    <MainTemplate>
      <div className="flex justify-start mb-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Inventory Management
        </button>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setAddMode("inventory");
                setErrors({});
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                addMode === "inventory"
                  ? "bg-red-800 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Add Inventory Item
            </button>
            <button
              onClick={() => {
                setAddMode("tool");
                setErrors({});
              }}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                addMode === "tool"
                  ? "bg-red-800 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Add Tool
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {addMode === "inventory"
              ? "Add New Inventory Item"
              : "Add New Tool"}
          </h2>

          {/* Inventory Form */}
          {addMode === "inventory" && (
            <form onSubmit={handleInventorySubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={inventoryFormData.name}
                    onChange={handleInventoryInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={inventoryFormData.category}
                    onChange={handleInventoryInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name (if applicable)
                  </label>
                  <input
                    type="text"
                    name="genericName"
                    value={inventoryFormData.genericName}
                    onChange={handleInventoryInputChange}
                    className="w-full px-3 py-2 border rounded-md border-gray-300"
                  />
                </div>
              </div>

              {/* Quantity Mode Toggle */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quantity Mode
                </h3>
                <div className="flex space-x-6">
                  <label>
                    <input
                      type="radio"
                      name="quantityMode"
                      value="box"
                      checked={quantityMode === "box"}
                      onChange={() => {
                        setQuantityMode("box");
                        setInventoryFormData((prev) => ({
                          ...prev,
                          quantityUnit: "",
                          costPerUnit: "",
                        }));
                      }}
                    />
                    <span className="ml-2">Box</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="quantityMode"
                      value="unit"
                      checked={quantityMode === "unit"}
                      onChange={() => {
                        setQuantityMode("unit");
                        setInventoryFormData((prev) => ({
                          ...prev,
                          quantityBox: "",
                          quantityPerBox: "",
                          costPerBox: "",
                        }));
                      }}
                    />
                    <span className="ml-2">Unit</span>
                  </label>
                </div>
              </div>

              {/* Quantity Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quantity Information
                </h3>
                {quantityMode === "box" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Box Quantity *
                      </label>
                      <input
                        type="number"
                        name="quantityBox"
                        value={inventoryFormData.quantityBox}
                        onChange={handleInventoryInputChange}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.quantityBox
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.quantityBox && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.quantityBox}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity Per Box *
                      </label>
                      <input
                        type="number"
                        name="quantityPerBox"
                        value={inventoryFormData.quantityPerBox}
                        onChange={handleInventoryInputChange}
                        min="0"
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.quantityPerBox
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.quantityPerBox && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.quantityPerBox}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantityUnit"
                      value={inventoryFormData.quantityUnit}
                      onChange={handleInventoryInputChange}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.quantityUnit
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.quantityUnit && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantityUnit}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Cost Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Cost Information
                </h3>
                {quantityMode === "box" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost per Box *
                    </label>
                    <input
                      type="number"
                      name="costPerBox"
                      value={inventoryFormData.costPerBox}
                      onChange={handleInventoryInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.costPerBox ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.costPerBox && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.costPerBox}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost per Unit *
                    </label>
                    <input
                      type="number"
                      name="costPerUnit"
                      value={inventoryFormData.costPerUnit}
                      onChange={handleInventoryInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.costPerUnit
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.costPerUnit && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.costPerUnit}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      name="expirationDate"
                      value={inventoryFormData.expirationDate}
                      onChange={handleInventoryInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Threshold
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="minThreshold"
                        value={inventoryFormData.minThreshold}
                        onChange={handleInventoryInputChange}
                        min="0"
                        className={`flex-1 px-3 py-2 border rounded-md ${
                          errors.minThreshold
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <select
                        name="minThresholdType"
                        value={inventoryFormData.minThresholdType}
                        onChange={handleInventoryInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="unit">Unit</option>
                        <option value="box">Box</option>
                        <option value="percentage">%</option>
                      </select>
                    </div>
                    {errors.minThreshold && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.minThreshold}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleInventoryReset}
                  disabled={loading}
                  className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#680000] text-white rounded-md hover:bg-red-900 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          )}

          {/* Tool Form */}
          {addMode === "tool" && (
            <form onSubmit={handleToolSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={toolFormData.name}
                    onChange={handleToolInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={toolFormData.category}
                    onChange={handleToolInputChange}
                    placeholder="e.g., Surgical Instruments"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={toolFormData.quantity}
                    onChange={handleToolInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.quantity ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={toolFormData.condition}
                    onChange={handleToolInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.condition ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="damaged">Damaged</option>
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.condition}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={toolFormData.notes}
                  onChange={handleToolInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Additional information about the tool..."
                />
              </div>

              {/* Actions */}
              <div className="border-t pt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleToolReset}
                  disabled={loading}
                  className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#680000] text-white rounded-md hover:bg-red-900 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Tool"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainTemplate>
  );
};

export default AddItem;
