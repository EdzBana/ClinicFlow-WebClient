import React, { useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";
import { submitMedicalServiceRequest } from "@/services/medicalService";

const RequestMedicalServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    eventName: "",
    date: "",
    departmentOrganization: "",
    time: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.eventName.trim() ||
      !formData.date.trim() ||
      !formData.departmentOrganization.trim() ||
      !formData.time.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await submitMedicalServiceRequest({
        name: formData.name,
        location: formData.location,
        event_name: formData.eventName,
        date: formData.date,
        department_organization: formData.departmentOrganization,
        time: formData.time,
      });

      if (error) {
        console.error("Error submitting request:", error);
        alert("Failed to submit request. Please try again.");
      } else {
        // Redirect to success page
        navigate("/student-assistance/request-medical-service/submitted");
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
      <div className="flex flex-col items-center min-h-full px-8 pb-8">
        {/* Page Title */}
        <h2 className="text-3xl font-medium text-gray-900 mb-8">
          Request Medical Service for Events
        </h2>

        {/* Form Container */}
        <div className="w-full max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Event Name:
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Department/Organization */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Department/Organization:
                </label>
                <input
                  type="text"
                  name="departmentOrganization"
                  value={formData.departmentOrganization}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Location:
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Time:
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-12 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#680000" }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-8 py-3 text-white bg-gray-500 font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default RequestMedicalServicePage;
