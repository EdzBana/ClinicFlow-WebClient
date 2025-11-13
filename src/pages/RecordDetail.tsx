import MainTemplate from "@/components/MainTemplate";
import { User } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  apiClient,
  type PatientProfile,
  type PatientRecord,
} from "@/services/api";
import RecordSearch from "@/components/RecordSearch";
import AddProfileModal from "@/components/AddProfileModal";
import AddRecordsModal from "@/components/AddRecordsModal";
import { useAuth } from "@/hooks/useAuth";

const ProfileCard = ({
  profile,
  onAddRecord,
}: {
  profile: PatientProfile;
  onAddRecord: () => void;
}) => (
  <div className="bg-gray-200 rounded-lg p-6 mb-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.last_name}, {profile.first_name}
          </h1>
          <p className="text-gray-600 text-lg mb-1">{profile.id_number}</p>
          <p className="text-gray-600 text-lg">{profile.dept_name}</p>
        </div>
      </div>

      <button
        onClick={onAddRecord}
        className="px-6 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200"
      >
        Add Records
      </button>
    </div>
  </div>
);

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [viewingFiles, setViewingFiles] = useState<Set<string>>(new Set()); // Track which files are being loaded
  const [modalOpen, setModalOpen] = useState(false);
  const [recordsModalOpen, setRecordsModalOpen] = useState(false);

  /** Fetch profile by ID */
  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setIsLoadingProfile(true);
    try {
      const response = await apiClient.getPatientProfileDetails(id);
      if (response.data?.profile) setProfile(response.data.profile);
      else setProfile(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [id]);

  /** Fetch patient records WITHOUT signed URLs (faster) */
  const fetchRecords = useCallback(async () => {
    if (!id) return;
    setIsLoadingRecords(true);
    try {
      // Use the existing getRecords method from your edge function
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
            patientId: id,
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
      setIsLoadingRecords(false);
    }
  }, [id, userType]);

  /** Handle viewing a specific file */
  const handleViewFile = useCallback(
    async (recordId: string) => {
      // Prevent multiple clicks
      if (viewingFiles.has(recordId)) return;

      setViewingFiles((prev) => new Set(prev).add(recordId));

      try {
        const response = await apiClient.getFileSignedUrl(recordId, 7200); // 2 hours expiry

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

  const handleRecordUploadSuccess = useCallback(() => {
    fetchRecords(); // Refresh after upload
  }, [fetchRecords]);

  const handleProfileClick = useCallback(
    (selectedProfile: PatientProfile) => {
      navigate(`/records/${selectedProfile.id}`);
    },
    [navigate]
  );

  const searchProfiles = useCallback(
    (query: string) => apiClient.searchPatientProfiles(query, 10),
    []
  );

  useEffect(() => {
    fetchProfile();
    fetchRecords();
  }, [fetchProfile, fetchRecords]);

  return (
    <MainTemplate initialPage="Records">
      {/* Search Bar */}
      <div className="flex justify-center items-start mb-8">
        <RecordSearch<PatientProfile>
          placeholder="Enter Name or ID"
          searchFunction={searchProfiles}
          onSelect={handleProfileClick}
          getKey={(profile) => profile.id}
          renderItem={(profile) => (
            <>
              <div className="font-medium text-gray-900">
                {profile.last_name}, {profile.first_name}
              </div>
              <div className="text-sm text-gray-600">
                {profile.id_number} • {profile.dept_name}
              </div>
            </>
          )}
        />

        <button
          className="ml-5 px-4 py-2 bg-red-900 text-white font-medium rounded-lg hover:bg-red-800 transition-colors duration-200"
          onClick={() => setModalOpen(true)}
        >
          Add Profile
        </button>
      </div>

      <AddProfileModal modalOpen={modalOpen} setModalOpen={setModalOpen} />

      {/* Profile Info */}
      {isLoadingProfile ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      ) : profile ? (
        <ProfileCard
          profile={profile}
          onAddRecord={() => setRecordsModalOpen(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Profile not found</p>
        </div>
      )}

      {/* Records Section */}
      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Available Records
            </h2>
            {profile && (
              <span className="text-sm text-gray-500">
                {records.length} record{records.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>

          {isLoadingRecords ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading records...</p>
            </div>
          ) : records.length > 0 ? (
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
                        Uploaded{" "}
                        {new Date(record.created_at).toLocaleDateString()}
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
              <p className="text-gray-400 italic">
                {profile
                  ? "No records found for this patient."
                  : "Select a patient to view records."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddProfileModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
      {profile && (
        <AddRecordsModal
          isOpen={recordsModalOpen}
          onClose={() => setRecordsModalOpen(false)}
          patient={profile}
          onSuccess={handleRecordUploadSuccess}
        />
      )}
    </MainTemplate>
  );
};

export default RecordDetail;
