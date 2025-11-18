import { useState } from "react";
import { X } from "lucide-react";
import { dentalTreatmentService } from "@/services/medicalDentalService";
import type { CreateDentalTreatmentRecord } from "@/types/records";

interface AddDentalTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

const AddDentalTreatmentModal = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AddDentalTreatmentModalProps) => {
  const [formData, setFormData] = useState<
    Omit<CreateDentalTreatmentRecord, "patient_id">
  >({
    date: new Date().toISOString().split("T")[0],
    tooth_no: "",
    procedure: "",
    dentist: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await dentalTreatmentService.create({
        patient_id: patientId,
        ...formData,
      });

      onSuccess();
      onClose();
      setFormData({
        date: new Date().toISOString().split("T")[0],
        tooth_no: "",
        procedure: "",
        dentist: "",
      });
    } catch (err) {
      console.error("Error adding dental treatment:", err);
      setError("Failed to add record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Dental Treatment Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tooth Number
            </label>
            <input
              type="text"
              value={formData.tooth_no}
              onChange={(e) =>
                setFormData({ ...formData, tooth_no: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="e.g., #14, 2.1, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure
            </label>
            <textarea
              value={formData.procedure}
              onChange={(e) =>
                setFormData({ ...formData, procedure: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="Enter procedure details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dentist
            </label>
            <input
              type="text"
              value={formData.dentist}
              onChange={(e) =>
                setFormData({ ...formData, dentist: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="Enter dentist name..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDentalTreatmentModal;
