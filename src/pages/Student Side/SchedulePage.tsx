import React from "react";
import StudentPageTemplate from "./StudentPageTemplate";

const SchedulePage: React.FC = () => {
  return (
    <StudentPageTemplate
      pageTitle="Health and Dental Services"
      pageSubtitle="Clinic and Dental Staff Schedules"
    >
      <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-6 md:py-10 gap-8 md:gap-10">
        {/* University Physician Section */}
        <div className="p-4 md:p-6 rounded-xl shadow-lg border border-gray-300 bg-white">
          <h2 className="text-xl md:text-2xl font-semibold text-red-900 mb-4 text-center">
            University Physicians
          </h2>
          <div className="space-y-4 text-base md:text-lg text-gray-800">
            <div>
              <p className="font-semibold">Dr. Marco Teodoro F. Puache</p>
              <p className="text-red-700">08:00 AM – 02:00 PM</p>
            </div>
            <div>
              <p className="font-semibold">Dr. Melo M. Justiniano</p>
              <p className="text-red-700">02:00 PM – 05:00 PM</p>
            </div>
            <div>
              <p className="font-semibold">Dr. Francis Gerard M. Daya</p>
              <p className="text-red-700">05:30 PM – 08:30 PM</p>
            </div>
          </div>
        </div>

        {/* University Dentist Section */}
        <div className="p-4 md:p-6 rounded-xl shadow-lg border border-gray-300 bg-white">
          <h2 className="text-xl md:text-2xl font-semibold text-red-900 mb-4 text-center">
            University Dentists
          </h2>
          <div className="space-y-6 text-base md:text-lg text-gray-800">
            <div>
              <p className="font-semibold">Dr. Rico D. Samson</p>
              <p className="text-red-700">
                08:00 AM – 12:00 NN — BEd Dental Clinic
              </p>
              <p className="text-red-700">
                12:00 NN – 04:00 PM — Main Dental Clinic
              </p>
            </div>
            <div>
              <p className="font-semibold">Dr. Caren M. Morales</p>
              <p className="text-red-700">
                09:00 AM – 12:00 NN — Main Dental Clinic
              </p>
            </div>
            <div>
              <p className="font-semibold">Dr. Ellen P. Jarapa</p>
              <p className="text-red-700">
                01:00 PM – 04:00 PM — BEd Dental Clinic
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Back Button */}
      <div className="w-full flex justify-center mt-6 mb-10">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition duration-200 hover:opacity-90"
          style={{ backgroundColor: "#680000" }}
        >
          Back
        </button>
      </div>
    </StudentPageTemplate>
  );
};

export default SchedulePage;
