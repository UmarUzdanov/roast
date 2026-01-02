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

  return (
    <section className="panel fixed bottom-0 left-1/2 w-full max-w-5xl -translate-x-1/2 border border-slate-800/70 bg-slate-950/90 px-5 py-4 shadow-[0_-15px_45px_rgba(2,6,23,0.95)]">
      <form onSubmit={onSubmit}>
        <label className="mb-2 block text-xs uppercase tracking-[0.4em] text-slate-500">
          Command Center
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/80 px-5 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder={EXAMPLES[placeholderIndex]}
              disabled={pending}
            />
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((cmd) => (
                  <span key={cmd.value} className="suggestion-pill text-slate-300">
                    <strong className="text-slate-100">{cmd.value}</strong>
                    <span className="ml-2 text-slate-400">{cmd.summary}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!command.trim() || pending}
            className="w-full rounded-2xl bg-amber-400/90 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700/50 md:w-auto"
          >
            {pending ? "Cooking..." : "Roast!"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-xs text-rose-400">{error}</p>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Use @arena or /dethrone commands, or just drop a spicy topic.
          </p>
        )}
      </form>
    </section>
  );
}

export default Trigger;
