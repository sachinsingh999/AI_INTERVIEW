import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auth from "./pages/Auth";
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
import Notifications from "./pages/Notifications";
import Bookmarks from "./pages/Bookmarks";
import ForgeAI from "./pages/ForgeAI";
import POTDArchive from "./pages/POTDArchive";
import DailyChallenges from "./pages/DailyChallenges";
import CreateInterview from "./pages/CreateInterview";
import InterviewSession from "./pages/InterviewSession";
import PhaseCompleteTransition from "./pages/PhaseCompleteTransition";
import InterviewResponses from "./pages/InterviewResponses";
import InterviewCompleted from "./pages/InterviewCompleted";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
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
        {/* Public / Guest-only Routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth initialMode="login" />
            </PublicRoute>
          }
        />

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
          path="/interview/:interviewId/completed"
          element={
            <ProtectedRoute>
              <InterviewCompleted />
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
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
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
          path="/forge-ai"
          element={
            <ProtectedRoute>
              <ForgeAI />
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
                <DailyChallenges />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/potd"
            element={
              <ProtectedRoute>
                <DailyChallenges />
              </ProtectedRoute>
            }
          />
        <Route
            path="/practice/daily-challenges"
            element={
              <ProtectedRoute>
                <DailyChallenges />
              </ProtectedRoute>
            }
          />
        <Route
            path="/daily-challenges"
            element={
              <ProtectedRoute>
                <DailyChallenges />
              </ProtectedRoute>
            }
          />
        <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <DailyChallenges />
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
