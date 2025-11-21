import MainTemplate from "@/components/MainTemplate";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AppointmentsMain = () => {
  const navigate = useNavigate();

  const handleQueue = () => {
    navigate("/appointments/queue");
  };

  const handleStudentActivities = () => {
    navigate("/appointments/student-activities");
  };

  const handleHistory = () => {
    navigate("/appointments/queue-history");
  };

  return (
    <MainTemplate>
      <div
        className="
          flex flex-col 
          md:flex-row 
          flex-wrap 
          items-center 
          justify-center 
          gap-6 
          pt-10 
          md:pt-20 
          lg:pt-32
        "
      >
        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="
            w-full 
            max-w-xs 
            md:w-60 
            md:h-32 
            text-lg 
            font-semibold 
            rounded-lg 
            shadow-lg 
            transition 
            hover:opacity-90
          "
          onClick={handleQueue}
        >
          Queueing System
        </Button>

        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="
            w-full 
            max-w-xs 
            md:w-60 
            md:h-32 
            text-lg 
            font-semibold 
            rounded-lg 
            shadow-lg 
            transition 
            hover:opacity-90
          "
          onClick={handleStudentActivities}
        >
          Student Activities
        </Button>

        <Button
          style={{ backgroundColor: "#680000", color: "white" }}
          className="
            w-full 
            max-w-xs 
            md:w-60 
            md:h-32 
            text-lg 
            font-semibold 
            rounded-lg 
            shadow-lg 
            transition 
            hover:opacity-90
          "
          onClick={handleHistory}
        >
          Queue History
        </Button>
      </div>
    </MainTemplate>
  );
};

export default AppointmentsMain;
