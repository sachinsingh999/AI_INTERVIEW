import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function FinalEvaluation() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [rounds, setRounds] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive weights (defaults: OA 15%, Tech 1 20%, Tech 2 (Coding) 50%, HR 15%)
  const [weightOA, setWeightOA] = useState(15);
  const [weightTech1, setWeightTech1] = useState(20);
  const [weightCoding, setWeightCoding] = useState(50);
  const [weightHR, setWeightHR] = useState(15);

  const fetchRoundsData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/interviews/admin/all");
      const userRounds = (res.data || []).filter(r => r.user?._id === candidateId);
      
      if (userRounds.length === 0) {
        setError("Candidate has no recorded round sessions.");
        setLoading(false);
        return;
      }

      const firstRound = userRounds[0];
      setProfile({
        name: firstRound.user?.name || "Anonymous",
        email: firstRound.user?.email || "",
        role: firstRound.role || "Software Engineer",
      });

      const details = {};
      await Promise.all(
        userRounds.map(async (r) => {
          try {
            const detail = await api.get(`/interviews/admin/${r._id}/responses`);
            details[r.interviewType] = detail.data;
          } catch (e) {
            console.error("Error loading responses:", r._id, e);
          }
        })
      );

      setRounds(details);
    } catch (err) {
      console.error(err);
      setError("Failed to load candidate rounds for matrix evaluation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoundsData();
  }, [candidateId]);

  const getScore = (key) => {
    const round = rounds[key] || rounds["code"]; // coding round handles key: code
    if (!round) return 0;
    return parseFloat(round.averageScore || 0);
  };

  const scoreOA = getScore("oa");
  const scoreTech1 = getScore("tech1");
  const scoreCoding = getScore("code") || getScore("tech2");
  const scoreHR = getScore("video");

  // Sum of weights
  const sumWeights = weightOA + weightTech1 + weightCoding + weightHR;

  // Composite Weighted Score
  const compositeScore = sumWeights > 0 
    ? parseFloat(((scoreOA * weightOA + scoreTech1 * weightTech1 + scoreCoding * weightCoding + scoreHR * weightHR) / sumWeights).toFixed(2))
    : 0;

  return (
    <div className="flex min-h-screen bg-[#0B1220] text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800/60 bg-[#0B1220]/75 backdrop-blur-xl flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-200 text-xs font-black">
              ← Candidate Profile
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-black text-slate-200 uppercase">Weighting Matrix Center</span>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400 font-semibold text-xs">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/20 border-t-indigo-500 mx-auto mb-3" />
              Loading calculations map...
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md w-full rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center font-bold text-xs text-rose-500">
              {error}
            </div>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
              {/* Left Panel: Weight Adjustment Form */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">Scoring Weighted Matrix</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Customize weights allocated to each candidate assessment stage.</p>
                </div>

                <div className="space-y-5 text-xs font-semibold">
                  {[
                    { label: "Online Assessment (OA)", val: weightOA, setVal: setWeightOA, score: scoreOA },
                    { label: "Technical Round 1", val: weightTech1, setVal: setWeightTech1, score: scoreTech1 },
                    { label: "Coding Assessment (Tech 2)", val: weightCoding, setVal: setWeightCoding, score: scoreCoding },
                    { label: "HR Assessment Round", val: weightHR, setVal: setWeightHR, score: scoreHR },
                  ].map((row, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-850 bg-slate-950/40 p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-200">{row.label}</span>
                        <span className="text-indigo-400 font-black">Score: {row.score} / 10</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-black">
                          <span>Adjust Weight</span>
                          <span>{row.val}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={row.val}
                          onChange={(e) => row.setVal(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Composite Results Summary */}
              <div className="space-y-6">
                {/* Result Card */}
                <div className="rounded-3xl border border-slate-800 bg-[#0B1220] p-6 text-center space-y-5">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Final Weighted Score</span>
                  <span className="text-6xl font-black text-indigo-400 block">{compositeScore} <span className="text-xl text-slate-600">/ 10</span></span>
                  <div className="text-xs font-semibold text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-2xl">
                    <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">Matrix Weights Sum</span>
                    The total allocated weight distribution is <span className="text-slate-200 font-bold">{sumWeights}%</span>. 
                    {sumWeights !== 100 && (
                      <span className="text-rose-500 block mt-1">⚠️ Warning: Sum should equal 100% for proper conversion.</span>
                    )}
                  </div>
                </div>

                {/* Weights checklist overview */}
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Weights Breakdown</h3>
                  <div className="divide-y divide-slate-800 text-xs font-semibold text-slate-400">
                    <div className="flex justify-between py-3">
                      <span>Online Assessment</span>
                      <span className="text-slate-200 font-bold">{weightOA}%</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>Technical Round 1</span>
                      <span className="text-slate-200 font-bold">{weightTech1}%</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>Coding Challenge</span>
                      <span className="text-slate-200 font-bold">{weightCoding}%</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span>HR Interview</span>
                      <span className="text-slate-200 font-bold">{weightHR}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
