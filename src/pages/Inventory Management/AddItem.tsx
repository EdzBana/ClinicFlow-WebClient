import { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import { useAuth } from "@/hooks/useAuth";
import {
  apiClient,
  type CreateItemRequest,
  type ItemCategory,
} from "@/services/api";
import { logout } from "@/auth/auth";
import { ArrowLeft } from "lucide-react";

const AddItem = () => {
  const { userType } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
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

  // UI state
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [success, setSuccess] = useState(false);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Item name is required";
    if (!formData.category) newErrors.category = "Category is required";

    if (quantityMode === "box") {
      if (!formData.quantityBox || +formData.quantityBox <= 0) {
        newErrors.quantityBox = "Box quantity is required and must be > 0";
      }
      if (!formData.quantityPerBox || +formData.quantityPerBox <= 0) {
        newErrors.quantityPerBox =
          "Quantity per box is required and must be > 0";
      }
      if (!formData.costPerBox || +formData.costPerBox <= 0) {
        newErrors.costPerBox = "Cost per box is required and must be > 0";
      }
    }

    if (quantityMode === "unit") {
      if (!formData.quantityUnit || +formData.quantityUnit <= 0) {
        newErrors.quantityUnit = "Unit quantity is required and must be > 0";
      }
      if (!formData.costPerUnit || +formData.costPerUnit <= 0) {
        newErrors.costPerUnit = "Cost per unit is required and must be > 0";
      }
    }

    if (formData.minThreshold && +formData.minThreshold < 0) {
      newErrors.minThreshold = "Minimum threshold must be positive";
    }

    return newErrors;
  };

  // Key changes to handleSubmit function in AddItem.tsx

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) {
      alert("Your session has expired. Please log in again.");
      logout();
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const itemData: CreateItemRequest = {
        itemType: userType,
        name: formData.name.trim(),
        category: formData.category,
        genericName: formData.genericName.trim() || null,

        // ✅ Box mode: send box data
        quantityBox:
          quantityMode === "box" && formData.quantityBox
            ? parseInt(formData.quantityBox)
            : null,
        quantityPerBox:
          quantityMode === "box" && formData.quantityPerBox
            ? parseInt(formData.quantityPerBox)
            : null, // ✅ Changed: null instead of 1
        costPerBox:
          quantityMode === "box" && formData.costPerBox
            ? parseFloat(formData.costPerBox)
            : null,

        // ✅ Unit mode: send unit data
        quantityUnit:
          quantityMode === "unit" && formData.quantityUnit
            ? parseInt(formData.quantityUnit)
            : null,
        costPerUnit:
          quantityMode === "unit" && formData.costPerUnit
            ? parseFloat(formData.costPerUnit)
            : null,

        expirationDate: formData.expirationDate || null,
        minThreshold: formData.minThreshold
          ? parseInt(formData.minThreshold)
          : 0,
        minThresholdType: formData.minThresholdType as
          | "unit"
          | "box"
          | "percentage",
      };

      const response = await apiClient.createItem(itemData);
      if (response.error) {
        setErrors({ submit: response.error });
        return;
      }

      setSuccess(true);
      handleReset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding item:", error);
      setErrors({ submit: "Failed to add item. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
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
    setErrors({});
    setSuccess(false);
  };

  return (
    <MainTemplate initialPage="Add Item">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Add New Item
          </h2>

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Item added successfully!
            </div>
          )}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  value={formData.category}
                  onChange={handleInputChange}
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
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generic Name (if applicable)
                </label>
                <input
                  type="text"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleInputChange}
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
                      setFormData((prev) => ({
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
                      setFormData((prev) => ({
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
                      value={formData.quantityBox}
                      onChange={handleInputChange}
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
                      value={formData.quantityPerBox}
                      onChange={handleInputChange}
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
                    value={formData.quantityUnit}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.quantityUnit ? "border-red-500" : "border-gray-300"
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
                    value={formData.costPerBox}
                    onChange={handleInputChange}
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
                    value={formData.costPerUnit}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.costPerUnit ? "border-red-500" : "border-gray-300"
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
                    value={formData.expirationDate}
                    onChange={handleInputChange}
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
                      value={formData.minThreshold}
                      onChange={handleInputChange}
                      min="0"
                      className={`flex-1 px-3 py-2 border rounded-md ${
                        errors.minThreshold
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <select
                      name="minThresholdType"
                      value={formData.minThresholdType}
                      onChange={handleInputChange}
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
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#680000] text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainTemplate>
  );
};

export default AddItem;
