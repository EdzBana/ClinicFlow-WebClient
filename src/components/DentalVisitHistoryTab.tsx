import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { dentalVisitService } from "@/services/dentalVisitService";
import type { DentalVisitHistory } from "@/types/records";
import AddDentalVisitModal from "./AddDentalVisitModal";

interface DentalVisitHistoryTabProps {
  patientId: string;
}

const DentalVisitHistoryTab = ({ patientId }: DentalVisitHistoryTabProps) => {
  const [records, setRecords] = useState<DentalVisitHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dentalVisitService.getByPatient(patientId);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching dental visit history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading dental visit history...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Dental Visit History ({records.length})
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
              <div className="flex justify-between items-start mb-3">
                <p className="font-medium text-gray-900">
                  {record.date
                    ? new Date(record.date).toLocaleDateString()
                    : "No date"}
                  {record.time && (
                    <span className="text-gray-600 ml-2">at {record.time}</span>
                  )}
                </p>
                <span className="text-xs text-gray-500">
                  Added {new Date(record.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Complaints as badges */}
              {Array.isArray(record.complaints) &&
                record.complaints.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Chief Dental Complaints:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {record.complaints.map((complaint) => (
                        <span
                          key={complaint}
                          className="px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                        >
                          {complaint}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Others free text */}
              {record.complaints_other?.trim() && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Other Complaints:
                  </p>
                  <p className="text-sm text-gray-600">
                    {record.complaints_other}
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
            No dental visit history records found.
          </p>
        </div>
      )}

      <AddDentalVisitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        onSuccess={fetchRecords}
      />
    </div>
  );
};

export default DentalVisitHistoryTab;
