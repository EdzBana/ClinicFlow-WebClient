import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { medicalHistoryService } from "@/services/physicalExamService";
import type {
  MedicalHistory,
  CreateMedicalHistory,
} from "@/types/physicalExamTypes";

interface EditMedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  existingHistory: MedicalHistory | null;
  onSuccess: () => void;
}

const EditMedicalHistoryModal = ({
  isOpen,
  onClose,
  patientId,
  existingHistory,
  onSuccess,
}: EditMedicalHistoryModalProps) => {
  const [formData, setFormData] = useState<
    Omit<CreateMedicalHistory, "patient_id">
  >({
    allergy: false,
    asthma: false,
    chicken_pox: false,
    bone_problem: false,
    diabetes: false,
    kidney_disease: false,
    lung_disease: false,
    vision_problem: false,
    emotional_episode: false,
    cancer: false,
    chest_pain: false,
    anemia: false,
    convulsion: false,
    dengue: false,
    epilepsy: false,
    loss_of_consciousness: false,
    skin_disease: false,
    liver_disease: false,
    hypertension: false,
    others: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingHistory) {
      setFormData({
        allergy: existingHistory.allergy,
        asthma: existingHistory.asthma,
        chicken_pox: existingHistory.chicken_pox,
        bone_problem: existingHistory.bone_problem,
        diabetes: existingHistory.diabetes,
        kidney_disease: existingHistory.kidney_disease,
        lung_disease: existingHistory.lung_disease,
        vision_problem: existingHistory.vision_problem,
        emotional_episode: existingHistory.emotional_episode,
        cancer: existingHistory.cancer,
        chest_pain: existingHistory.chest_pain,
        anemia: existingHistory.anemia,
        convulsion: existingHistory.convulsion,
        dengue: existingHistory.dengue,
        epilepsy: existingHistory.epilepsy,
        loss_of_consciousness: existingHistory.loss_of_consciousness,
        skin_disease: existingHistory.skin_disease,
        liver_disease: existingHistory.liver_disease,
        hypertension: existingHistory.hypertension,
        others: existingHistory.others || "",
      });
    }
  }, [existingHistory]);

  const handleCheckboxChange = (field: keyof typeof formData) => {
    if (typeof formData[field] === "boolean") {
      setFormData({ ...formData, [field]: !formData[field] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await medicalHistoryService.upsert({
        patient_id: patientId,
        ...formData,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving medical history:", err);
      setError("Failed to save medical history. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const conditions = [
    { key: "allergy" as const, label: "Allergy" },
    { key: "asthma" as const, label: "Asthma" },
    { key: "chicken_pox" as const, label: "Chicken Pox" },
    { key: "bone_problem" as const, label: "Bone Problem" },
    { key: "diabetes" as const, label: "Diabetes" },
    { key: "kidney_disease" as const, label: "Kidney Disease" },
    { key: "lung_disease" as const, label: "Lung Disease" },
    { key: "vision_problem" as const, label: "Vision Problem" },
    { key: "emotional_episode" as const, label: "Emotional Episode" },
    { key: "cancer" as const, label: "Cancer" },
    { key: "chest_pain" as const, label: "Chest Pain" },
    { key: "anemia" as const, label: "Anemia" },
    { key: "convulsion" as const, label: "Convulsion" },
    { key: "dengue" as const, label: "Dengue" },
    { key: "epilepsy" as const, label: "Epilepsy" },
    { key: "loss_of_consciousness" as const, label: "Loss of Consciousness" },
    { key: "skin_disease" as const, label: "Skin Disease" },
    { key: "liver_disease" as const, label: "Liver Disease" },
    { key: "hypertension" as const, label: "Hypertension" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Medical History
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

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Check all conditions that apply (Put ✓ if there is Family history,
              and ✗ for none):
            </p>
            <div className="grid grid-cols-3 gap-3">
              {conditions.map((condition) => (
                <label
                  key={condition.key}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={formData[condition.key] as boolean}
                    onChange={() => handleCheckboxChange(condition.key)}
                    className="w-4 h-4 text-red-900 border-gray-300 rounded focus:ring-red-900"
                  />
                  <span className="text-sm text-gray-700">
                    {condition.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Others (Specify)
            </label>
            <input
              type="text"
              value={formData.others}
              onChange={(e) =>
                setFormData({ ...formData, others: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-900 focus:border-transparent"
              placeholder="Specify other conditions..."
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
              {isSubmitting ? "Saving..." : "Save Medical History"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicalHistoryModal;
