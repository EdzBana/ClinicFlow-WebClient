// src/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Components
import PrivateRoute from "@/components/PrivateRoute";

// Auth
import HealthandDentalLogin from "./auth/HealthDentalLogin";

// Pages
import Dashboard from "./pages/Dashboard";
import StudentAssistance from "./pages/Student Side/StudentAssistance";
import QueueingSystemPage from "./pages/Student Side/QueueingSystemPage";
import ScheduleAppointmentPage from "./pages/Student Side/ScheduleAppointmentPage";
import RequestMedicalServicePage from "./pages/Student Side/RequestMedicalServicePage";
import QueueSuccess from "./pages/Student Side/QueueSuccess";
import ViewQueue from "./pages/Student Side/ViewQueue";
import NotFound from "./pages/NotFound";
import Inventory from "./pages/Inventory";
import Records from "./pages/Records";
import RecordDetail from "./pages/RecordDetail";
import InventoryManagementMain from "./pages/Inventory Management/InventoryManagementMain";
import ViewItem from "./pages/Inventory Management/ViewItem";
import AddItem from "./pages/Inventory Management/AddItem";

export const router = createBrowserRouter([
  { path: "/login", element: <HealthandDentalLogin /> },

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <PrivateRoute>
        <Inventory />
      </PrivateRoute>
    ),
  },
  {
    path: "/inventory-management",
    element: (
      <PrivateRoute>
        <InventoryManagementMain />
      </PrivateRoute>
    ),
  },
  {
    path: "/inventory-management/view-item",
    element: (
      <PrivateRoute>
        <div>
          <ViewItem />
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: "/inventory-management/add-item",
    element: (
      <PrivateRoute>
        <div>
          <AddItem />
        </div>
      </PrivateRoute>
    ),
  },
  {
    path: "/records",
    element: (
      <PrivateRoute>
        <Records />
      </PrivateRoute>
    ),
  },
  {
    path: "/records/:id",
    element: (
      <PrivateRoute>
        <RecordDetail />
      </PrivateRoute>
    ),
  },

  // Student Assistance (public)
  { path: "/student-assistance", element: <StudentAssistance /> },
  { path: "/student-assistance/queue", element: <QueueingSystemPage /> },
  {
    path: "/student-assistance/schedule-appointment",
    element: <ScheduleAppointmentPage />,
  },
  {
    path: "/student-assistance/request-medical-service",
    element: <RequestMedicalServicePage />,
  },
  { path: "/student-assistance/queue/success", element: <QueueSuccess /> },
  { path: "/student-assistance/queue/view", element: <ViewQueue /> },

  // Redirect root
  { path: "/", element: <Navigate to="/login" replace /> },

  // 404
  { path: "*", element: <NotFound /> },
]);
