import { PERSONAS } from "../personaTheme.js";

function HistorySidebar({ battles, loading, error, onSelect, open, onToggle }) {
  return (
    <aside
      className={`panel max-h-[calc(100vh-140px)] w-full max-w-xs overflow-hidden border border-slate-800/80 bg-slate-950/70 transition-all duration-300 ${
        open ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-60"
      }`}
    >
      <header className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">History</p>
          <h3 className="text-lg font-semibold text-slate-100">Past Battles</h3>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-400"
          onClick={onToggle}
        >
          {open ? "Hide" : "Show"}
        </button>
      </header>
      <div className="overflow-y-auto px-4 py-3">
        {loading && <p className="text-sm text-slate-500">Loading history…</p>}
        {error && (
          <p className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}
        {!loading && !error && battles.length === 0 && (
          <p className="text-sm text-slate-500">No battles yet. Start one!</p>
        )}
        <ul className="space-y-3">
          {battles.map((battle) => (
            <li key={battle.id}>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/50 p-3 text-left text-sm text-slate-300 transition hover:border-amber-400/60"
                onClick={() => onSelect?.(battle.id)}
              >
                <p className="text-slate-100">{battle.topic}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{battle.matchup}</p>
                <footer className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(battle.created_at).toLocaleString()}</span>
                  {battle.winner && (
                    <span className="flex items-center gap-1 text-amber-300">
                      👑 {PERSONAS[battle.winner]?.name ?? battle.winner}
                    </span>
                  )}
                </footer>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default HistorySidebar;
