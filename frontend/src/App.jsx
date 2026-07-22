import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import PracticeDashboard from "./pages/PracticeDashboard";
import AptitudeDashboard from "./pages/AptitudeDashboard";
import PracticeHub from "./pages/PracticeHub";
import Interview from "./pages/Interview";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Roadmap from "./pages/Roadmap";
import History from "./pages/History";
import Settings from "./pages/Settings";
import POTDArchive from "./pages/POTDArchive";
import CreateInterview from "./pages/CreateInterview";
import InterviewSession from "./pages/InterviewSession";
import PhaseCompleteTransition from "./pages/PhaseCompleteTransition";
import InterviewResponses from "./pages/InterviewResponses";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastContainer from "./components/ToastContainer";
import { useParams } from "react-router-dom";

function ReportRedirect() {
  const { id } = useParams();
  return <Navigate to={`/interview/${id}/responses`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/create"
          element={
            <ProtectedRoute>
              <CreateInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-interview"
          element={
            <ProtectedRoute>
              <CreateInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/session/:interviewId"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/:interviewId/phase-complete"
          element={
            <ProtectedRoute>
              <PhaseCompleteTransition />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/:id/responses"
          element={
            <ProtectedRoute>
              <InterviewResponses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/responses/:id"
          element={
            <ProtectedRoute>
              <InterviewResponses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/full"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/full/:round"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />



        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <ReportRedirect />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticeHub />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/coding"
            element={
              <ProtectedRoute>
                <PracticeDashboard />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/aptitude"
            element={
              <ProtectedRoute>
                <AptitudeDashboard />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/potd/archive"
            element={
              <ProtectedRoute>
                <POTDArchive />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/:mode"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/:mode/:questionId"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
