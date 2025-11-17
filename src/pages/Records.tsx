import MainTemplate from "@/components/MainTemplate";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import AddProfileModal from "@/components/AddProfileModal";
import { apiClient, type PatientProfile } from "@/services/api";
import RecordSearch from "@/components/RecordSearch";

const SearchBar = RecordSearch;

const Records = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = useCallback(
    (profile: PatientProfile) => {
      navigate(`/records/${profile.id}`);
    },
    [navigate]
  );

  const searchProfiles = (query: string) =>
    apiClient.searchPatientProfiles(query, 10);

  return (
    <MainTemplate>
      <div className="flex justify-center items-start mb-8">
        <SearchBar<PatientProfile>
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
      <div className="flex justify-center align-items-center mt-60">
        <i>
          <h1 className="text-gray-400 text-3xl">Nothing Searched Yet</h1>
        </i>
      </div>
    </MainTemplate>
  );
};

export default Records;
