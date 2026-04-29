import React, { useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";
import { submitAppointment } from "@/services/appointmentService";

const ScheduleAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    idNumber: "",
    department: "",
    email: "",
    reason: "",
    additionalNotes: "",
    serviceType: "Medical" as "Medical" | "Dental",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: e.target.value as "Medical" | "Dental",
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.lastName.trim() ||
      !formData.firstName.trim() ||
      !formData.idNumber.trim() ||
      !formData.department.trim() ||
      !formData.email.trim() ||
      !formData.reason.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await submitAppointment({
        last_name: formData.lastName.trim(),
        first_name: formData.firstName.trim(),
        id_number: formData.idNumber.trim(),
        department: formData.department.trim(),
        email: formData.email.trim(),
        reason: formData.reason.trim(),
        additional_notes: formData.additionalNotes.trim() || undefined,
        service_type: formData.serviceType,
      });

      if (error) {
        console.error("Submission error:", error);
        alert("Failed to submit appointment. Please try again.");
      } else {
        navigate("/student-assistance/schedule-appointment/submitted");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/student-assistance");
  };

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className="flex flex-col items-center h-full px-8">
        <h2 className="text-3xl font-medium text-gray-900 mb-8">
          Schedule an Appointment
        </h2>

        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Last Name: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  First Name: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  ID Number: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Department: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email: <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="serviceType"
                      value="Medical"
                      checked={formData.serviceType === "Medical"}
                      onChange={handleServiceTypeChange}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Medical</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="serviceType"
                      value="Dental"
                      checked={formData.serviceType === "Dental"}
                      onChange={handleServiceTypeChange}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Dental</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Reason: <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Additional Notes:
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={8}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-12 mb-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-12 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#680000" }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-8 py-3 text-white bg-gray-500 font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-60"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default ScheduleAppointmentPage;
