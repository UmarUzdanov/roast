"""Database CRUD helpers for Roast Arena persistence."""

from __future__ import annotations

from typing import Dict, Iterable, List

from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

from .constants import DEFAULT_CHAMPION, PARTICIPANTS
from .models import AgentORM, BattleORM, RoundORM


# Agent helpers -----------------------------------------------------------------

def get_agent_by_name(db: Session, name: str) -> AgentORM | None:
    return db.execute(select(AgentORM).where(AgentORM.name == name)).scalar_one_or_none()


def get_all_agents(db: Session) -> List[AgentORM]:
    return db.execute(select(AgentORM).order_by(asc(AgentORM.name))).scalars().all()


def create_agent(db: Session, name: str) -> AgentORM:
    agent = AgentORM(name=name, wins=0, losses=0)
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


def ensure_agents_seeded(db: Session) -> None:
    changed = False
    for name in PARTICIPANTS:
        if get_agent_by_name(db, name) is None:
            db.add(AgentORM(name=name, wins=0, losses=0))
            changed = True
    if changed:
        db.commit()


def update_agent_stats(db: Session, winner_name: str, loser_names: Iterable[str]) -> None:
    winner = get_agent_by_name(db, winner_name)
    if winner is None:
        raise ValueError(f"unknown agent: {winner_name}")
    winner.wins += 1

    for loser_name in loser_names:
        if loser_name == winner_name:
            continue
        loser = get_agent_by_name(db, loser_name)
        if loser is None:
            raise ValueError(f"unknown agent: {loser_name}")
        loser.losses += 1

    db.commit()


# Battle helpers -----------------------------------------------------------------

def create_battle(db: Session, battle_id: str, topic: str, matchup: str) -> BattleORM:
    battle = BattleORM(id=battle_id, topic=topic, matchup=matchup)
    db.add(battle)
    db.commit()
    db.refresh(battle)
    return battle


def get_battle(db: Session, battle_id: str) -> BattleORM | None:
    return db.execute(select(BattleORM).where(BattleORM.id == battle_id)).scalar_one_or_none()


def set_battle_winner(db: Session, battle_id: str, winner_name: str) -> BattleORM:
    battle = get_battle(db, battle_id)
    if battle is None:
        raise ValueError("battle not found")
    if battle.winner_id is not None:
        raise ValueError("battle already has a winner")
    winner = get_agent_by_name(db, winner_name)
    if winner is None:
        raise ValueError("unknown winner")
    battle.winner_id = winner.id
    db.commit()
    db.refresh(battle)
    return battle


# Round helpers ------------------------------------------------------------------

def create_round(db: Session, battle_id: str, phase: str, roasts: Dict[str, str]) -> RoundORM:
    round_row = RoundORM(
        battle_id=battle_id,
        phase=phase,
        claude_roast=roasts.get("claude", ""),
        gpt_roast=roasts.get("gpt", ""),
        gemini_roast=roasts.get("gemini", ""),
    )
    db.add(round_row)
    db.commit()
    db.refresh(round_row)
    return round_row


# Scoreboard + champion ----------------------------------------------------------

def get_scoreboard_snapshot(db: Session) -> tuple[str | None, int, Dict[str, Dict[str, int]]]:
    agents = get_all_agents(db)
    records = {agent.name: {"wins": agent.wins, "losses": agent.losses} for agent in agents}
    champion, streak = _calculate_champion_and_streak(db)
    return champion, streak, records


def _calculate_champion_and_streak(db: Session) -> tuple[str | None, int]:
    battle_rows = db.execute(
        select(BattleORM)
        .where(BattleORM.winner_id.is_not(None))
        .order_by(desc(BattleORM.id))
    ).scalars()

    champion_name = None
    streak = 0
    for battle in battle_rows:
        if battle.winner is None:
            continue
        if champion_name is None:
            champion_name = battle.winner.name
            streak = 1
        elif battle.winner.name == champion_name:
            streak += 1
        else:
            break
    return champion_name, streak


def get_current_champion(db: Session) -> str:
    champion, _ = _calculate_champion_and_streak(db)
    if champion:
        return champion
    return DEFAULT_CHAMPION
