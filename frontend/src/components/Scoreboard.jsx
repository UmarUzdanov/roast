import { PERSONAS } from "../personaTheme.js";

function Scoreboard({ champion, records = {}, streak = 0, loading = false }) {
  return (
    <section className="panel sticky top-4 z-20 px-6 py-5 shadow-[0_10px_55px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Scoreboard</p>
          <h1 className="text-3xl font-semibold text-slate-50">Leaderboard</h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="opacity-70">Streak</span>
          <span className="rounded-full bg-slate-900/70 px-4 py-1 text-base font-semibold text-amber-300">
            {loading ? "…" : `${streak} 🔥`}
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {Object.entries(PERSONAS).map(([key, persona]) => {
          const record = records[key] ?? { wins: 0, losses: 0 };
          const isChampion = champion === key;
          return (
            <article
              key={key}
              className={`rounded-2xl border px-4 py-3 transition-all ${
                isChampion
                  ? "border-amber-400/70 bg-amber-400/10 shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                  : "border-slate-800/80 bg-slate-900/70"
              }`}
            >
              <header className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-100">{persona.name}</span>
                <span className="text-slate-500">{persona.title}</span>
              </header>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold">
                  {loading ? "—" : `${record.wins}-${record.losses}`}
                </p>
                <span
                  className={`text-2xl ${isChampion ? "animate-pulse" : ""}`}
                  role="img"
                  aria-label={isChampion ? "current champion" : "contender"}
                >
                  {isChampion ? "👑" : persona.badge}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Scoreboard;
