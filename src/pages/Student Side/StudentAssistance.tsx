import React from "react";
import { useNavigate } from "react-router-dom";
import StudentPageTemplate from "./StudentPageTemplate";

const StudentAssistance: React.FC = () => {
  const navigate = useNavigate();

  const handleScheduleAppointment = () => {
    navigate("/student-assistance/schedule-appointment");
  };

  const handleGetNumber = () => {
    navigate("/student-assistance/queue");
  };

  const handleRequestMedicalService = () => {
    navigate("/student-assistance/request-medical-service");
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Student Assistance"
    >
      {/* Main Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-medium leading-tight text-gray-900">
            Welcome!
            <br />
            How Can We Help You Today?
          </h1>
        </div>

        {/* Service Buttons */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl mb-12 items-center">
          <button
            onClick={handleScheduleAppointment}
            className="w-full md:w-64 h-16 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Schedule an Appointment
          </button>

          <button
            onClick={handleGetNumber}
            className="w-full md:w-64 h-16 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Get Number
          </button>

          <button
            onClick={handleRequestMedicalService}
            className="w-full md:w-64 h-20 text-white text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            <div className="text-center leading-snug">
              <div>Request Medical Service</div>
              <div>for Events</div>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <div className="pt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
            style={{ backgroundColor: "#680000" }}
          >
            Back
          </button>
        </div>
      </div>
    </StudentPageTemplate>
  );
};

export default StudentAssistance;
