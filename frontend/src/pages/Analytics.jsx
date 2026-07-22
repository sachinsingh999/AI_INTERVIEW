import Navbar from "../components/Navbar";

function Analytics() {
  const kpis = [
    {
      label: "Confidence Index",
      val: "86%",
      sub: "Based on audio tone & posture",
      color: "text-blue-600 bg-blue-50/50 border-blue-200/50",
    },
    {
      label: "Eye Contact Rating",
      val: "91%",
      sub: "Face centering & gaze tracking",
      color: "text-emerald-700 bg-emerald-50/50 border-emerald-200/50",
    },
    {
      label: "Speaking Pace",
      val: "135 WPM",
      sub: "Optimal: 120-150 words/min",
      color: "text-indigo-650 bg-indigo-50/50 border-indigo-200/50",
    },
    {
      label: "Filler Words Frequency",
      val: "1.4/min",
      sub: "Excellent: Less than 3/min",
      color: "text-amber-700 bg-amber-50/50 border-amber-200/50",
    },
  ];

  const fillerWords = [
    { word: "basically", count: 4, pct: 40 },
    { word: "like", count: 3, pct: 30 },
    { word: "um / uh", count: 2, pct: 20 },
    { word: "actually", count: 1, pct: 10 },
  ];

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden text-brand-text">
      {/* Background ambient mesh */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/15 blur-[120px]" />
        <div className="absolute top-[35%] right-[20%] w-[35%] h-[35%] rounded-full bg-blue-200/10 blur-[100px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Performance insights</p>
          <h1 className="text-3xl font-black tracking-tight text-brand-text leading-none mt-2">Real-Time Analytics</h1>
          <p className="text-xs text-brand-secondary font-semibold mt-1">Aggregate statistics derived from your camera feed and spoken answers.</p>
        </div>

        {/* KPIs Grid */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-2xl border p-5 shadow-sm hover:translate-y-[-2px] transition-transform duration-200 ${kpi.color}`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                {kpi.label}
              </p>
              <p className="mt-2 text-3xl font-black">
                {kpi.val}
              </p>
              <p className="mt-2 text-[10px] font-bold opacity-60">
                {kpi.sub}
              </p>
            </div>
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2 items-start">
          {/* Filler words list card */}
          <div className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight">Filler Words Analysis</h2>
            <p className="text-xs text-brand-secondary font-semibold mt-1">Reducing filler words makes your responses sound much more direct.</p>

            <div className="mt-6 space-y-4">
              {fillerWords.map((item) => (
                <div key={item.word}>
                  <div className="flex items-center justify-between text-xs font-bold text-brand-secondary mb-1.5">
                    <span className="capitalize">{item.word}</span>
                    <span>{item.count} occurrences</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-bg">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips block */}
          <div className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight">AI Communication Critique</h2>
            <p className="text-xs text-brand-secondary font-semibold mt-1">Key improvement steps derived from your audio feed.</p>

            <div className="mt-6 space-y-4 text-xs font-bold text-brand-secondary">
              <div className="rounded-xl bg-brand-bg border border-brand-border/40 p-4">
                <p className="text-indigo-650 font-black uppercase text-[10px] tracking-wider">Pacing</p>
                <p className="mt-1 leading-relaxed">
                  Your speed of 135 WPM is ideal. However, when explaining coding algorithms, you tend to speed up. Try to pause for 1-2 seconds after introducing complex structures.
                </p>
              </div>
              <div className="rounded-xl bg-brand-bg border border-brand-border/40 p-4">
                <p className="text-emerald-755 font-black uppercase text-[10px] tracking-wider">Body Language</p>
                <p className="mt-1 leading-relaxed">
                  Eye contact was maintained well during the video call. Ensure that your webcam is directly at eye level to prevent looking down during text edits.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Analytics;
