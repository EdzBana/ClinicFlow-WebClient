import React, { useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const ScheduleAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    idNumber: "",
    department: "",
    email: "",
    reason: "",
    additionalNotes: "",
    serviceType: "Medical",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      serviceType: e.target.value,
    }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (
      !formData.lastName.trim() ||
      !formData.firstName.trim() ||
      !formData.idNumber.trim() ||
      !formData.department.trim() ||
      !formData.email.trim() ||
      !formData.reason.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    console.log("Appointment submitted:", formData);
    // Add your submission logic here
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
        {/* Page Title */}
        <h2 className="text-3xl font-medium text-gray-900 mb-8">
          Schedule an Appointment
        </h2>

        {/* Form Container */}
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Last Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Last Name:
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  First Name:
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  ID Number:
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Department:
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* Service Type Radio Buttons */}
              <div>
                <div className="flex gap-6 mt-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="serviceType"
                      value="Medical"
                      checked={formData.serviceType === "Medical"}
                      onChange={handleServiceTypeChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Medical</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="serviceType"
                      value="Dental"
                      checked={formData.serviceType === "Dental"}
                      onChange={handleServiceTypeChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Dental</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Reason:
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Additional Notes:
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-3 py-2 bg-white shadow border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-12 mb-8">
            <button
              onClick={handleSubmit}
              className="px-12 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: "#680000" }}
            >
              Submit
            </button>

            <button
              onClick={handleBack}
              className="px-8 py-3 text-white bg-gray-500 font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
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
