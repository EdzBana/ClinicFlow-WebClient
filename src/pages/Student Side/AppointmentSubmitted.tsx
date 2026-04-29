import React from "react";
import StudentPageTemplate from "./StudentPageTemplate";
import { useNavigate } from "react-router-dom";

const AppointmentSubmitted: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => navigate("/student-assistance");

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      <div className="pb-50 flex flex-col items-center justify-center h-full px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-medium text-gray-900 mb-6 sm:mb-8 text-center">
          Scheduled Appointment
        </h2>

        <div className="bg-gray-300 rounded-lg p-6 sm:p-12 w-full max-w-md shadow-lg text-center">
          <h3 className="text-xl sm:text-2xl font-medium text-green-600 mb-6 sm:mb-8">
            Request Submitted!
          </h3>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-10">
            Please wait for the clinic staff to email you for the appointment
            details. If you have any questions, feel free to reach out to the
            University Clinic.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleBack}
              className="px-8 py-3 text-white text-lg font-medium rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: "#680000" }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default AppointmentSubmitted;
