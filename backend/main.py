"""FastAPI application entry point for the Roast Arena backend."""

from __future__ import annotations

import os

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .arena import run_battle, run_dethrone
from .constants import PARTICIPANTS
from .crud import (
    ensure_agents_seeded,
    get_battle,
    get_scoreboard_snapshot,
    list_battles,
    set_battle_winner,
    update_agent_stats,
)
from .database import SessionLocal, create_db_and_tables, get_db
from .models import (
    AgentRecord,
    Battle,
    BattleRequest,
    BattleSummary,
    DethroneRequest,
    Round,
    Scoreboard,
    VoteRequest,
)

allowed_origins = [
    origin.strip()
    for origin in (os.getenv("ARENA_ALLOWED_ORIGINS") or "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]

app = FastAPI(title="LLM Roast Arena")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def initialize_database() -> None:
    create_db_and_tables()
    with SessionLocal() as session:
        ensure_agents_seeded(session)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    """Simple health endpoint for automation probes."""
    return {"status": "ok"}


@app.post("/arena/battle", response_model=Battle)
async def start_battle(
    payload: BattleRequest, db: Session = Depends(get_db)
) -> Battle:
    """Kick off a free-form battle."""

    return await run_battle(db=db, matchup=payload.matchup, topic=payload.topic)


@app.post("/arena/dethrone", response_model=Battle)
async def dethrone(payload: DethroneRequest, db: Session = Depends(get_db)) -> Battle:
    """Challenge the current champion."""

    return await run_dethrone(db=db, topic=payload.topic)


@app.get("/arena/battles", response_model=list[BattleSummary])
async def list_battles_endpoint(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> list[BattleSummary]:
    rows = list_battles(db, limit=limit, offset=offset)
    summaries = []
    for row in rows:
        summaries.append(
            BattleSummary(
                id=row.id,
                topic=row.topic,
                matchup=row.matchup,
                created_at=row.created_at,
                winner=row.winner.name if row.winner else None,
            )
        )
    return summaries


@app.get("/arena/battles/{battle_id}", response_model=Battle)
async def get_battle_endpoint(battle_id: str, db: Session = Depends(get_db)) -> Battle:
    row = get_battle(db, battle_id)
    if row is None:
        raise HTTPException(status_code=404, detail="battle not found")
    rounds = [
        Round(
            phase=round_row.phase,
            claude=round_row.claude_roast,
            gpt=round_row.gpt_roast,
            gemini=round_row.gemini_roast,
        )
        for round_row in row.rounds
    ]
    return Battle(
        id=row.id,
        topic=row.topic,
        matchup=row.matchup,
        created_at=row.created_at,
        winner=row.winner.name if row.winner else None,
        rounds=rounds,
    )


@app.get("/arena/scoreboard", response_model=Scoreboard)
async def scoreboard(db: Session = Depends(get_db)) -> Scoreboard:
    """Return the current scoreboard snapshot."""

    champion, streak, raw_records = get_scoreboard_snapshot(db)
    records = {
        name: AgentRecord(**stats) for name, stats in raw_records.items()
    }
    # Ensure all participants appear even if not yet seeded
    for name in PARTICIPANTS:
        records.setdefault(name, AgentRecord())
    return Scoreboard(champion=champion, records=records, streak=streak)


@app.post("/arena/vote", response_model=Scoreboard)
async def vote(payload: VoteRequest, db: Session = Depends(get_db)) -> Scoreboard:
    """Record a vote for a battle winner and update streaks."""

    try:
        set_battle_winner(db, payload.battle_id, payload.winner)
    except ValueError as exc:
        status = 404 if "not found" in str(exc).lower() else 400
        raise HTTPException(status_code=status, detail=str(exc)) from exc

    loser_names = [agent for agent in PARTICIPANTS if agent != payload.winner]
    try:
        update_agent_stats(db, winner_name=payload.winner, loser_names=loser_names)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    champion, streak, raw_records = get_scoreboard_snapshot(db)
    records = {name: AgentRecord(**stats) for name, stats in raw_records.items()}
    for name in PARTICIPANTS:
        records.setdefault(name, AgentRecord())
    return Scoreboard(champion=champion, records=records, streak=streak)
