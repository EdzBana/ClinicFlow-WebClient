import React, { useState, useEffect } from "react";
import MainTemplate from "@/components/MainTemplate";
import {
  getAllAppointments,
  updateAppointment,
  sendAppointmentEmail,
  type Appointment,
} from "@/services/appointmentService";
import { useAuth } from "@/hooks/useAuth";

type SortField =
  | "last_name"
  | "service_type"
  | "department"
  | "appointment_date"
  | "appointment_time"
  | "status";
type SortDirection = "asc" | "desc";

const Scheduling: React.FC = () => {
  const { userType } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>(userType ?? "all");
  const [sortField, setSortField] = useState<SortField>("appointment_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [modalForm, setModalForm] = useState<Appointment>({
    last_name: "",
    first_name: "",
    id_number: "",
    department: "",
    email: "",
    reason: "",
    additional_notes: "",
    service_type: "Medical",
    appointment_date: "",
    appointment_time: "",
    assigned_staff: "",
    status: "pending",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [appointments, statusFilter, serviceFilter, sortField, sortDirection]);

  useEffect(() => {
  if (userType) {
    setServiceFilter(userType);
  }
}, [userType]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await getAllAppointments();
    if (error) {
      console.error("Error fetching appointments:", error);
      alert("Failed to load appointments");
    } else if (data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    if (serviceFilter !== "all") {
      filtered = filtered.filter((a) => a.service_type === serviceFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      if (!aValue) aValue = "";
      if (!bValue) bValue = "";

      if (sortField === "appointment_date") {
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

    setFilteredAppointments(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "⇅";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalForm(appointment);
    setIsModalOpen(true);
  };

  const handleModalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setModalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedAppointment?.id) return;

    setIsSaving(true);

    const previousStatus = selectedAppointment.status;
    const newStatus = modalForm.status;

    const { error } = await updateAppointment(selectedAppointment.id, {
      appointment_date: modalForm.appointment_date,
      appointment_time: modalForm.appointment_time,
      assigned_staff: modalForm.assigned_staff,
      status: modalForm.status,
    });

    if (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment");
      setIsSaving(false);
      return;
    }

    // Send email if status changed to confirmed, cancelled, or completed
    const emailStatuses = ["confirmed", "cancelled", "completed"];
    if (
      newStatus !== previousStatus &&
      emailStatuses.includes(newStatus ?? "") &&
      modalForm.email
    ) {
      const { success, error: emailError } = await sendAppointmentEmail(
        { ...modalForm, id: selectedAppointment.id },
        newStatus as "confirmed" | "cancelled" | "completed"
      );
      if (!success) {
        console.warn("Appointment saved but email failed:", emailError);
        alert("Appointment updated, but email notification failed to send.");
      } else {
        alert("Appointment updated and email sent to patient!");
      }
    } else {
      alert("Appointment updated successfully!");
    }

    setIsModalOpen(false);
    fetchAppointments();
    setIsSaving(false);
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getServiceBadgeColor = (type?: string) => {
    return type === "Dental"
      ? "bg-purple-100 text-purple-800"
      : "bg-cyan-100 text-cyan-800";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "—";
    const [h, m] = timeString.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <MainTemplate>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600">
            View and manage student medical and dental appointments
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredAppointments.length} of {appointments.length} appointments
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading appointments...</div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            {statusFilter === "all" && serviceFilter === "all"
              ? "No appointments found"
              : "No appointments match the selected filters"}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#680000" }}>
                  <tr>
                    {(
                      [
                        { label: "Name", field: "last_name" },
                        { label: "ID Number", field: null },
                        { label: "Service", field: "service_type" },
                        { label: "Department", field: "department" },
                        { label: "Reason", field: null },
                        { label: "Sched. Date", field: "appointment_date" },
                        { label: "Sched. Time", field: "appointment_time" },
                        { label: "Assigned Staff", field: null },
                        { label: "Status", field: "status" },
                      ] as { label: string; field: SortField | null }[]
                    ).map(({ label, field }) => (
                      <th
                        key={label}
                        onClick={() => field && handleSort(field)}
                        className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider select-none ${
                          field ? "cursor-pointer hover:bg-opacity-90" : ""
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {field && (
                            <span className="text-sm">{getSortIcon(field)}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appt) => (
                    <tr
                      key={appt.id}
                      onClick={() => handleRowClick(appt)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appt.last_name}, {appt.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appt.id_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getServiceBadgeColor(
                            appt.service_type
                          )}`}
                        >
                          {appt.service_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appt.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {appt.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(appt.appointment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTime(appt.appointment_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appt.assigned_staff || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            appt.status
                          )}`}
                        >
                          {appt.status || "pending"}
                        </span>
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
              {/* Modal Header */}
              <div
                className="px-6 py-4 border-b flex justify-between items-center"
                style={{ backgroundColor: "#680000" }}
              >
                <h2 className="text-xl font-semibold text-white">
                  Appointment Details
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Read-only fields */}
                  {[
                    { label: "Last Name", value: modalForm.last_name },
                    { label: "First Name", value: modalForm.first_name },
                    { label: "ID Number", value: modalForm.id_number },
                    { label: "Department", value: modalForm.department },
                    { label: "Email", value: modalForm.email },
                    { label: "Service Type", value: modalForm.service_type },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={value ?? ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  ))}

                  {/* Reason - Read Only, full width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={modalForm.reason ?? ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Additional Notes - Read Only, full width */}
                  {modalForm.additional_notes && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={modalForm.additional_notes}
                        readOnly
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed resize-none"
                      />
                    </div>
                  )}

                  {/* Divider */}
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Admin Fields
                    </p>
                  </div>

                  {/* Appointment Date - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={modalForm.appointment_date ?? ""}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  {/* Appointment Time - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appointment Time
                    </label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={modalForm.appointment_time ?? ""}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  {/* Assigned Staff - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Staff
                    </label>
                    <input
                      type="text"
                      name="assigned_staff"
                      value={modalForm.assigned_staff ?? ""}
                      onChange={handleModalInputChange}
                      placeholder="Enter staff name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    />
                  </div>

                  {/* Status - Editable */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={modalForm.status ?? "pending"}
                      onChange={handleModalInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Email notice */}
                <p className="mt-4 text-xs text-gray-500 italic">
                  * An email notification will automatically be sent to the student when status is set to <strong>Confirmed</strong>, <strong>Completed</strong>, or <strong>Cancelled</strong>.
                </p>

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

export default Scheduling;