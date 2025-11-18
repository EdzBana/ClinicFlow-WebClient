import { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import {
  medicalHistoryService,
  physicalExamService,
} from "@/services/physicalExamService";
import type {
  MedicalHistory,
  PhysicalExamRecord,
} from "@/types/physicalExamTypes";
import EditMedicalHistoryModal from "./EditMedicalHistoryModal";
import AddPhysicalExamModal from "./AddPhysicalExamModal";

interface PhysicalRecordTabProps {
  patientId: string;
}

const PhysicalRecordTab = ({ patientId }: PhysicalRecordTabProps) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(
    null
  );
  const [examRecords, setExamRecords] = useState<PhysicalExamRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);

  const fetchMedicalHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await medicalHistoryService.getByPatientId(patientId);
      setMedicalHistory(data);
    } catch (err) {
      console.error("Error fetching medical history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchExamRecords = async () => {
    setIsLoadingExams(true);
    try {
      const data = await physicalExamService.getByPatientId(patientId);
      setExamRecords(data);
    } catch (err) {
      console.error("Error fetching exam records:", err);
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchMedicalHistory();
    fetchExamRecords();
  }, [patientId]);

  const getCheckedConditions = () => {
    if (!medicalHistory) return [];
    const conditions = [
      { key: "allergy", label: "Allergy" },
      { key: "asthma", label: "Asthma" },
      { key: "chicken_pox", label: "Chicken Pox" },
      { key: "bone_problem", label: "Bone Problem" },
      { key: "diabetes", label: "Diabetes" },
      { key: "kidney_disease", label: "Kidney Disease" },
      { key: "lung_disease", label: "Lung Disease" },
      { key: "vision_problem", label: "Vision Problem" },
      { key: "emotional_episode", label: "Emotional Episode" },
      { key: "cancer", label: "Cancer" },
      { key: "chest_pain", label: "Chest Pain" },
      { key: "anemia", label: "Anemia" },
      { key: "convulsion", label: "Convulsion" },
      { key: "dengue", label: "Dengue" },
      { key: "epilepsy", label: "Epilepsy" },
      { key: "loss_of_consciousness", label: "Loss of Consciousness" },
      { key: "skin_disease", label: "Skin Disease" },
      { key: "liver_disease", label: "Liver Disease" },
      { key: "hypertension", label: "Hypertension" },
    ];

    return conditions.filter((c) => (medicalHistory as any)[c.key]);
  };

  return (
    <div className="space-y-6">
      {/* Medical History Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Medical History
          </h3>
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{medicalHistory ? "Edit" : "Add"} History</span>
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading medical history...</p>
          </div>
        ) : medicalHistory ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Family History (✓ = Present, ✗ = None):
            </p>
            <div className="grid grid-cols-3 gap-2">
              {getCheckedConditions().map((condition) => (
                <div key={condition.key} className="text-sm text-gray-900">
                  ✓ {condition.label}
                </div>
              ))}
            </div>
            {medicalHistory.others && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Others:</p>
                <p className="text-sm text-gray-900">{medicalHistory.others}</p>
              </div>
            )}
            {getCheckedConditions().length === 0 && !medicalHistory.others && (
              <p className="text-sm text-gray-500 italic">
                No conditions recorded
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500 italic">No medical history recorded</p>
            <button
              onClick={() => setHistoryModalOpen(true)}
              className="mt-3 text-red-900 hover:text-red-800 font-medium text-sm"
            >
              Add Medical History
            </button>
          </div>
        )}
      </div>

      {/* Physical Examination Records Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Physical Examination Records ({examRecords.length})
          </h3>
          <button
            onClick={() => setExamModalOpen(true)}
            className="px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
        </div>

        {isLoadingExams ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading examination records...</p>
          </div>
        ) : examRecords.length > 0 ? (
          <div className="space-y-4">
            {examRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {record.purpose && (
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {record.purpose}
                      </h4>
                    )}
                    <p className="text-sm text-gray-600">
                      {record.exam_date
                        ? new Date(record.exam_date).toLocaleDateString()
                        : "No date"}{" "}
                      {record.control_number &&
                        `• Control #${record.control_number}`}
                    </p>
                  </div>
                </div>

                {/* Vitals */}
                {(record.bp || record.pr || record.rr || record.temp) && (
                  <div className="grid grid-cols-4 gap-4 mb-3 bg-gray-50 p-3 rounded">
                    {record.bp && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">
                          BP:
                        </span>
                        <p className="text-sm text-gray-900">{record.bp}</p>
                      </div>
                    )}
                    {record.pr && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">
                          PR:
                        </span>
                        <p className="text-sm text-gray-900">{record.pr}</p>
                      </div>
                    )}
                    {record.rr && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">
                          RR:
                        </span>
                        <p className="text-sm text-gray-900">{record.rr}</p>
                      </div>
                    )}
                    {record.temp && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">
                          Temp:
                        </span>
                        <p className="text-sm text-gray-900">{record.temp}°</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Lab Results */}
                <div className="space-y-1 text-sm">
                  {(record.cbc_normal || record.cbc_abnormal) && (
                    <p className="text-gray-700">
                      <span className="font-medium">CBC:</span>{" "}
                      {record.cbc_normal ? "Normal" : "Abnormal"}
                    </p>
                  )}
                  {(record.chest_xray_normal || record.chest_xray_abnormal) && (
                    <p className="text-gray-700">
                      <span className="font-medium">Chest X-Ray:</span>{" "}
                      {record.chest_xray_normal ? "Normal" : "Abnormal"}
                    </p>
                  )}
                  {(record.urinalysis_normal || record.urinalysis_abnormal) && (
                    <p className="text-gray-700">
                      <span className="font-medium">Urinalysis:</span>{" "}
                      {record.urinalysis_normal ? "Normal" : "Abnormal"}
                    </p>
                  )}
                  {(record.fecalysis_normal || record.fecalysis_abnormal) && (
                    <p className="text-gray-700">
                      <span className="font-medium">Fecalysis:</span>{" "}
                      {record.fecalysis_normal ? "Normal" : "Abnormal"}
                    </p>
                  )}
                  {(record.ecg_normal || record.ecg_abnormal) && (
                    <p className="text-gray-700">
                      <span className="font-medium">ECG:</span>{" "}
                      {record.ecg_normal ? "Normal" : "Abnormal"}
                    </p>
                  )}
                  {(record.hbsag_reactive || record.hbsag_nonreactive) && (
                    <p className="text-gray-700">
                      <span className="font-medium">HBsAg:</span>{" "}
                      {record.hbsag_reactive ? "Reactive" : "Nonreactive"}
                    </p>
                  )}
                  {record.others_lab && (
                    <p className="text-gray-700">
                      <span className="font-medium">Others:</span>{" "}
                      {record.others_lab}
                    </p>
                  )}
                </div>

                {/* Notes and Remarks */}
                {record.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Notes:
                    </p>
                    <p className="text-sm text-gray-700">{record.notes}</p>
                  </div>
                )}
                {record.remarks && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Remarks:
                    </p>
                    <p className="text-sm text-gray-700">{record.remarks}</p>
                  </div>
                )}

                {/* Evaluated By */}
                {record.evaluated_by && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Evaluated by:{" "}
                      <span className="font-medium">{record.evaluated_by}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-400 italic">
              No physical examination records found.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditMedicalHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={patientId}
        existingHistory={medicalHistory}
        onSuccess={fetchMedicalHistory}
      />
      <AddPhysicalExamModal
        isOpen={examModalOpen}
        onClose={() => setExamModalOpen(false)}
        patientId={patientId}
        onSuccess={fetchExamRecords}
      />
    </div>
  );
};

export default PhysicalRecordTab;
