import React, { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import {
  getAllMedicalServiceRequests,
  updateMedicalServiceRequest,
  type MedicalServiceRequest,
} from "@/services/medicalService";

type SortField =
  | "name"
  | "event_name"
  | "department_organization"
  | "date"
  | "time"
  | "approval_status";
type SortDirection = "asc" | "desc";

const StudentActivities: React.FC = () => {
  const [requests, setRequests] = useState<MedicalServiceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    MedicalServiceRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<MedicalServiceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Modal form state
  const [modalForm, setModalForm] = useState<MedicalServiceRequest>({
    name: "",
    location: "",
    event_name: "",
    date: "",
    department_organization: "",
    time: "",
    approval_status: "pending",
    requirements_submitted: false,
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, statusFilter, sortField, sortDirection]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await getAllMedicalServiceRequests();
    if (error) {
      console.error("Error fetching requests:", error);
      alert("Failed to load requests");
    } else if (data) {
      setRequests(data as MedicalServiceRequest[]);
    }
    setLoading(false);
  };

  const filterAndSortRequests = () => {
    let filtered = [...requests];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.approval_status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (!aValue) aValue = "";
      if (!bValue) bValue = "";

      // Convert to comparable format
      if (sortField === "date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredRequests(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "⇅";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleRowClick = (request: MedicalServiceRequest) => {
    setSelectedRequest(request);
    setModalForm(request);
    setIsModalOpen(true);
  };

  const handleModalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setModalForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedRequest?.id) return;

    setIsSaving(true);
    const { error } = await updateMedicalServiceRequest(selectedRequest.id, {
      approval_status: modalForm.approval_status,
      requirements_submitted: modalForm.requirements_submitted,
    });

    if (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request");
    } else {
      alert("Request updated successfully!");
      setIsModalOpen(false);
      fetchRequests(); // Refresh the list
    }
    setIsSaving(false);
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <MainTemplate>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#680000" }}>
            Medical Service Requests
          </h1>
          <p className="text-gray-600">
            View and manage medical service requests for events
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-sm text-gray-500">
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {statusFilter === "all"
              ? "No medical service requests found"
              : `No ${statusFilter} requests found`}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#680000" }}>
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <span className="text-sm">{getSortIcon("name")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("event_name")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Event
                        <span className="text-sm">
                          {getSortIcon("event_name")}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("department_organization")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Department/Org
                        <span className="text-sm">
                          {getSortIcon("department_organization")}
                        </span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("date")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Date
                        <span className="text-sm">{getSortIcon("date")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("time")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Time
                        <span className="text-sm">{getSortIcon("time")}</span>
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("approval_status")}
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-opacity-90 select-none"
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <span className="text-sm">
                          {getSortIcon("approval_status")}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Requirements
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => handleRowClick(request)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.event_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.department_organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(request.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(request.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            request.approval_status
                          )}`}
                        >
                          {request.approval_status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.requirements_submitted ? "✓ Yes" : "✗ No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div
                className="px-6 py-4 border-b flex justify-between items-center"
                style={{ backgroundColor: "#680000" }}
              >
                <h2 className="text-xl font-semibold text-white">
                  Edit Medical Service Request
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={modalForm.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Location - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={modalForm.location}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Event Name - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={modalForm.event_name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Department/Organization - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department/Organization
                    </label>
                    <input
                      type="text"
                      value={modalForm.department_organization}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Date - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={modalForm.date}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Time - Read Only */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={modalForm.time}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Approval Status - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Status
                    </label>
                    <select
                      name="approval_status"
                      value={modalForm.approval_status}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Requirements Submitted - Editable */}
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="requirements_submitted"
                        checked={modalForm.requirements_submitted}
                        onChange={handleModalInputChange}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: "#680000" }}
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Requirements Submitted
                      </span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-4 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#680000" }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainTemplate>
  );
};

export default StudentActivities;
