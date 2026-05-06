import MainTemplate from "@/components/MainTemplate";
import { User, Edit, ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient, type PatientProfile } from "@/services/api";
import RecordSearch from "@/components/RecordSearch";
import AddProfileModal from "@/components/AddProfileModal";
import EditProfileModal from "@/components/EditProfileModal";
import WalkinHistoryTab from "@/components/WalkinHistoryTab";
import DentalTreatmentTab from "@/components/DentalTreatmentTab";
import PhysicalRecordTab from "@/components/PhysicalRecordTab";
import FileRecordsTab from "@/components/FileRecordsTab";
import { useAuth } from "@/hooks/useAuth";
import { medicalWalkinService } from "@/services/medicalDentalService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity } from "lucide-react";

const WalkinFrequencyChart = ({ patientId }: { patientId: string }) => {
  const [chartData, setChartData] = useState<
    { month: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const records = await medicalWalkinService.getByPatientId(patientId);

        // Build last 12 months map
        const monthMap = new Map<string, number>();
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          monthMap.set(key, 0);
        }

        records.forEach((record) => {
          if (!record.date) return;
          const d = new Date(record.date);
          const key = d.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          if (monthMap.has(key))
            monthMap.set(key, (monthMap.get(key) || 0) + 1);
        });

        setChartData(
          [...monthMap.entries()].map(([month, count]) => ({ month, count })),
        );
      } catch (err) {
        console.error("Error fetching Visit frequency:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const total = chartData.reduce((sum, d) => sum + d.count, 0);
  const peak = chartData.reduce((max, d) => (d.count > max.count ? d : max), {
    month: "",
    count: 0,
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 rounded-full p-2">
            <Activity className="w-5 h-5 text-red-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Visit Frequency
            </h3>
            <p className="text-sm text-gray-500">
              Monthly visits over the last 12 months
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-gray-500">Total Visits</p>
            <p className="text-2xl font-bold text-red-900">{total}</p>
          </div>
          {peak.count > 0 && (
            <div>
              <p className="text-xs text-gray-500">Peak Month</p>
              <p className="text-lg font-bold text-gray-700">{peak.month}</p>
              <p className="text-xs text-gray-400">
                {peak.count} visit{peak.count !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      ) : total === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm italic">
            No Visit records in the last 12 months.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [value, "Visits"]} />
            <Bar dataKey="count" name="Visits" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.count === peak.count && entry.count > 0
                      ? "#680000"
                      : "#f87171"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const CommonSymptomsChart = ({ patientId }: { patientId: string }) => {
  const [symptomData, setSymptomData] = useState<
    { symptom: string; count: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const records = await medicalWalkinService.getByPatientId(patientId);
        const symptomMap = new Map<string, number>();

        records.forEach((record) => {
          if (Array.isArray(record.complaints_and_vital)) {
            record.complaints_and_vital.forEach((symptom: string) => {
              symptomMap.set(symptom, (symptomMap.get(symptom) || 0) + 1);
            });
          }
          if (record.complaints_other?.trim()) {
            symptomMap.set("Others", (symptomMap.get("Others") || 0) + 1);
          }
        });

        setSymptomData(
          [...symptomMap.entries()]
            .map(([symptom, count]) => ({ symptom, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8),
        );
      } catch (err) {
        console.error("Error fetching symptom data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const total = symptomData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 rounded-full p-2">
            <Activity className="w-5 h-5 text-red-900" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Common Symptoms / Illnesses
            </h3>
            <p className="text-sm text-gray-500">
              Based on all Visit records for this patient
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Complaints</p>
          <p className="text-2xl font-bold text-red-900">{total}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      ) : symptomData.length === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm italic">
            No symptom records found for this patient.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={symptomData.length * 40 + 20}>
          <BarChart
            data={symptomData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 120, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="symptom"
              tick={{ fontSize: 11 }}
              width={115}
            />
            <Tooltip formatter={(value: number) => [value, "Occurrences"]} />
            <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}>
              {symptomData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#680000" : "#f87171"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const ProfileCard = ({
  profile,
  onEditProfile,
}: {
  profile: PatientProfile;
  onEditProfile: () => void;
}) => (
  <div className="bg-gray-200 rounded-lg p-6 mb-8">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {profile.last_name}, {profile.first_name}{" "}
            {profile.middle_initial || ""}
            {profile.suffix ? ` ${profile.suffix}` : ""}
          </h1>
          <p className="text-gray-600 text-lg mb-1">{profile.id_number}</p>
          <p className="text-gray-600 text-lg">{profile.dept_name}</p>
          <p className="text-gray-600 text-lg">{profile.occupation}</p>

          {/* Additional Info Grid */}
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {profile.contact_no && (
              <p className="text-gray-600">
                <span className="font-medium">Contact:</span>{" "}
                {profile.contact_no}
              </p>
            )}
            {profile.gender && (
              <p className="text-gray-600">
                <span className="font-medium">Gender:</span> {profile.gender}
              </p>
            )}
            {profile.birthdate && (
              <p className="text-gray-600">
                <span className="font-medium">Birthdate:</span>{" "}
                {new Date(profile.birthdate).toLocaleDateString()}
              </p>
            )}
            {profile.age && (
              <p className="text-gray-600">
                <span className="font-medium">Age:</span> {profile.age}
              </p>
            )}
            {profile.designation && (
              <p className="text-gray-600">
                <span className="font-medium">Designation:</span>{" "}
                {profile.designation}
              </p>
            )}
            {profile.marital_status && (
              <p className="text-gray-600">
                <span className="font-medium">Marital Status:</span>{" "}
                {profile.marital_status}
              </p>
            )}
            {profile.weight && (
              <p className="text-gray-600">
                <span className="font-medium">Weight:</span> {profile.weight} kg
              </p>
            )}
            {profile.height && (
              <p className="text-gray-600">
                <span className="font-medium">Height:</span> {profile.height} cm
              </p>
            )}
            {profile.home_address && (
              <p className="text-gray-600 col-span-2">
                <span className="font-medium">Home:</span>{" "}
                {profile.home_address}
              </p>
            )}
            {profile.office_address && (
              <p className="text-gray-600 col-span-2">
                <span className="font-medium">Office:</span>{" "}
                {profile.office_address}
              </p>
            )}
          </div>

          {/* Emergency Contact Section */}
          {(profile.emergency_person || profile.emergency_contact) && (
            <div className="mt-3 pt-3 border-t border-gray-400">
              <p className="text-xs font-semibold text-gray-700 mb-1 uppercase">
                Emergency Contact
              </p>
              <div className="grid grid-cols-2 gap-x-6 text-sm">
                {profile.emergency_person && (
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span>{" "}
                    {profile.emergency_person}
                  </p>
                )}
                {profile.emergency_contact && (
                  <p className="text-gray-600">
                    <span className="font-medium">Contact:</span>{" "}
                    {profile.emergency_contact}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <button
          onClick={onEditProfile}
          className="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  </div>
);

type TabType = "walkin" | "physical" | "dental" | "files";

const RecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userType } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("files");

  // Determine which tabs to show based on user type
  const allTabs: { id: TabType; label: string; show: boolean }[] = [
    {
      id: "walkin" as const,
      label: "Visit History",
      show: userType !== "Dental",
    },
    {
      id: "physical" as const,
      label: "Physical Record",
      show: userType !== "Dental",
    },
    {
      id: "dental" as const,
      label: "Dental Treatment",
      show: userType !== "Medical",
    },
    {
      id: "files" as const,
      label: "File Records",
      show: true,
    },
  ];

  const tabs = allTabs.filter((tab) => tab.show);

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

  const handleProfileUpdated = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileClick = useCallback(
    (selectedProfile: PatientProfile) => {
      navigate(`/records/${selectedProfile.id}`);
    },
    [navigate],
  );

  const searchProfiles = useCallback(
    (query: string) => apiClient.searchPatientProfiles(query, 10),
    [],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Set initial active tab based on user type
  useEffect(() => {
    if (userType === "Dental" && activeTab === "walkin") {
      setActiveTab("dental");
    } else if (userType === "Medical" && activeTab === "dental") {
      setActiveTab("walkin");
    }
  }, [userType]);

  return (
    <MainTemplate>
      {/* Search Bar */}
      <button
        type="button"
        onClick={() => navigate("/records")}
        className="flex items-center px-4 py-2 text-white bg-[#680000] rounded-lg shadow hover:bg-red-900 transition"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>
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

      {/* Profile Info */}
      {isLoadingProfile ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      ) : profile ? (
        <>
          <ProfileCard
            profile={profile}
            onEditProfile={() => setEditModalOpen(true)}
          />
          {userType !== "Dental" && (
            <>
              <WalkinFrequencyChart patientId={profile.id} />
              <CommonSymptomsChart patientId={profile.id} />
            </>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-lg">Profile not found</p>
        </div>
      )}

      {/* Records Section with Tabs */}
      {profile && (
        <div className="bg-white rounded-lg shadow-sm mt-6">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-red-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "walkin" && userType !== "Dental" && (
              <WalkinHistoryTab patientId={profile.id} />
            )}
            {activeTab === "physical" && (
              <PhysicalRecordTab patientId={profile.id} />
            )}
            {activeTab === "dental" && userType !== "Medical" && (
              <DentalTreatmentTab patientId={profile.id} />
            )}
            {activeTab === "files" && (
              <FileRecordsTab patientId={profile.id} profile={profile} />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddProfileModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        onProfileAdded={fetchProfile}
      />
      <EditProfileModal
        modalOpen={editModalOpen}
        setModalOpen={setEditModalOpen}
        profile={profile}
        onProfileUpdated={handleProfileUpdated}
      />
    </MainTemplate>
  );
};

export default RecordDetail;
