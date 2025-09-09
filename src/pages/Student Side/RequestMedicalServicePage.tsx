import React, { useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const RequestMedicalServicePage: React.FC = () => {
  const navigate = useNavigate();
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

  const handleSubmit = () => {
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

    console.log("Medical service request submitted:", formData);
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
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center mt-12">
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

export default RequestMedicalServicePage;
