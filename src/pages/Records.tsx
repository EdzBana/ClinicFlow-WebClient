import MainTemplate from "@/components/MainTemplate";
import { useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect, useMemo } from "react";
import AddProfileModal from "@/components/AddProfileModal";
import { apiClient, type PatientProfile } from "@/services/api";
import RecordSearch from "@/components/RecordSearch";
import { supabase } from "@/lib/supabaseClient";
import useRefreshOnFocus from "@/hooks/useRefreshOnFocus";

interface Department {
  id: string;
  name: string;
  code: string;
}

const SearchBar = RecordSearch;

const Records = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [occupationFilter, setOccupationFilter] = useState("");
  const navigate = useNavigate();

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const data = await apiClient.getAllPatientProfiles();
    setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useRefreshOnFocus(fetchProfiles);

  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data } = await supabase.functions.invoke("departments");
      setDepartments(data?.departments || []);
    };
    fetchDepartments();
  }, []);

  const occupations = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.occupation).filter(Boolean))].sort(),
    [profiles],
  );

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesDept = deptFilter ? p.dept_name === deptFilter : true;
      const matchesOccupation = occupationFilter
        ? p.occupation === occupationFilter
        : true;
      return matchesDept && matchesOccupation;
    });
  }, [profiles, deptFilter, occupationFilter]);

  const handleProfileClick = useCallback(
    (profile: PatientProfile) => {
      navigate(`/records/${profile.id}`);
    },
    [navigate],
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

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-900 focus:outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>

        <select
          value={occupationFilter}
          onChange={(e) => setOccupationFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-900 focus:outline-none"
        >
          <option value="">All Occupations</option>
          {occupations.map((occ) => (
            <option key={occ} value={occ}>
              {occ}
            </option>
          ))}
        </select>

        {(deptFilter || occupationFilter) && (
          <button
            onClick={() => {
              setDeptFilter("");
              setOccupationFilter("");
            }}
            className="px-3 py-2 text-sm text-red-900 border border-red-900 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear Filters
          </button>
        )}

        <span className="ml-auto self-center text-sm text-gray-500">
          {filteredProfiles.length} of {profiles.length} profiles
        </span>
      </div>

      <AddProfileModal modalOpen={modalOpen} setModalOpen={setModalOpen} />

      {loading ? (
        <div className="flex justify-center mt-20">
          <p className="text-gray-400 text-lg">Loading profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex justify-center mt-20">
          <p className="text-gray-400 text-lg">
            No profiles match the selected filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-red-900 text-white text-left">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Occupation</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile, index) => (
                <tr
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className={`cursor-pointer hover:bg-red-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {profile.last_name}, {profile.first_name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {profile.id_number}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {profile.dept_name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {profile.occupation ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainTemplate>
  );
};

export default Records;
