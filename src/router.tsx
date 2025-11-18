import { createBrowserRouter, Navigate } from "react-router-dom";
// Components
import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
// Auth
import HealthandDentalLogin from "./auth/HealthDentalLogin";
// Pages
import Dashboard from "./pages/Dashboard";
import StudentAssistance from "./pages/Student Side/StudentAssistance";
import QueueingSystemPage from "./pages/Student Side/QueueingSystemPage";
import RequestMedicalServicePage from "./pages/Student Side/RequestMedicalServicePage";
import QueueSuccess from "./pages/Student Side/QueueSuccess";
import ViewQueue from "./pages/Student Side/ViewQueue";
import NotFound from "./pages/NotFound";
import Inventory from "./pages/Inventory";
import Records from "./pages/Records";
import RecordDetail from "./pages/RecordDetail";
import InventoryManagementMain from "./pages/Inventory Management/InventoryManagementMain";
import ViewItem from "./pages/Inventory Management/ViewItem";
import ItemDetail from "./pages/Inventory Management/ItemDetail";
import AddItem from "./pages/Inventory Management/AddItem";
import StockControl from "./pages/StockControl";
import TransactionHistory from "./pages/Inventory Management/TransactionHistory";
import AppointmentsMain from "./pages/Appointments/AppointmentsMain";
import Queueing from "./pages/Appointments/Queueing";
import StudentActivities from "./pages/Appointments/StudentActivities";
import QueueHistoryPage from "./pages/Appointments/QueueHistoryPage";
import Settings from "./pages/Settings";
import MedServiceSubmitted from "./pages/Student Side/MedServiceSubmitted";
import SchedulePage from "./pages/Student Side/SchedulePage";

export const router = createBrowserRouter([
  // Auth
  {
    path: "/login",
    element: (
      <PublicRoute>
        <HealthandDentalLogin />
      </PublicRoute>
    ),
    handle: { title: "Login" },
  },

  // Dashboard
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
    handle: { title: "Dashboard" },
  },

  // Inventory
  {
    path: "/inventory",
    element: (
      <PrivateRoute>
        <Inventory />
      </PrivateRoute>
    ),
    handle: { title: "Inventory" },
  },

  // Inventory Management
  {
    path: "/inventory-management",
    element: (
      <PrivateRoute>
        <InventoryManagementMain />
      </PrivateRoute>
    ),
    handle: { title: "Inventory Management" },
  },
  {
    path: "/inventory-management/view-item",
    element: (
      <PrivateRoute>
        <ViewItem />
      </PrivateRoute>
    ),
    handle: { title: "View Items" },
  },
  {
    path: "/inventory-management/view-item/:id",
    element: (
      <PrivateRoute>
        <ItemDetail />
      </PrivateRoute>
    ),
    handle: { title: "Item Details" },
  },
  {
    path: "/inventory-management/add-item",
    element: (
      <PrivateRoute>
        <AddItem />
      </PrivateRoute>
    ),
    handle: { title: "Add Item" },
  },
  {
    path: "/inventory-management/transaction-history",
    element: (
      <PrivateRoute>
        <TransactionHistory />
      </PrivateRoute>
    ),
    handle: { title: "Transaction History" },
  },

  // Stock Control
  {
    path: "/stock-control",
    element: (
      <PrivateRoute>
        <StockControl />
      </PrivateRoute>
    ),
    handle: { title: "Stock Control" },
  },

  // Records
  {
    path: "/records",
    element: (
      <PrivateRoute>
        <Records />
      </PrivateRoute>
    ),
    handle: { title: "Records" },
  },
  {
    path: "/records/:id",
    element: (
      <PrivateRoute>
        <RecordDetail />
      </PrivateRoute>
    ),
    handle: { title: "Record Details" },
  },

  // Appointments
  {
    path: "/appointments",
    element: (
      <PrivateRoute>
        <AppointmentsMain />
      </PrivateRoute>
    ),
    handle: { title: "Appointments" },
  },
  {
    path: "/appointments/queue",
    element: (
      <PrivateRoute>
        <Queueing />
      </PrivateRoute>
    ),
    handle: { title: "Queueing System" },
  },
  {
    path: "/appointments/student-activities",
    element: (
      <PrivateRoute>
        <StudentActivities />
      </PrivateRoute>
    ),
    handle: { title: "Student Activities" },
  },
  {
    path: "/appointments/queue-history",
    element: (
      <PrivateRoute>
        <QueueHistoryPage />
      </PrivateRoute>
    ),
    handle: { title: "Queue History" },
  },

  // Settings
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    ),
    handle: { title: "Settings" },
  },

  // Student Assistance (Public)
  {
    path: "/student-assistance",
    element: <StudentAssistance />,
    handle: { title: "Student Assistance" },
  },
  {
    path: "/student-assistance/queue",
    element: <QueueingSystemPage />,
    handle: { title: "Queueing System" },
  },
  {
    path: "/student-assistance/request-medical-service",
    element: <RequestMedicalServicePage />,
    handle: { title: "Request Medical Service" },
  },
  {
    path: "/student-assistance/request-medical-service/submitted",
    element: <MedServiceSubmitted />,
    handle: { title: "Request Submitted" },
  },
  {
    path: "/student-assistance/queue/success",
    element: <QueueSuccess />,
    handle: { title: "Queue Success" },
  },
  {
    path: "/student-assistance/queue/view",
    element: <ViewQueue />,
    handle: { title: "View Queue" },
  },
  {
    path: "/student-assistance/view-schedule",
    element: <SchedulePage />,
    handle: { title: "View Schedule" },
  },

  // Redirect root
  {
    path: "/",
    element: <Navigate to="/login" replace />,
    handle: { title: "Redirecting..." },
  },

  //  404
  { path: "*", element: <NotFound />, handle: { title: "Page Not Found" } },
]);
