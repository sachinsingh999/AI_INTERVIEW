import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function CandidateProfile() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [roundsDetails, setRoundsDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Decision modal state
  const [showModal, setShowModal] = useState(false);
  const [decisionType, setDecisionType] = useState("");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [releasing, setReleasing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/interviews/admin/all");
      const userRounds = (res.data || []).filter(r => r.user?._id === candidateId);
      
      if (userRounds.length === 0) {
        setError("Candidate profile has no recorded interview sessions.");
        setLoading(false);
        return;
      }

      const firstRound = userRounds[0];
      const detailsList = await Promise.all(
        userRounds.map(async (r) => {
          try {
            const detail = await api.get(`/interviews/admin/${r._id}/responses`);
            return detail.data;
          } catch (e) {
            console.error("Error loading responses for round:", r._id, e);
            return null;
          }
        })
      );

      const filteredDetails = detailsList.filter(Boolean);

      setProfile({
        id: candidateId,
        name: firstRound.user?.name || "Anonymous",
        email: firstRound.user?.email || "",
        role: firstRound.role || "Software Engineer",
        difficulty: firstRound.difficulty || "Intermediate",
        resumeText: firstRound.resumeText || "No resume text uploaded.",
      });

      const sortedDetails = filteredDetails.sort(
        (a, b) => new Date(b.interview.createdAt) - new Date(a.interview.createdAt)
      );
      setRoundsDetails(sortedDetails);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.response?.data?.message || "Failed to load candidate details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [candidateId]);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (roundsDetails.length === 0) return;
    try {
      setReleasing(true);
      // Releases report for the last round as a proxy for the final decision status
      const lastRound = roundsDetails[roundsDetails.length - 1];
      const eligible = ["hire", "shortlist", "next"].includes(decisionType);
      
      await api.post(`/interviews/admin/${lastRound.interview._id}/release-report`, {
        eligible,
        customMessage: `Final Candidate Review Decision: ${decisionType.toUpperCase()}. Recruiter Remarks: ${decisionNotes}`
      });

      alert(`Decision recorded successfully: ${decisionType.toUpperCase()}`);
      setShowModal(false);
      fetchProfile();
    } catch (err) {
      console.error("Decision error:", err);
      alert("Failed to submit final decision.");
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400 font-semibold text-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
            Loading profile information...
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-sm font-black text-rose-500">Error Loading Candidate</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">{error || "Candidate not found."}</p>
            <button onClick={() => navigate("/candidates")} className="rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-black text-slate-200">
              Back to Candidates
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate composite metrics
  const oaRound = roundsDetails.find(r => r.interview.interviewType === "oa");
  const tech1Round = roundsDetails.find(r => r.interview.interviewType === "tech1");
  const tech2Round = roundsDetails.find(r => r.interview.interviewType === "tech2" || r.interview.interviewType === "code");
  const hrRound = roundsDetails.find(r => r.interview.interviewType === "video");

  const getScore = (round) => {
    if (!round) return 0;
    return parseFloat(round.averageScore || 0);
  };

  const getStatus = (round) => {
    if (!round) return "Locked";
    if (round.notification) {
      return round.notification.eligible ? "Passed" : "Failed";
    }
    if (round.interview?.interviewType === "oa") {
      return "Response Recorded";
    }
    return "Under Review";
  };

  const scoreOA = getScore(oaRound);
  const scoreTech1 = getScore(tech1Round);
  const scoreTech2 = getScore(tech2Round);
  const scoreHR = getScore(hrRound);

  // Weighted composite score
  // OA: 15%, Tech 1: 20%, Tech 2: 20%, Coding: 30%, HR: 15%
  // We can normalize if some rounds are not completed yet
  let totalWeights = 0;
  let totalScoreSum = 0;
  
  if (oaRound) { totalScoreSum += scoreOA * 1.5; totalWeights += 1.5; }
  if (tech1Round) { totalScoreSum += scoreTech1 * 2.0; totalWeights += 2.0; }
  if (tech2Round) { totalScoreSum += scoreTech2 * 5.0; totalWeights += 5.0; } // Coding & Tech 2 combined weight
  if (hrRound) { totalScoreSum += scoreHR * 1.5; totalWeights += 1.5; }

  const weightedScore = totalWeights > 0 ? parseFloat((totalScoreSum / totalWeights).toFixed(1)) : 0.0;

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/candidates")} className="text-slate-400 hover:text-slate-200 text-xs font-black">
              ← Candidates
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-black text-slate-200">{profile.name}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/final-evaluation/${candidateId}`)}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-black text-white active:scale-95 duration-100 cursor-pointer shadow-md shadow-indigo-600/15"
            >
              Weighting Matrix
            </button>
            <button
              onClick={() => {
                setDecisionType("hire");
                setShowModal(true);
              }}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-black text-white active:scale-95 duration-100 cursor-pointer shadow-md shadow-emerald-600/15"
            >
              Log Decision
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Candidate Card & Top Summaries */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Left Card: Summary Profile */}
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden">
              <span className="absolute top-0 right-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-650 text-lg font-black text-white shrink-0">
                {profile.name.charAt(0)}
              </span>
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-100">{profile.name}</h2>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mt-1">{profile.role}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase font-black text-slate-500">Email Address</span>
                    <span className="text-slate-300 block mt-1">{profile.email}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-black text-slate-500">Difficulty Target</span>
                    <span className="text-slate-300 block mt-1">{profile.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Aggregate Metric */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between items-center text-center">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">AI Weighted Score</span>
                <span className="text-5xl font-black text-indigo-400 block mt-2">{weightedScore} <span className="text-lg text-slate-500">/ 10</span></span>
              </div>
              <span className="inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-indigo-400 mt-4">
                Recommended Decision: {weightedScore >= 7.5 ? "Strong Hire" : weightedScore >= 6.0 ? "Pass/Clear" : "Needs Review"}
              </span>
            </div>
          </div>

          {/* Timeline and Interactive Stage Reviews */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Interview timeline</h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Online Assessment (OA)", key: "oa", detail: oaRound, score: scoreOA, route: (id) => `/candidates/${candidateId}/oa-review` },
                { label: "Technical Round 1", key: "tech1", detail: tech1Round, score: scoreTech1, route: (id) => `/review/${id}` },
                { label: "Technical Round 2 (Coding)", key: "code", detail: tech2Round, score: scoreTech2, route: (id) => `/coding-review/${id}` },
                { label: "HR Assessment Round", key: "video", detail: hrRound, score: scoreHR, route: (id) => `/hr-review/${id}` },
              ].map((stage, idx) => {
                const status = getStatus(stage.detail);
                const hasDetails = !!stage.detail;

                return (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Stage {idx + 1}</span>
                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          status === "Passed" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          status === "Failed" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                          status === "Under Review" ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" :
                          "bg-slate-850 text-slate-500 border border-slate-800"
                        }`}>
                          {status}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-200 mt-2">{stage.label}</h4>
                      {hasDetails && (
                        <p className="text-[10px] font-black text-indigo-400 mt-2">Avg Score: {stage.score} / 10</p>
                      )}
                    </div>
                    {hasDetails ? (
                      <button
                        onClick={() => navigate(stage.route(stage.detail.interview._id))}
                        className="w-full mt-4 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 py-2.5 text-[10px] font-black text-indigo-400 cursor-pointer active:scale-95 duration-100"
                      >
                        Review Responses →
                      </button>
                    ) : (
                      <div className="w-full mt-4 rounded-xl border border-slate-800/40 py-2.5 text-[10px] font-bold text-slate-600 text-center select-none bg-slate-950/20">
                        🔒 Not Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resume and Transcripts View */}
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Resume Analysis</h3>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 max-h-60 overflow-y-auto text-xs leading-relaxed text-slate-400 font-semibold select-all custom-scrollbar">
              {profile.resumeText}
            </div>
          </div>
        </main>

        {/* Action Decision Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-dropdown-in text-left">
              <div>
                <h3 className="text-md font-black tracking-tight text-slate-200">Log Final Candidate Decision</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-1">This will release the review status evaluations to the candidate's desk.</p>
              </div>
              <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black text-slate-400">Select Status</label>
                  <select
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value)}
                    className="w-full rounded-xl border border-slate-850 bg-slate-950 px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="hire">Hire Candidate (Clears Next Round)</option>
                    <option value="shortlist">Shortlist for Review</option>
                    <option value="hold">Place on Hold</option>
                    <option value="reject">Reject Application</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-black text-slate-400">Recruiter Evaluation Remarks</label>
                  <textarea
                    rows={4}
                    placeholder="Enter details, strengths, weak areas and decision reasons..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-850 bg-slate-950 p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 placeholder-slate-655"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-black text-slate-400 hover:text-slate-350 cursor-pointer active:scale-95 duration-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={releasing}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-black text-white cursor-pointer active:scale-95 duration-100 disabled:opacity-40"
                  >
                    {releasing ? "Submitting..." : "Submit Decision"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
