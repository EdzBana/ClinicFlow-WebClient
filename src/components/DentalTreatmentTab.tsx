import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { dentalTreatmentService } from "@/services/medicalDentalService";
import type { DentalTreatmentRecord } from "@/types/records";
import AddDentalTreatmentModal from "./AddDentalTreatmentModal";

interface DentalTreatmentTabProps {
  patientId: string;
}

const DentalTreatmentTab = ({ patientId }: DentalTreatmentTabProps) => {
  const [records, setRecords] = useState<DentalTreatmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await dentalTreatmentService.getByPatientId(patientId);
      setRecords(data);
    } catch (err) {
      console.error("Error fetching dental treatments:", err);
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
        <p className="text-gray-400">Loading dental treatment records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Dental Treatment Records ({records.length})
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Tooth No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Procedure
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Dentist
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.date
                      ? new Date(record.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.tooth_no || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.procedure || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.dentist || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 italic">
            No dental treatment records found.
          </p>
        </div>
      )}

      <AddDentalTreatmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        onSuccess={fetchRecords}
      />
    </div>
  );
};

export default DentalTreatmentTab;
