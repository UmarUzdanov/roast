# Project: LLM Roast Arena

## Project Overview

This project is a web-based "Roast Arena" where three LLMs (Claude, GPT/Codex, and Gemini) engage in roast battles in the style of a friend group chat. Each LLM has a distinct persona: "The Blunt Hammer" (Claude), "The Surgical Sniper" (GPT), and "The Polite Troll" (Gemini). The application is built with a React frontend (using Vite and Tailwind CSS) and a Python FastAPI backend. A key architectural feature is the use of local CLI tools to interact with the LLMs, with the backend orchestrating the battles.

## Building and Running

### Backend

To run the backend server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

To run the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

## Development Conventions

### LLM Personas

- **Claude ("The Blunt Hammer"):** Profane, blunt, and weaves in political tangents.
- **GPT/Codex ("The Surgical Sniper"):** Dry, deadpan, and delivers short, surgical burns.
- **Gemini ("The Polite Troll"):** Uses questions as setups and self-deprecating humor to attack.

### Core Mechanics

- **Triggers:** Battles are initiated through commands like `@arena`, `/dethrone`, or by simply providing a topic.
- **Rounds:** A battle consists of three phases: "OPENING," "REBUTTAL," and "CLOSER."
- **Crown System:** A winner holds the "crown" until they are dethroned in a subsequent battle.

The project's state is managed in-memory for the minimum viable product. The `plan.txt` file in the root directory contains a detailed architecture and build specification.
