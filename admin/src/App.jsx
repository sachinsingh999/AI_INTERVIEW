import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import UserResponses from "./pages/UserResponses.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Import new recruitment ATS screens
import Dashboard from "./pages/admin/Dashboard.jsx";
import Candidates from "./pages/admin/Candidates.jsx";
import CandidateProfile from "./pages/admin/CandidateProfile.jsx";
import RoundReview from "./pages/admin/RoundReview.jsx";
import CodingReview from "./pages/admin/CodingReview.jsx";
import HRReview from "./pages/admin/HRReview.jsx";
import Analytics from "./pages/admin/Analytics.jsx";
import RecruitmentPipeline from "./pages/admin/RecruitmentPipeline.jsx";
import FinalEvaluation from "./pages/admin/FinalEvaluation.jsx";
import OAReview from "./pages/admin/OAReview.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Recruiter Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute>
              <Candidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:candidateId"
          element={
            <ProtectedRoute>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id/oa-review"
          element={
            <ProtectedRoute>
              <OAReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates/:id/oa-review"
          element={
            <ProtectedRoute>
              <OAReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute>
              <RecruitmentPipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <RoundReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding-review/:id"
          element={
            <ProtectedRoute>
              <CodingReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-review/:id"
          element={
            <ProtectedRoute>
              <HRReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/final-evaluation/:candidateId"
          element={
            <ProtectedRoute>
              <FinalEvaluation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responses"
          element={
            <ProtectedRoute>
              <UserResponses />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
