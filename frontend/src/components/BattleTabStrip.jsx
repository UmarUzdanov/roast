const truncate = (text, max = 20) => {
  if (!text) return "Untitled";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

function BattleTabStrip({
  battles = [],
  activeBattleId,
  loading,
  error,
  onSelect,
  onNewBattle,
}) {
  return (
    <section className="panel border border-slate-800/80 bg-slate-950/70 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
        <span>History</span>
        {error && <span className="text-rose-300 normal-case tracking-normal">{error}</span>}
      </div>
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={onNewBattle}
          className={`rounded-full px-4 py-2 text-sm transition ${
            !activeBattleId
              ? "border border-amber-400/70 bg-amber-400/10 text-amber-100"
              : "border border-slate-800/70 bg-slate-900/40 text-slate-200"
          }`}
        >
          🔴 New Battle
        </button>
        {loading && (
          <span className="rounded-full border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm text-slate-500">
            Loading…
          </span>
        )}
        {!loading &&
          battles.map((battle) => {
            const isActive = activeBattleId === battle.id;
            return (
              <button
                key={battle.id}
                type="button"
                onClick={() => onSelect?.(battle.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive
                    ? "border border-amber-400/70 bg-amber-400/10 text-amber-100"
                    : "border border-slate-800/70 bg-slate-900/40 text-slate-200 hover:border-amber-300/60"
                }`}
              >
                {truncate(battle.topic)} {battle.winner ? "👑" : ""}
              </button>
            );
          })}
      </div>
    </section>
  );
}

export default BattleTabStrip;
