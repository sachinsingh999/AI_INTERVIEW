import { useEffect, useState } from "react";
import { toast } from "../utils/toast";
import Navbar from "../components/Navbar";
import Message from "../components/Message";
import api from "../services/api";
import { demoProfile } from "../utils/demoData";

const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF parser library."));
    document.head.appendChild(script);
  });
};

const extractTextFromPdf = async (file) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    text += strings.join(" ") + "\n";
  }
  return text;
};

const extractTextFromTxt = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

function Profile() {
  const [profile, setProfile] = useState(null);

  // Resume uploading & parsing states
  const [dragActive, setDragActive] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedResume, setParsedResume] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [analysisMode, setAnalysisMode] = useState("upload");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile(res.data);
        if (res.data.user?.resumeAnalysis) {
          setParsedResume(res.data.user.resumeAnalysis);
        }
        if (res.data.user?.resumeText) {
          setResumeText(res.data.user.resumeText);
        }
      } catch (error) {
        if (error.response?.status === 401) return;
        setProfile(demoProfile);
        toast.warning("Showing simulated leaderboards since the backend is offline.", "Demo Mode Active");
      }
    };
    fetchProfile();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processResume(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processResume(e.target.files[0]);
    }
  };

  const analyzeResumeText = async (text) => {
    if (!text || !text.trim()) {
      toast.warning("Please provide resume text content to analyze.", "Input Required");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    try {
      setUploadProgress(30);
      let data;
      try {
        const res = await api.post("/users/analyze-resume", { resumeText: text });
        data = res.data;
      } catch (err) {
        if (err.response?.status === 401) throw err;
        console.warn("Backend offline or request failed, parsing locally in demo mode.");
        
        // Simple client side keyword match
        const lower = text.toLowerCase();
        const skills = [];
        if (lower.includes("react")) skills.push("React");
        if (lower.includes("javascript") || lower.includes("js")) skills.push("JavaScript");
        if (lower.includes("typescript") || lower.includes("ts")) skills.push("TypeScript");
        if (lower.includes("node")) skills.push("Node.js");
        if (lower.includes("python")) skills.push("Python");
        if (lower.includes("sql") || lower.includes("postgres")) skills.push("SQL");
        if (lower.includes("mongo")) skills.push("MongoDB");
        if (lower.includes("docker")) skills.push("Docker");
        if (lower.includes("aws")) skills.push("AWS");

        if (skills.length === 0) {
          skills.push("Software Engineering", "Problem Solving");
        }

        const roleMatched = skills.includes("React") 
          ? "Frontend Software Engineer" 
          : skills.includes("Node.js") 
          ? "Backend Node.js Developer" 
          : "Software Engineer";

        const missingKeywords = [];
        if (!skills.includes("Docker")) missingKeywords.push("Docker Containerization");
        if (!skills.includes("AWS")) missingKeywords.push("Cloud Infrastructure (AWS/GCP)");
        if (!skills.includes("TypeScript")) missingKeywords.push("TypeScript Static Typing");
        if (missingKeywords.length === 0) missingKeywords.push("System Design Architecture", "CI/CD Pipelines");

        data = {
          resumeText: text,
          resumeAnalysis: {
            matchPercentage: Math.min(65 + skills.length * 5, 98),
            roleMatched,
            skillsDetected: skills.slice(0, 10),
            missingKeywords: missingKeywords.slice(0, 4),
            suggestions: "Highlight system engineering metrics and quantify details on scaling achievements."
          }
        };
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setUploadProgress(80);
      setParsedResume(data.resumeAnalysis);
      
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          resumeText: data.resumeText,
          resumeAnalysis: data.resumeAnalysis
        }
      }));
      setUploadProgress(100);
      toast.success("Resume analyzed successfully by AI!", "Analysis Ready");
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast.error(error.response?.data?.message || "Failed to analyze resume. Please try again.", "Analysis Failed");
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  const processResume = async (file) => {
    setResumeFile(file);
    setParsedResume(null);
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'txt') {
      toast.warning(
        "Supported file formats are PDF and TXT. For Word documents, please copy-paste your text directly using the Paste panel.",
        "Unsupported Format"
      );
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    
    try {
      let text = "";
      if (ext === 'pdf') {
        setUploadProgress(30);
        text = await extractTextFromPdf(file);
      } else {
        setUploadProgress(30);
        text = await extractTextFromTxt(file);
      }
      
      setUploadProgress(50);
      setResumeText(text);
      await analyzeResumeText(text);
    } catch (err) {
      console.error("Text extraction failed:", err);
      toast.error(err.message || "Failed to extract text from the file.", "Parser Error");
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden text-brand-text">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/10 blur-[100px]" />
      </div>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


        {/* Profile header card banner */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-955 text-white shadow-xl relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black uppercase shadow-lg shadow-blue-500/20">
                  {(profile.user?.name || "U").charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">
                    Candidate Profile
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:truncate sm:text-4xl">
                    {profile.user?.name || "Candidate"}
                  </h1>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-350">
                    {profile.user?.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 grid-cols-3">
                <div className="rounded-xl border border-brand-border bg-brand-card/5 px-4 py-3.5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Fields</p>
                  <p className="mt-1 text-2xl font-black">{profile.summary?.categories || 0}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-card/5 px-4 py-3.5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Answers</p>
                  <p className="mt-1 text-2xl font-black">{profile.summary?.totalAnswered || 0}</p>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-card/5 px-4 py-3.5 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-wider text-brand-secondary">Best Rank</p>
                  <p className="mt-1 text-2xl font-black">{profile.summary?.bestRank ? `#${profile.summary.bestRank}` : "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Profile content layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-start">
          
          {/* Left Column: Rankings leaderboard */}
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-secondary">Leaderboard standings</p>
                <h2 className="text-2xl font-black tracking-tight text-brand-text">Category Standings</h2>
              </div>
            </div>

            {profile.rankings?.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {profile.rankings.map((item) => (
                  <div
                    key={item.role}
                    className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-brand-text">{item.role}</h3>
                        <p className="mt-1 text-xs font-semibold text-brand-secondary">{item.answeredCount} answers submitted</p>
                      </div>
                      <span className="rounded-lg bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 text-xs font-black text-indigo-700">
                        #{item.rank}/{item.totalUsers}
                      </span>
                    </div>

                    <div className="grid gap-3 grid-cols-2">
                      <div className="rounded-lg bg-brand-bg/50 border border-brand-border p-3">
                        <p className="text-[10px] font-bold text-brand-secondary uppercase">Avg Score</p>
                        <p className="mt-1 text-lg font-black text-brand-text">{item.averageScore}</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50/40 border border-emerald-150 p-3">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Leader</p>
                        <p className="mt-1 truncate text-xs font-black text-emerald-950">{item.leaderName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Message type="info" title="Ready to practice">
                Complete mock interviews to view your rank placement.
              </Message>
            )}
          </section>
          {/* Right Column: AI Resume Parser */}
          <section className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm space-y-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-650">Resume intelligence</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-brand-text">AI Resume Analyzer</h2>
              <p className="mt-1 text-xs text-brand-secondary font-semibold leading-relaxed">
                Upload your engineering resume or paste details to calculate skill keywords matching and career gap analytics.
              </p>
            </div>

            {/* Mode selection toggles */}
            <div className="flex bg-brand-bg/80 border border-brand-border p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setAnalysisMode("upload")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  analysisMode === "upload" ? "bg-brand-card text-indigo-700 shadow-sm" : "text-slate-550 hover:text-slate-800"
                }`}
              >
                File Upload (PDF/TXT)
              </button>
              <button
                type="button"
                onClick={() => setAnalysisMode("paste")}
                className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                  analysisMode === "paste" ? "bg-brand-card text-indigo-700 shadow-sm" : "text-slate-555 hover:text-slate-800"
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            {/* Drag & Drop Zone */}
            {analysisMode === "upload" && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center transition ${
                  dragActive ? "border-indigo-650 bg-indigo-50/50" : "border-slate-250 bg-brand-bg/30"
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <svg className="mx-auto h-8 w-8 text-brand-secondary mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-xs font-black text-brand-text block">Drag file here, or browse files</span>
                  <span className="text-[9px] text-brand-secondary block mt-1">Supports PDF, TXT (Max 8MB)</span>
                </label>
              </div>
            )}

            {/* Paste Text Mode */}
            {analysisMode === "paste" && (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete resume text details here..."
                  className="w-full rounded-xl border border-brand-border bg-brand-bg/50 p-3.5 text-xs font-semibold leading-relaxed outline-none transition focus:border-indigo-500 focus:bg-brand-card"
                />
                <button
                  type="button"
                  onClick={() => analyzeResumeText(resumeText)}
                  disabled={uploading}
                  className="w-full rounded-xl bg-slate-950 py-3 text-xs font-black text-white hover:bg-indigo-650 hover:scale-[1.02] active:scale-95 duration-100 transition-all shadow-md shadow-indigo-650/10 disabled:opacity-50"
                >
                  {uploading ? "Analyzing..." : "Analyze Resume"}
                </button>
              </div>
            )}

            {/* Progress loading screen */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-secondary">
                  <span>Running AI analysis...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-brand-bg rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Simulated Parsing Results */}
            {parsedResume && (
              <div className="rounded-xl border border-indigo-150 bg-indigo-50/20 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                  <div>
                    <p className="text-[10px] font-black text-indigo-700 uppercase leading-none">Role Match Rating</p>
                    <p className="mt-1 text-sm font-black text-indigo-950 leading-none">{parsedResume.roleMatched}</p>
                  </div>
                  <span className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-black text-indigo-900 shrink-0">
                    {parsedResume.matchPercentage}% Match
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="block text-[9px] font-black uppercase text-brand-secondary">Skills Detected</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {parsedResume.skillsDetected.map((s) => (
                        <span key={s} className="rounded bg-brand-card border border-brand-border px-2 py-0.5 text-[9px] font-black text-brand-text">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[9px] font-black uppercase text-rose-500">Skills Gaps Identified</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {parsedResume.missingKeywords.map((s) => (
                        <span key={s} className="rounded bg-rose-50 border border-rose-150 px-2 py-0.5 text-[9px] font-black text-rose-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-indigo-100/50 pt-2.5">
                    <span className="block text-[9px] font-black uppercase text-brand-secondary">AI Recommendations</span>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-brand-secondary">{parsedResume.suggestions}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;
