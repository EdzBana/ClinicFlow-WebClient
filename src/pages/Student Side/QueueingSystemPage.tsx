import React, { useState } from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const QueueingSystemPage: React.FC = () => {
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [serviceType, setServiceType] = useState("Medical");
  const navigate = useNavigate();

  const handleGetNumber = () => {
    if (!name.trim() || !idNumber.trim()) {
      alert("Please fill in all fields");
      return;
    }
    console.log("Get Number clicked:", { name, idNumber, serviceType });
    navigate("/student-assistance/queue/success");
  };

  const handleBack = () => {
    console.log("Back clicked");
    navigate("/student-assistance");
  };

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className=" pb-50 flex flex-col items-center justify-center h-full">
        {/* Queueing System Title */}
        <h2 className="text-3xl font-medium text-gray-900 mb-8">
          Queueing System
        </h2>

        {/* Form Container */}
        <div className="bg-gray-300 rounded-lg p-8 w-96 shadow-lg">
          {/* Name Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent bg-white"
              placeholder="Enter your name"
            />
          </div>

          {/* ID Number Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              ID Number
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent  bg-white"
              placeholder="Enter your ID number"
            />
          </div>

          {/* Service Type Radio Buttons */}
          <div className="mb-8">
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceType"
                  value="Medical"
                  checked={serviceType === "Medical"}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Medical</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="serviceType"
                  value="Dental"
                  checked={serviceType === "Dental"}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">Dental</span>
              </label>
            </div>
          </div>

          {/* Get Number Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGetNumber}
              className="px-8 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: "#680000" }}
            >
              Get Number
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute bottom-8 right-8">
          <button
            onClick={handleBack}
            className="px-8 py-3 text-white font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Back
          </button>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default QueueingSystemPage;
