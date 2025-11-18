import { useState } from "react";
import { X } from "lucide-react";
import { physicalExamService } from "@/services/physicalExamService";
import type { CreatePhysicalExamRecord } from "@/types/physicalExamTypes";

interface AddPhysicalExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

const AddPhysicalExamModal = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AddPhysicalExamModalProps) => {
  const [formData, setFormData] = useState<
    Omit<CreatePhysicalExamRecord, "patient_id">
  >({
    purpose: "",
    bp: "",
    pr: "",
    rr: "",
    temp: "",
    cbc_normal: false,
    cbc_abnormal: false,
    chest_xray_normal: false,
    chest_xray_abnormal: false,
    urinalysis_normal: false,
    urinalysis_abnormal: false,
    fecalysis_normal: false,
    fecalysis_abnormal: false,
    ecg_normal: false,
    ecg_abnormal: false,
    hbsag_reactive: false,
    hbsag_nonreactive: false,
    others_lab: "",
    notes: "",
    remarks: "",
    evaluated_by: "",
    control_number: "",
    exam_date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCheckboxChange = (field: string, group?: string) => {
    if (group) {
      // For mutually exclusive groups (Normal/Abnormal or Reactive/Nonreactive)
      const groupFields = Object.keys(formData).filter((key) =>
        key.startsWith(group)
      );
      const updates: any = {};
      groupFields.forEach((key) => {
        updates[key] = key === field;
      });
      setFormData({ ...formData, ...updates });
    } else {
      setFormData({ ...formData, [field]: !(formData as any)[field] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await physicalExamService.create({
        patient_id: patientId,
        ...formData,
      });

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        purpose: "",
        bp: "",
        pr: "",
        rr: "",
        temp: "",
        cbc_normal: false,
        cbc_abnormal: false,
        chest_xray_normal: false,
        chest_xray_abnormal: false,
        urinalysis_normal: false,
        urinalysis_abnormal: false,
        fecalysis_normal: false,
        fecalysis_abnormal: false,
        ecg_normal: false,
        ecg_abnormal: false,
        hbsag_reactive: false,
        hbsag_nonreactive: false,
        others_lab: "",
        notes: "",
        remarks: "",
        evaluated_by: "",
        control_number: "",
        exam_date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error adding physical exam record:", err);
      setError("Failed to add record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Physical Examination Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Purpose of examination..."
              />
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BP
                </label>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) =>
                    setFormData({ ...formData, bp: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PR
                </label>
                <input
                  type="text"
                  value={formData.pr}
                  onChange={(e) =>
                    setFormData({ ...formData, pr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RR
                </label>
                <input
                  type="text"
                  value={formData.rr}
                  onChange={(e) =>
                    setFormData({ ...formData, rr: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="16"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temp
                </label>
                <input
                  type="text"
                  value={formData.temp}
                  onChange={(e) =>
                    setFormData({ ...formData, temp: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="36.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Date
                </label>
                <input
                  type="date"
                  value={formData.exam_date}
                  onChange={(e) =>
                    setFormData({ ...formData, exam_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Lab Results */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Lab Results</h3>

            {/* CBC */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                CBC
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cbc_normal}
                  onChange={() => handleCheckboxChange("cbc_normal", "cbc")}
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cbc_abnormal}
                  onChange={() => handleCheckboxChange("cbc_abnormal", "cbc")}
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Abnormal</span>
              </label>
            </div>

            {/* Chest X-Ray */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                CHEST X-RAY
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chest_xray_normal}
                  onChange={() =>
                    handleCheckboxChange("chest_xray_normal", "chest_xray")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.chest_xray_abnormal}
                  onChange={() =>
                    handleCheckboxChange("chest_xray_abnormal", "chest_xray")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Abnormal</span>
              </label>
            </div>

            {/* Urinalysis */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                URINALYSIS
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.urinalysis_normal}
                  onChange={() =>
                    handleCheckboxChange("urinalysis_normal", "urinalysis")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.urinalysis_abnormal}
                  onChange={() =>
                    handleCheckboxChange("urinalysis_abnormal", "urinalysis")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Abnormal</span>
              </label>
            </div>

            {/* Fecalysis */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                FECALYSIS
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fecalysis_normal}
                  onChange={() =>
                    handleCheckboxChange("fecalysis_normal", "fecalysis")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.fecalysis_abnormal}
                  onChange={() =>
                    handleCheckboxChange("fecalysis_abnormal", "fecalysis")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Abnormal</span>
              </label>
            </div>

            {/* ECG */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                ECG
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ecg_normal}
                  onChange={() => handleCheckboxChange("ecg_normal", "ecg")}
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Normal</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ecg_abnormal}
                  onChange={() => handleCheckboxChange("ecg_abnormal", "ecg")}
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Abnormal</span>
              </label>
            </div>

            {/* HBsAg */}
            <div className="flex items-center space-x-6">
              <span className="w-32 text-sm font-medium text-gray-700">
                HBsAg
              </span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hbsag_reactive}
                  onChange={() =>
                    handleCheckboxChange("hbsag_reactive", "hbsag")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Reactive</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hbsag_nonreactive}
                  onChange={() =>
                    handleCheckboxChange("hbsag_nonreactive", "hbsag")
                  }
                  className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                />
                <span className="text-sm">Nonreactive</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTHERS
              </label>
              <input
                type="text"
                value={formData.others_lab}
                onChange={(e) =>
                  setFormData({ ...formData, others_lab: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Other lab results..."
              />
            </div>
          </div>

          {/* Additional Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                placeholder="Remarks..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluated By
                </label>
                <input
                  type="text"
                  value={formData.evaluated_by}
                  onChange={(e) =>
                    setFormData({ ...formData, evaluated_by: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="Physician name..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Control Number
                </label>
                <input
                  type="text"
                  value={formData.control_number}
                  onChange={(e) =>
                    setFormData({ ...formData, control_number: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
                  placeholder="Control #..."
                />
              </div>
            </div>
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

export default AddPhysicalExamModal;
