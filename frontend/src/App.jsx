import { useEffect, useState } from "react";
import Arena from "./components/Arena.jsx";
import Scoreboard from "./components/Scoreboard.jsx";
import Trigger from "./components/Trigger.jsx";
import { fetchScoreboard, startBattle, startDethrone, submitVote } from "./api.js";

const DEFAULT_MATCHUP = "ffa";

function App() {
  const [scoreboard, setScoreboard] = useState(null);
  const [scoreboardLoading, setScoreboardLoading] = useState(true);
  const [scoreboardError, setScoreboardError] = useState(null);

  const [battle, setBattle] = useState(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [battleError, setBattleError] = useState(null);

  const [commandError, setCommandError] = useState(null);
  const [voteState, setVoteState] = useState({ status: "idle" });

  useEffect(() => {
    refreshScoreboard();
  }, []);

  const champion = scoreboard?.champion ?? "gpt";
  const records = scoreboard?.records ?? {};
  const streak = scoreboard?.streak ?? 0;

  async function refreshScoreboard() {
    setScoreboardLoading(true);
    try {
      const data = await fetchScoreboard();
      setScoreboard(data);
      setScoreboardError(null);
    } catch (error) {
      setScoreboardError(error.message);
    } finally {
      setScoreboardLoading(false);
    }
  }

  async function handleCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) return;

    setCommandError(null);
    setBattleError(null);
    setVoteState({ status: "idle" });

    let action = null;

    if (trimmed.startsWith("/dethrone")) {
      const topic = trimmed.replace("/dethrone", "").trim();
      if (!topic) {
        setCommandError("Add a topic after /dethrone.");
        return;
      }
      action = () => startDethrone(topic);
    } else {
      let matchup = DEFAULT_MATCHUP;
      let topic = trimmed;

      if (trimmed.startsWith("@arena")) {
        const rest = trimmed.replace("@arena", "").trim();
        if (!rest) {
          setCommandError("Add a topic after @arena.");
          return;
        }
        const parts = rest.split(" ");
        if (parts.length > 1) {
          matchup = parts[0];
          topic = parts.slice(1).join(" ");
        } else {
          topic = rest;
        }
      }

      if (!topic) {
        setCommandError("Provide a topic for the battle.");
        return;
      }

      action = () => startBattle(matchup, topic);
    }

    setBattleLoading(true);
    try {
      const result = await action();
      setBattle(result);
    } catch (error) {
      setBattle(null);
      setBattleError(error.message);
    } finally {
      setBattleLoading(false);
    }
  }

  async function handleVote(battleId, winner) {
    if (!battleId) return;
    setVoteState({ status: "submitting" });
    try {
      await submitVote(battleId, winner);
      setVoteState({ status: "success", winner });
      await refreshScoreboard();
    } catch (error) {
      setVoteState({ status: "error", message: error.message });
    }
  }

  return (
    <div className="app-shell text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-32">
        <header className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-6 py-8 text-center shadow-[0_25px_60px_rgba(2,6,23,0.7)]">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">LLM Roast Arena</p>
          <h1 className="mt-3 text-4xl font-semibold">Elevated Group Chat</h1>
          <p className="mt-2 text-base text-slate-400">
            Three personas. One arena. Drop a topic and watch the crown move.
          </p>
        </header>
        <Scoreboard
          champion={champion}
          records={records}
          streak={streak}
          loading={scoreboardLoading}
        />
        {scoreboardError && (
          <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {scoreboardError}
          </p>
        )}
        <Arena
          champion={champion}
          records={records}
          battle={battle}
          loading={battleLoading}
          error={battleError}
          onVote={handleVote}
          voteState={voteState}
        />
      </div>
      <Trigger onCommand={handleCommand} pending={battleLoading} error={commandError} />
    </div>
  );
}

export default App;
