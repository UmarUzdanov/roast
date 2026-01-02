import { PERSONAS, PHASE_META } from "../personaTheme.js";

const loaderIcons = {
  claude: "loader-icon--claude",
  gpt: "loader-icon--gpt",
  gemini: "loader-icon--gemini",
};

function Round({ phase, messages, champion, records }) {
  const meta = PHASE_META[phase] ?? { label: phase };

  return (
    <section className="pt-2">
      <div className="round-divider">{meta.label}</div>
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PERSONAS).map(([key, persona]) => {
          const payload = normalizeMessage(messages?.[key]);
          const isChampion = champion === key;
          const record = records?.[key] ?? { wins: 0, losses: 0 };
          const bubbleStyle = {
            borderColor: isChampion ? "rgba(251,191,36,0.6)" : persona.accentBorder,
            background: `linear-gradient(135deg, ${persona.accentSoft}, rgba(15, 23, 42, 0.95))`,
            boxShadow: `0 0 20px ${persona.accentStrong}`,
          };

          return (
            <article
              key={`${phase}-${key}`}
              className="rounded-2xl border border-slate-900/50 bg-slate-950/40 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.55)]"
            >
              <header className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {persona.name} {isChampion ? "👑" : ""}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    {persona.title}
                  </p>
                </div>
                <div className="rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-400">
                  {record.wins}-{record.losses}
                </div>
              </header>
              <div className="mt-4">
                {payload.status === "loading" ? (
                  <div className="loader-badge border-slate-800/80 bg-slate-900/70">
                    <span className={loaderIcons[key]}>{persona.badge}</span>
                    <span>{persona.loaderLabel}</span>
                  </div>
                ) : (
                  <p className="bubble text-slate-100" style={bubbleStyle}>
                    {payload.text || "Awaiting burn..."}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function normalizeMessage(entry) {
  if (!entry) {
    return { text: "", status: "idle" };
  }
  if (typeof entry === "string") {
    return { text: entry, status: "ready" };
  }
  return {
    text: entry.text ?? "",
    status: entry.status ?? "ready",
  };
}

export default Round;
