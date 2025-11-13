import MainTemplate from "@/components/MainTemplate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AppointmentsMain = () => {
  const navigate = useNavigate();

  const handleQueue = () => {
    navigate("/appointments/queue");
  };

  const handleScheduling = () => {
    navigate("/appointments/scheduling");
  };

  const handleStudentActivities = () => {
    navigate("/appointments/student-activities");
  };

  const handleHistory = () => {
    navigate("/appointments/queue-history");
  };

  return (
    <MainTemplate initialPage="Appointments">
      <div className="flex items-center justify-center pt-40 gap-10">
        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
          onClick={handleQueue}
        >
          Queueing System
        </Button>
        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
          onClick={handleScheduling}
        >
          Scheduling
        </Button>
        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
          onClick={handleStudentActivities}
        >
          Student Activities
        </Button>
        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="w-90 h-45 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200 hover:opacity-90"
          onClick={handleHistory}
        >
          Queue History
        </Button>
      </div>
    </MainTemplate>
  );
};

export default AppointmentsMain;
