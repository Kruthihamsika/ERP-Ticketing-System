import { Routes, Route, Navigate } from "react-router-dom";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import EmployeeDashboardPage from "./pages/EmployeeDashboardPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<Navigate to="/employee" replace />}
          />
<Route
  path="/admin"
  element={<DashboardPage />}
/>

<Route
  path="/agent"
  element={<AgentDashboardPage />}
/>

<Route
  path="/employee"
  element={<EmployeeDashboardPage />}
/>

          <Route
            path="/tickets"
            element={<TicketsPage />}
          />

          <Route
            path="/tickets/new"
            element={<CreateTicketPage />}
          />

          <Route
            path="/tickets/:ticketId"
            element={<TicketDetailsPage />}
          />

          <Route
            path="/analytics"
            element={<AnalyticsPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}