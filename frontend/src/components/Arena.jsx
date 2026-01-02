import Round from "./Round.jsx";
import { PERSONAS } from "../personaTheme.js";

function Arena({
  champion,
  records,
  battle,
  loading = false,
  error,
  onVote,
  voteState,
}) {
  const topic = battle?.topic ?? (loading ? "Summoning roasts..." : "Pick a topic to begin");
  const hasRounds = Boolean(battle?.rounds?.length);
  const showVote =
    Boolean(battle?.id) &&
    battle.rounds?.some((round) => round.phase.toLowerCase() === "closer");

  return (
    <section className="panel relative overflow-hidden px-6 py-8">
      <div className="absolute inset-x-10 top-0 h-32 bg-gradient-to-b from-amber-500/10 to-transparent blur-3xl" />
      <header className="relative flex flex-col gap-2 border-b border-slate-800/60 pb-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Arena</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-50">Elevated Group Chat</h2>
            <p className="text-sm text-slate-400">
              Topic: <span className="text-slate-100">{topic}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Current Champion</span>
            <span className="rounded-full border border-amber-400/60 bg-amber-400/10 px-3 py-1 text-base font-semibold text-amber-200">
              {PERSONAS[champion]?.name ?? champion ?? "—"} 👑
            </span>
          </div>
        </div>
      </header>
      <div className="relative mt-6 space-y-8">
        {loading && (
          <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
            Calling the CLIs… Claude, GPT, and Gemini are crafting burns.
          </div>
        )}
        {!loading && !hasRounds && (
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6 text-center text-slate-400">
            No battles yet. Drop a topic with <span className="text-slate-100">@arena</span> or{" "}
            <span className="text-slate-100">/dethrone</span> to start the carnage.
          </div>
        )}
        {battle?.rounds?.map((round) => (
          <Round
            key={`${battle.id}-${round.phase}`}
            phase={round.phase.toLowerCase()}
            messages={{
              claude: round.claude,
              gpt: round.gpt,
              gemini: round.gemini,
            }}
            champion={champion}
            records={records}
          />
        ))}
      </div>
      {error && (
        <p className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      {showVote && (
        <VoteBanner
          champion={champion}
          onVote={onVote}
          battleId={battle.id}
          voteState={voteState}
        />
      )}
    </section>
  );
}

function VoteBanner({ champion, onVote, battleId, voteState }) {
  const disabled = voteState?.status === "submitting" || voteState?.status === "success";
  return (
    <div className="mt-10 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Vote for the winner</p>
      <p className="text-lg font-semibold text-slate-50">Who dropped the hardest closer?</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Object.entries(PERSONAS).map(([key, persona]) => {
          const isChampion = champion === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onVote?.(battleId, key)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-slate-100 transition ${
                isChampion
                  ? "border-amber-400/70 bg-amber-400/10"
                  : "border-slate-800/80 bg-slate-900/60"
              } ${disabled ? "opacity-60" : "hover:border-amber-300/70"}`}
            >
              {voteState?.status === "success" && voteState?.winner === key
                ? "Voted ✅"
                : `Vote ${persona.name}`}
            </button>
          );
        })}
      </div>
      {voteState?.status === "error" && (
        <p className="mt-3 text-xs text-rose-300">{voteState.message}</p>
      )}
      {voteState?.status === "success" && (
        <p className="mt-3 text-xs text-emerald-300">
          Crown updated! Refresh scoreboard if it doesn’t update automatically.
        </p>
      )}
    </div>
  );
}

export default Arena;
