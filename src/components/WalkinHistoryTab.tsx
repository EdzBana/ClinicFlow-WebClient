import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { medicalWalkinService } from "@/services/medicalDentalService";
import type { MedicalWalkinHistory } from "@/types/records";
import AddWalkinHistoryModal from "./AddWalkinHistoryModal";

interface WalkinHistoryTabProps {
  patientId: string;
}

const WalkinHistoryTab = ({ patientId }: WalkinHistoryTabProps) => {
  const [records, setRecords] = useState<MedicalWalkinHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await medicalWalkinService.getByPatientId(patientId);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching walk-in history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading walk-in history...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Walk-in History ({records.length})
        </h3>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      {records.length > 0 ? (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {record.date
                      ? new Date(record.date).toLocaleDateString()
                      : "No date"}
                    {record.time && (
                      <span className="text-gray-600 ml-2">
                        at {record.time}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  Added {new Date(record.created_at).toLocaleDateString()}
                </span>
              </div>
              {record.complaints_and_vital && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Chief Complaints & Vital Signs:
                  </p>
                  <p className="text-sm text-gray-600">
                    {record.complaints_and_vital}
                  </p>
                </div>
              )}
              {record.treatment && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Treatment:
                  </p>
                  <p className="text-sm text-gray-600">{record.treatment}</p>
                </div>
              )}

              {record.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                  <p className="text-sm text-gray-600">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 italic">
            No walk-in history records found.
          </p>
        </div>
      )}

      <AddWalkinHistoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        onSuccess={fetchRecords}
      />
    </div>
  );
};

export default WalkinHistoryTab;
