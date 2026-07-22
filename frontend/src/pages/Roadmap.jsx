import Navbar from "../components/Navbar";

function Roadmap() {
  const steps = [
    {
      title: "1. Core Logic & Coding Speed",
      status: "completed",
      score: "8.2 Average",
      desc: "Hone clean array logic and functional closures under pressure.",
      resources: [
        { label: "V8 Engines under the hood", link: "#" },
        { label: "LeetCode patterns cheat sheet", link: "#" },
      ],
      checklist: [
        { text: "Solve 5 array-grouping exercises", checked: true },
        { text: "Implement custom debouncers without templates", checked: true },
      ],
    },
    {
      title: "2. System Design Scalability",
      status: "in-progress",
      score: "5.4 Average",
      desc: "Hone database caching policies, sharding keys, and message queue architecture.",
      resources: [
        { label: "Designing Data-Intensive Applications summary", link: "#" },
        { label: "Redis Caching patterns checklist", link: "#" },
      ],
      checklist: [
        { text: "Read on Write-Through vs Write-Back cache", checked: true },
        { text: "Design an active API token invalidator whiteboard", checked: false },
      ],
    },
    {
      title: "3. Body Language & Video Delivery",
      status: "pending",
      score: "7.0 Average",
      desc: "Maintain constant focus alignment and reduce filler word counts.",
      resources: [
        { label: "Public speaking guidelines by Stanford", link: "#" },
        { label: "Filler words elimination handbook", link: "#" },
      ],
      checklist: [
        { text: "Complete 3 video call mocks without scripts", checked: false },
        { text: "Maintain optimal 140 WPM spoken speed", checked: false },
      ],
    },
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Personalized timeline</p>
            <h1 className="text-3xl font-black tracking-tight text-brand-text leading-none mt-2">Preparation Roadmap</h1>
            <p className="text-xs text-brand-secondary font-semibold mt-1">Custom action nodes computed from your mock feedback history.</p>
          </div>
          <span className="shrink-0 rounded-full bg-indigo-50 border border-indigo-200/50 px-3.5 py-1 text-xs font-black text-indigo-700">
            Roadmap 60% complete
          </span>
        </div>

        {/* Timeline node items */}
        <div className="relative border-l border-brand-border ml-4 pl-8 space-y-10">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Timeline marker */}
              <span className={`absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-[#fafbfc] text-xs font-black uppercase tracking-wider ${
                step.status === "completed"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/10"
                  : step.status === "in-progress"
                    ? "bg-blue-650 text-white shadow-sm shadow-blue-500/10"
                    : "bg-brand-card border border-slate-300 text-brand-secondary"
              }`}>
                {idx + 1}
              </span>

              {/* Node Card */}
              <div className="rounded-2xl border border-brand-border bg-brand-card/80 backdrop-blur-md p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-black text-brand-text leading-none">{step.title}</h3>
                    <p className="text-xs text-brand-secondary font-bold mt-1.5 leading-relaxed">{step.desc}</p>
                  </div>
                  <span className={`w-fit rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                    step.status === "completed"
                      ? "border-emerald-250 bg-emerald-50 text-emerald-800"
                      : step.status === "in-progress"
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : "border-brand-border bg-brand-bg text-brand-secondary"
                  }`}>
                    {step.score}
                  </span>
                </div>

                {/* Checklist */}
                <div className="mt-5 space-y-2 border-t border-brand-border/40 pt-4">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-2">Checklist items</span>
                  {step.checklist.map((item, cidx) => (
                    <label key={cidx} className="flex items-center gap-3 text-xs font-semibold text-brand-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="h-4 w-4 rounded border-slate-350 text-indigo-600"
                      />
                      <span className={item.checked ? "line-through opacity-70" : ""}>{item.text}</span>
                    </label>
                  ))}
                </div>

                {/* Resource buttons */}
                <div className="mt-5 space-y-2.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-brand-secondary mb-2">Recommended reads</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {step.resources.map((res, ridx) => (
                      <a
                        key={ridx}
                        href={res.link}
                        className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 text-xs font-bold text-brand-text transition hover:border-slate-300 hover:bg-brand-bg hover:scale-[1.01] active:scale-98 duration-100"
                      >
                        {res.label}
                        <span className="text-brand-secondary">➔</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Roadmap;
