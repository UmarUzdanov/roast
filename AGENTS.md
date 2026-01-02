# Repository Guidelines

## Project Structure & Module Organization
The repo is split into `backend/` (FastAPI service) and `frontend/` (Vite + React). Keep orchestrators, personas, and data models inside `backend/` (`arena.py`, `personas.py`, `models.py`, `llm_clients.py`) with `main.py` exposing the API. Frontend UI lives under `frontend/src/` with components in `components/` (`Arena.jsx`, `Trigger.jsx`, `Scoreboard.jsx`, `Round.jsx`). Shared styling resides in `frontend/src/index.css`; documentation assets belong in project-level markdown files like `README.md`.

## Build, Test, and Development Commands
- `cd backend && pip install -r requirements.txt` installs FastAPI + Uvicorn; run `uvicorn main:app --reload --port 8000` for the API.
- `cd frontend && npm install` seeds the Vite project; `npm run dev` starts the Tailwind-enabled UI on port 5173.
- `npm run build` inside `frontend/` emits a static bundle for deployment. Keep backend and frontend in separate terminals for local work.

## Coding Style & Naming Conventions
- Python targets 3.14; follow Black-compatible formatting (4-space indents, snake_case functions, CapWords Pydantic models). Keep async functions prefixed with verbs (`run_battle`, `call_claude`).
- React components live in PascalCase files; hooks/functions stay camelCase. Favor functional components with hooks and Tailwind utility classes for styling.
- Add concise docstrings for orchestration layers (`arena.py`) explaining async flow, and ensure persona constants stay uppercase.

## Testing Guidelines
- Place backend tests under `backend/tests/` using `pytest` with `pytest-asyncio` for coroutine orchestration. Mock CLI calls via `asyncio.subprocess` stubs to keep tests deterministic.
- Frontend tests belong in `frontend/src/__tests__/` with Vitest or Jest; mirror component names (`Arena.test.jsx`). Target at least smoke coverage for battle flow and scoreboard math before PR approval.

## Commit & Pull Request Guidelines
- Use conventional-style commits (`feat: add dethrone endpoint`, `fix: guard subprocess timeouts`) to keep history searchable.
- Every PR should include: summary of changes, testing evidence (`pytest`, `npm run test`, manual battle run), and linked issue/plan item. Attach screenshots or terminal captures showing a sample roast battle plus scoreboard updates when UI changes.

## Security & Configuration Tips
- Store CLI binaries (`claude`, `codex`, `gemini`) on PATH and never commit secrets. Use a `.env` referenced by both FastAPI and Vite for API URLs, CLI overrides, and timeout knobs. Add sample values in `.env.example` and document any required OS packages in `README.md`.
