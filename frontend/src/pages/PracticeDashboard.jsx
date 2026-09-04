import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "../utils/toast";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import PracticeDashboardSidebar from "../components/practice-dashboard/PracticeDashboardSidebar";
import POTDSection from "../components/practice-dashboard/POTDSection";
import QuestionFilters from "../components/practice-dashboard/QuestionFilters";
import QuestionTable from "../components/practice-dashboard/QuestionTable";
import AiQuestionModal from "../components/practice-dashboard/AiQuestionModal";

export default function PracticeDashboard() {
  const navigate = useNavigate();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Sachin" };

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortKey, setSortKey] = useState("None");
  const [activeSection, setActiveSection] = useState("library"); // 'library' or 'favorites'

  // AI Generator states
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRole, setAiRole] = useState("Frontend Developer");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiTopic, setAiTopic] = useState("Arrays");
  const [aiCompany, setAiCompany] = useState("Google");
  const [generating, setGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // User solved data
  const [myPractice, setMyPractice] = useState({ solved: [], attempted: [], saved: [], bookmarked: [] });

  // POTD states
  const [potdData, setPotdData] = useState(null);
  const [potdLoading, setPotdLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const fetchPOTD = async () => {
    try {
      setPotdLoading(true);
      const res = await api.get("/potd/current");
      if (res.data && res.data.success) {
        setPotdData(res.data);
        setCountdown(res.data.countdownMs || 0);
      }
    } catch (err) {
      console.error("Error loading POTD:", err);
    } finally {
      setPotdLoading(false);
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          fetchPOTD();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Load Question Library
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/compiler/questions");
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Error loading question library:", err);
      // fallback mock list matching the user request
      const fallbackQuestions = [
        { _id: "665efb773663a8a3a96cd840", title: "Two Sum", difficulty: "Easy", tags: ["Arrays"], acceptance: "81%" },
        { _id: "665efb773663a8a3a96cd841", title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack"], acceptance: "74%" },
        { _id: "665efb773663a8a3a96cd842", title: "Merge Intervals", difficulty: "Medium", tags: ["Arrays"], acceptance: "58%" },
        { _id: "665efb773663a8a3a96cd843", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["Arrays"], acceptance: "69%" }
      ];
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Load User Stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/compiler/questions/my-practice");
      setMyPractice(res.data || { solved: [], attempted: [], saved: [], bookmarked: [] });
    } catch (err) {
      console.error("Error loading my practice stats:", err);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = async (id) => {
    try {
      const res = await api.post(`/compiler/questions/${id}/bookmark`);
      toast.success(res.data.bookmarked ? "Bookmarked question!" : "Removed bookmark");
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update bookmark.");
    }
  };

  useEffect(() => {
    fetchLibrary();
    fetchStats();
    fetchPOTD();

    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Handle AI Question Generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setValidationErrors([]);
    try {
      const res = await api.post("/compiler/generate", {
        role: aiRole,
        difficulty: aiDifficulty,
        topic: aiTopic,
        company: aiCompany,
      });
      if (res.data && res.data.success) {
        toast.success("✨ AI Question generated successfully!");
        setShowAiModal(false);
        fetchLibrary();
        fetchStats();
      }
    } catch (err) {
      console.error("AI question generation failed:", err);
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        toast.error("Question failed validation checks.");
      } else {
        toast.error(err.response?.data?.message || "Failed to generate question.");
      }
    } finally {
      setGenerating(false);
    }
  };

  // Filter problems
  const bookmarkedIds = new Set(myPractice.bookmarked?.map(b => String(b._id || b)) || []);
  const filteredQuestions = questions.filter((q) => {
    if (activeSection === "favorites" && !bookmarkedIds.has(String(q._id))) {
      return false;
    }

    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === "All" || q.difficulty === selectedDifficulty;

    const matchesTag =
      selectedTag === "All" || (q.tags || []).includes(selectedTag);

    const isSolved = myPractice.solved.some(s => (s._id || s) === q._id);
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Solved" && isSolved) ||
      (selectedStatus === "Unsolved" && !isSolved);

    return matchesSearch && matchesDifficulty && matchesTag && matchesStatus;
  });

  // Sort logic
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortKey === "Title") {
      return a.title.localeCompare(b.title);
    }
    if (sortKey === "Acceptance") {
      const aVal = parseInt(a.acceptance) || 0;
      const bVal = parseInt(b.acceptance) || 0;
      return bVal - aVal;
    }
    if (sortKey === "Difficulty") {
      const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
      return (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
    }
    return 0; // None
  });

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("All");
    setSelectedTag("All");
    setSelectedStatus("All");
    setSortKey("None");
  };

  // Find Problem of the Day
  const potd = questions.find(q => q.title === "Two Sum") || questions[0];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans transition-colors duration-200">
      
      <Navbar />

      {/* Main Grid Layout with Sidebar */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        <PracticeDashboardSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          questions={questions}
          myPractice={myPractice}
          navigate={navigate}
        />

        {/* Dynamic Content Panel */}
        <div className="flex-grow flex-1 min-w-0 space-y-8">
          
          {/* Section 1: Problem of the Day (Only visible in library tab) */}
          {activeSection === "library" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block">
                  Problem of the Day
                </span>
                {countdown > 0 && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    ⏱ Next Problem: {formatCountdown(countdown)}
                  </span>
                )}
              </div>
              <POTDSection
                potdLoading={potdLoading}
                potdData={potdData}
                countdown={countdown}
                formatCountdown={formatCountdown}
                navigate={navigate}
                toggleBookmark={toggleBookmark}
                bookmarkedIds={bookmarkedIds}
              />
            </section>
          )}

          {/* Section 2: Problem Library */}
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-base font-bold text-brand-text tracking-tight">
                  {activeSection === "library" ? "Problem Library" : "My Favorites"}
                </h3>
                <p className="text-[11px] text-brand-secondary mt-0.5">
                  {activeSection === "library" ? `${questions.length} Problems Available` : `${filteredQuestions.length} Favorite Problems`}
                </p>
              </div>
            </div>

            <QuestionFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortKey={sortKey}
              setSortKey={setSortKey}
              setShowAiModal={setShowAiModal}
            />

            <QuestionTable
              loading={loading}
              sortedQuestions={sortedQuestions}
              myPractice={myPractice}
              bookmarkedIds={bookmarkedIds}
              toggleBookmark={toggleBookmark}
              navigate={navigate}
              handleResetFilters={handleResetFilters}
            />
          </section>
        </div>

      </main>

      <AiQuestionModal
        showAiModal={showAiModal}
        setShowAiModal={setShowAiModal}
        generating={generating}
        handleGenerate={handleGenerate}
        aiTopic={aiTopic}
        setAiTopic={setAiTopic}
        aiDifficulty={aiDifficulty}
        setAiDifficulty={setAiDifficulty}
        aiRole={aiRole}
        setAiRole={setAiRole}
        aiCompany={aiCompany}
        setAiCompany={setAiCompany}
        validationErrors={validationErrors}
      />
    </div>
  );
}
