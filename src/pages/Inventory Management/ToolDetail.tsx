import MainTemplate from "@/components/MainTemplate";
import { ArrowLeft, Wrench } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toolService } from "@/services/toolService";
import type { Tool } from "@/types/tools";
import RecordSearch from "@/components/RecordSearch";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

const CONDITION_COLORS: Record<string, string> = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-orange-100 text-orange-800",
  damaged: "bg-red-100 text-red-800",
};

const ToolCard = ({
  tool,
  onEdit,
  onDelete,
}: {
  tool: Tool;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-gray-200 rounded-lg p-6 mb-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
          <Wrench className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{tool.name}</h1>
          <p className="text-gray-600 text-lg mb-1">{tool.category}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                CONDITION_COLORS[tool.condition] || "bg-gray-100 text-gray-800"
              }`}
            >
              {tool.condition.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
        >
          Edit Tool
        </button>
        <button
          onClick={onDelete}
          className="px-6 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200"
        >
          Delete Tool
        </button>
      </div>
    </div>

    {/* Tool Summary */}
    <div className="mt-6 pt-4 border-t border-gray-300">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Quantity</p>
          <p className="text-xl font-semibold text-gray-900">
            {tool.quantity || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Condition</p>
          <p className="text-xl font-semibold text-gray-900">
            {tool.condition}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Received At</p>
          <p className="text-xl font-semibold text-gray-900">
            {new Date(tool.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {tool.notes && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Notes</p>
          <p className="text-base text-gray-800">{tool.notes}</p>
        </div>
      )}
    </div>
  </div>
);

// Edit Tool Modal Component
const EditToolModal = ({
  isOpen,
  onClose,
  tool,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  tool: Tool;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: tool.name,
    category: tool.category,
    quantity: tool.quantity.toString(),
    condition: tool.condition as
      | "excellent"
      | "good"
      | "fair"
      | "poor"
      | "damaged",
    notes: tool.notes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await toolService.updateTool(tool.id, {
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity),
        condition: formData.condition as
          | "excellent"
          | "good"
          | "fair"
          | "poor"
          | "damaged",
        notes: formData.notes || undefined,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      alert("Tool updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to update tool");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Tool</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tool Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Condition *
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  condition: e.target.value as
                    | "excellent"
                    | "good"
                    | "fair"
                    | "poor"
                    | "damaged",
                })
              }
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ToolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tool, setTool] = useState<Tool | null>(null);
  const [isLoadingTool, setIsLoadingTool] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchTool = useCallback(async () => {
    if (!id) return;
    setIsLoadingTool(true);
    try {
      const response = await toolService.getToolDetails(id);
      if (response.data) {
        setTool(response.data);
      } else {
        setTool(null);
      }
    } catch (err) {
      console.error("Error fetching tool:", err);
      setTool(null);
    } finally {
      setIsLoadingTool(false);
    }
  }, [id]);

  const handleToolClick = useCallback(
    (selectedTool: Tool) => {
      navigate(`/tools-management/view-tool/${selectedTool.id}`);
    },
    [navigate]
  );

  const searchTools = useCallback(
    (query: string) => toolService.searchTools(query, 10),
    []
  );

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      const response = await toolService.deleteTool(id);
      if (response.error) {
        alert("Error: " + response.error);
      } else {
        alert("Tool deleted successfully");
        navigate("/tools-management");
      }
    } catch (err) {
      console.error("Error deleting tool:", err);
      alert("Failed to delete tool");
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleEditSuccess = () => {
    fetchTool();
  };

  useEffect(() => {
    fetchTool();
  }, [fetchTool]);

  return (
    <MainTemplate>
      <div className="flex justify-start mb-6">
        <button
          type="button"
          onClick={() => navigate("/tools-management")}
          className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tools Management
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-center items-start mb-8">
        <RecordSearch<Tool>
          placeholder="Enter Tool Name"
          searchFunction={searchTools}
          onSelect={handleToolClick}
          getKey={(tool) => tool.id}
          renderItem={(tool) => (
            <>
              <div className="font-medium text-gray-900">{tool.name}</div>
              <div className="text-sm text-gray-600">
                {tool.category} • {tool.condition}
              </div>
            </>
          )}
        />
      </div>

      {/* Tool Info */}
      {isLoadingTool ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Loading tool...</p>
        </div>
      ) : tool ? (
        <ToolCard
          tool={tool}
          onEdit={() => setEditModalOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Tool not found</p>
        </div>
      )}

      {/* Modals */}
      {tool && (
        <>
          <EditToolModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            tool={tool}
            onSuccess={handleEditSuccess}
          />
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteConfirm}
            itemName={tool.name}
          />
        </>
      )}
    </MainTemplate>
  );
};

export default ToolDetail;
