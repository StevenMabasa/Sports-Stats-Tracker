import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Login from "./pages/login";
import Signup from "./pages/signup";
import CoachDashboard from "./pages/coachDashboard/CoachDashboard";
import AuthCallback from "./pages/authCallback";
import TeamSetup from "./pages/TeamSetup";
import UserDashboard from "./pages/userDashboard/RedesignedDashboard";
import RedesignedDashboard from "./pages/userDashboard/RedesignedDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import TeamStatsPage from "./pages/userDashboard/TeamStatsPage";
import F1Dashboard from "./pages/f1/F1Dashboard";
import F1DriversPage from "./pages/f1/F1DriversPage";
import F1TeamsPage from "./pages/f1/F1TeamPage";
import F1StatsPage from "./pages/f1/F1StatsPage";
import F1ResultsPage from "./pages/f1/F1ResultsPage";
import "./chartSetup";


function App() {
  return (
    <Router>
      <section
        className="App"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Routes>
          <Route path="/teams/:teamId/stats" element={<TeamStatsPage />} />
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route
            path="/f1-dashboard/*"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <F1Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="drivers" element={<F1DriversPage />} />
            <Route path="teams" element={<F1TeamsPage />} />
            <Route path="stats" element={<F1StatsPage />} />
            <Route path="f1Results" element={<F1ResultsPage />} />
            <Route index element={<F1DriversPage />} />
          </Route>
          {/* Fan Routes */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players/:playerId"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/overview"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/players"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:id"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute requiredRole="Fan" redirectTo="/login">
                <RedesignedDashboard />
              </ProtectedRoute>
            }
          />

          {/* Coach Routes */}
          <Route
            path="/coach-dashboard"
            element={
              <ProtectedRoute requiredRole="Coach" redirectTo="/login">
                <CoachDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-setup"
            element={
              <ProtectedRoute requiredRole="Coach" redirectTo="/login">
                <TeamSetup />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="Admin" redirectTo="/login">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </Router>
  );
}

export default App;