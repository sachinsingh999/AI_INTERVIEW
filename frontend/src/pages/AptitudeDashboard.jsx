import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "../utils/toast";
import Navbar from "../components/Navbar";
import CategorySelector from "../components/aptitude-dashboard/CategorySelector";
import AptitudeConfigForm from "../components/aptitude-dashboard/AptitudeConfigForm";
import OngoingSessionsList from "../components/aptitude-dashboard/OngoingSessionsList";
import CompletedAssessmentsList from "../components/aptitude-dashboard/CompletedAssessmentsList";
import AiAnalysisModal from "../components/aptitude-dashboard/AiAnalysisModal";

const categoryTopics = {
  "Quantitative Aptitude": [
    "Percentage",
    "Profit & Loss",
    "Ratio & Proportion",
    "Time & Work",
    "Speed Time Distance",
    "Number System",
    "Probability",
    "Permutation & Combination"
  ],
  "Logical Reasoning": [
    "Series & Sequences",
    "Syllogisms",
    "Blood Relations",
    "Seating Arrangement",
    "Coding-Decoding"
  ],
  "Verbal Ability": [
    "Synonyms & Antonyms",
    "Fill in the Blanks",
    "Correct Spellings",
    "Spotting Errors",
    "Sentence Improvement"
  ],
  "Data Interpretation": [
    "Bar Charts",
    "Pie Charts",
    "Line Graphs",
    "Data Tables"
  ]
};

export default function AptitudeDashboard() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Quantitative Aptitude");
  const [selectedTopic, setSelectedTopic] = useState("Percentage");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Modal analysis state
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedSessionForModal, setSelectedSessionForModal] = useState(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get("/aptitude/sessions");
      if (res.data?.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
      toast.error("Failed to load practice history.");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Adjust topic when category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedTopic(categoryTopics[category][0]);
  };

  // Create or Resume Session
  const handleStartSession = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.post("/aptitude/session", {
        topic: selectedTopic,
        difficulty,
        questionCount
      });
      if (res.data?.success) {
        if (res.data.message.includes("Resumed")) {
          toast.success("Resuming active session...");
        } else {
          toast.success("Practice set generated successfully!");
        }
        navigate(`/practice/aptitude/${res.data.session._id}`);
      }
    } catch (err) {
      console.error("Failed to generate set:", err);
      toast.error(err.response?.data?.message || "Failed to start practice session.");
    } finally {
      setGenerating(false);
    }
  };

  // Open Analysis Modal
  const openAnalysis = (session) => {
    setSelectedSessionForModal(session);
    setShowAnalysisModal(true);
  };

  const activeSessions = sessions.filter(s => s.status === "ongoing");
  const completedSessions = sessions.filter(s => s.status === "completed");

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-brand-text">
              AI Aptitude Practice Suite
            </h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1">
              Select a topic to generate custom aptitude evaluations, track persistence, and review analysis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          
          {/* Left Side: Topic Selector and Form */}
          <div className="space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 space-y-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <span>🎯</span> Configure Practice Set
              </h2>

              <CategorySelector
                categoryTopics={categoryTopics}
                selectedCategory={selectedCategory}
                handleCategoryChange={handleCategoryChange}
              />

              <AptitudeConfigForm
                handleStartSession={handleStartSession}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                categoryTopics={categoryTopics}
                selectedCategory={selectedCategory}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                questionCount={questionCount}
                setQuestionCount={setQuestionCount}
                generating={generating}
              />
            </div>

            <OngoingSessionsList
              loadingSessions={loadingSessions}
              activeSessions={activeSessions}
              navigate={navigate}
            />
          </div>

          {/* Right Side: History / Completed Sessions */}
          <CompletedAssessmentsList
            loadingSessions={loadingSessions}
            completedSessions={completedSessions}
            openAnalysis={openAnalysis}
          />

        </div>

      </main>

      <AiAnalysisModal
        showAnalysisModal={showAnalysisModal}
        setShowAnalysisModal={setShowAnalysisModal}
        selectedSessionForModal={selectedSessionForModal}
        setSelectedCategory={setSelectedCategory}
        setSelectedTopic={setSelectedTopic}
        setDifficulty={setDifficulty}
        setQuestionCount={setQuestionCount}
        categoryTopics={categoryTopics}
      />

    </div>
  );
}
