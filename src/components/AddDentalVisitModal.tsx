import { useState } from "react";
import { X } from "lucide-react";
import { dentalVisitService } from "@/services/dentalVisitService";

const DENTAL_COMPLAINTS = [
  "Toothache",
  "Tooth Sensitivity",
  "Bleeding Gums",
  "Swollen Gums",
  "Loose Tooth",
  "Broken / Chipped Tooth",
  "Missing Tooth",
  "Tooth Decay / Cavity",
  "Bad Breath / Halitosis",
  "Jaw Pain / TMJ",
  "Mouth Sores / Ulcers",
  "Swelling in Mouth or Face",
  "Difficulty Chewing",
  "Difficulty Opening Mouth",
  "Tooth Discoloration / Staining",
  "Gum Recession",
  "Impacted Wisdom Tooth",
  "Post-Extraction Pain",
  "Denture Problems",
  "Orthodontic Concern",
];

interface AddDentalVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

const AddDentalVisitModal = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AddDentalVisitModalProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
    treatment: "",
    complaints: [] as string[],
    complaints_other: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggleComplaint = (complaint: string) => {
    const updated = formData.complaints.includes(complaint)
      ? formData.complaints.filter((c) => c !== complaint)
      : [...formData.complaints, complaint];
    setFormData({ ...formData, complaints: updated });
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: "",
      treatment: "",
      complaints: [],
      complaints_other: "",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await dentalVisitService.create({
        patient_id: patientId,
        date: formData.date,
        time: formData.time,
        complaints: formData.complaints,
        complaints_other: formData.complaints_other || null,
        treatment: formData.treatment || null,
        notes: formData.notes || null,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Error adding dental visit:", err);
      setError("Failed to add record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Dental Visit
          </h2>
          <button
            onClick={handleClose}
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

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
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
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chief Complaints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chief Dental Complaints
            </label>
            <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-52 overflow-y-auto">
              {DENTAL_COMPLAINTS.map((complaint) => (
                <label
                  key={complaint}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={formData.complaints.includes(complaint)}
                    onChange={() => toggleComplaint(complaint)}
                    className="accent-red-900 w-4 h-4 rounded"
                  />
                  {complaint}
                </label>
              ))}
            </div>

            {/* Others */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Others
              </label>
              <textarea
                value={formData.complaints_other}
                onChange={(e) =>
                  setFormData({ ...formData, complaints_other: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Specify other dental complaints..."
              />
            </div>
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Treatment
            </label>
            <textarea
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="Enter treatment details..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="Enter additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
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

export default AddDentalVisitModal;
