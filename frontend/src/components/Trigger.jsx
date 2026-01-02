import { useEffect, useMemo, useState } from "react";

const EXAMPLES = [
  "@arena ffa tabs vs spaces",
  "Pineapple on pizza, go.",
  "/dethrone champion on AI safety",
  "@arena 1v1 claude gpt prompt injection",
];

const COMMANDS = [
  { value: "@arena", summary: "Start a new battle" },
  { value: "/dethrone", summary: "Challenge the current champ" },
];

const MAX_CHARS = 256;

function Trigger({ onCommand, pending = false, error }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [command, setCommand] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((idx) => (idx + 1) % EXAMPLES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const suggestions = useMemo(() => {
    if (!command.trim() || (!command.startsWith("@") && !command.startsWith("/"))) {
      return [];
    }
    const [prefix] = command.split(" ");
    return COMMANDS.filter((cmd) => cmd.value.startsWith(prefix.toLowerCase()));
  }, [command]);

  const onSubmit = (event) => {
    event.preventDefault();
    if (!command.trim()) return;
    onCommand?.(command.trim());
    setCommand("");
  };

  const handleCommandClick = (value) => {
    setCommand((prev) => {
      const next = `${value} ${prev.replace(value, "").trimStart()}`.slice(0, MAX_CHARS);
      return next;
    });
  };

  const remaining = `${command.length}/${MAX_CHARS}`;

  return (
    <section className="panel w-full border border-slate-800/70 bg-slate-950/90 px-5 py-4 shadow-[0_10px_35px_rgba(2,6,23,0.65)]">
      <form onSubmit={onSubmit}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Ignite a battle</p>
            <p className="text-sm text-slate-400">Drop a topic or choose a command.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMANDS.map((cmd) => (
              <button
                key={cmd.value}
                type="button"
                onClick={() => handleCommandClick(cmd.value)}
                className="suggestion-pill text-slate-200"
              >
                <strong className="text-slate-100">{cmd.value}</strong>
                <span className="ml-2 text-slate-400">{cmd.summary}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex flex-1 items-center">
          <input
            value={command}
            onChange={(event) =>
              setCommand(event.target.value.slice(0, MAX_CHARS))
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 pr-36 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder={EXAMPLES[placeholderIndex]}
            disabled={pending}
          />
          <button
            type="submit"
            disabled={!command.trim() || pending}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-xl bg-amber-400/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700/50"
          >
            {pending ? "⏳ Summoning" : "⚡ Roast"}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between text-xs">
          {error ? (
            <p className="text-rose-400">{error}</p>
          ) : suggestions.length > 0 ? (
            <p className="text-slate-400">Press space to accept a command.</p>
          ) : (
            <p className="text-slate-400">Use @arena or /dethrone, or just drop a spicy topic.</p>
          )}
          <span className="text-slate-500">{remaining}</span>
        </div>
      </form>
    </section>
  );
}

export default Trigger;
