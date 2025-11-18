import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  apiClient,
  type PatientRecord,
  type PatientProfile,
} from "@/services/api";
import AddRecordsModal from "./AddRecordsModal";
import { useAuth } from "@/hooks/useAuth";

interface FileRecordsTabProps {
  patientId: string;
  profile: PatientProfile;
}

const FileRecordsTab = ({ patientId, profile }: FileRecordsTabProps) => {
  const { userType } = useAuth();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingFiles, setViewingFiles] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patient-records`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: "getRecords",
            patientId: patientId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.records) {
        const filteredRecords = data.records.filter(
          (r: PatientRecord) => !userType || r.record_type === userType
        );
        setRecords(filteredRecords);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, userType]);

  const handleViewFile = useCallback(
    async (recordId: string) => {
      if (viewingFiles.has(recordId)) return;

      setViewingFiles((prev) => new Set(prev).add(recordId));

      try {
        const response = await apiClient.getFileSignedUrl(recordId, 7200);

        if (response.error) {
          alert("Error: " + response.error);
          return;
        }

        if (response.data?.signedUrl) {
          window.open(response.data.signedUrl, "_blank");
        } else {
          alert("No signed URL returned");
        }
      } catch (error) {
        console.error("Error viewing file:", error);
        alert("Failed to open file");
      } finally {
        setViewingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(recordId);
          return newSet;
        });
      }
    },
    [viewingFiles]
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Loading file records...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          File Records ({records.length})
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
          {records.map((record) => {
            const isViewing = viewingFiles.has(record.id);

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {record.file_name}
                  </h3>
                  {record.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {record.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded {new Date(record.created_at).toLocaleDateString()}
                    {record.record_type && (
                      <span className="ml-2 text-blue-600">
                        • {record.record_type}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleViewFile(record.id)}
                  disabled={isViewing}
                  className={`px-3 py-1 text-sm rounded min-w-[80px] ${
                    isViewing
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : "bg-red-900 text-white hover:bg-red-800"
                  } transition-colors`}
                >
                  {isViewing ? "Loading..." : "View"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400 italic">No file records found.</p>
        </div>
      )}

      <AddRecordsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patient={profile}
        onSuccess={fetchRecords}
      />
    </div>
  );
};

export default FileRecordsTab;
