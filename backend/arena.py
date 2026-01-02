"""Battle orchestration logic for the Roast Arena."""

from __future__ import annotations

import asyncio
from typing import Dict, List
from uuid import uuid4

from sqlalchemy.orm import Session

from .crud import create_battle, create_round, get_current_champion
from .llm_clients import call_claude, call_codex, call_gemini
from sqlalchemy.orm import Session

from .models import Battle, Round
from .personas import CLAUDE_PERSONA, GEMINI_PERSONA, GPT_PERSONA


async def run_battle(
    db: Session, matchup: str, topic: str, defender: str | None = None
) -> Battle:
    """Run the three-phase battle sequence and persist it."""

    battle_id = str(uuid4())
    transaction = db.begin()
    try:
        create_battle(db, battle_id=battle_id, topic=topic, matchup=matchup)
        rounds: List[Round] = []

        opening_prompt = _build_opening_prompt(topic, matchup, defender)
        opening = await _fire_round(opening_prompt)
        create_round(db, battle_id=battle_id, phase="opening", roasts=opening)
        rounds.append(Round(phase="opening", **opening))

        rebuttal_prompt = _build_rebuttal_prompt(topic, opening)
        rebuttal = await _fire_round(rebuttal_prompt)
        create_round(db, battle_id=battle_id, phase="rebuttal", roasts=rebuttal)
        rounds.append(Round(phase="rebuttal", **rebuttal))

        closer_prompt = _build_closer_prompt(topic, opening, rebuttal)
        closer = await _fire_round(closer_prompt)
        create_round(db, battle_id=battle_id, phase="closer", roasts=closer)
        rounds.append(Round(phase="closer", **closer))

        transaction.commit()
        return Battle(id=battle_id, topic=topic, matchup=matchup, rounds=rounds)
    except Exception:
        transaction.rollback()
        raise


async def run_dethrone(db: Session, topic: str) -> Battle:
    """Shortcut battle builder that targets the reigning champion."""

    defender = get_current_champion(db)
    matchup = f"dethrone:{defender}" if defender else "dethrone"
    return await run_battle(db=db, matchup=matchup, topic=topic, defender=defender)


async def _fire_round(prompt: str) -> Dict[str, str]:
    """Call all three LLM clients concurrently and normalize outputs."""

    results = await asyncio.gather(
        call_claude(prompt, CLAUDE_PERSONA),
        call_codex(prompt, GPT_PERSONA),
        call_gemini(prompt, GEMINI_PERSONA),
        return_exceptions=True,
    )
    claude_text = _stringify_output("Claude", results[0])
    gpt_text = _stringify_output("GPT", results[1])
    gemini_text = _stringify_output("Gemini", results[2])
    return {"claude": claude_text, "gpt": gpt_text, "gemini": gemini_text}


def _stringify_output(label: str, result: object) -> str:
    if isinstance(result, Exception):
        return f"[{label} error] {result}"
    return str(result)


def _build_opening_prompt(topic: str, matchup: str, defender: str | None) -> str:
    context = [
        f"Topic: {topic}",
        f"Matchup: {matchup}",
        "Phase: OPENING",
        "Fire your first shot at the other LLMs with maximum personality.",
    ]
    if defender:
        context.append(
            f"Current champion: {defender.upper()}. If you are {defender.upper()}, defend the crown and set the tone."
        )
    return "\n".join(context)


def _build_rebuttal_prompt(topic: str, opening: Dict[str, str]) -> str:
    return (
        f"Topic: {topic}\n"
        "Phase: REBUTTAL\n"
        f"What Claude said: {opening['claude']}\n"
        f"What GPT said: {opening['gpt']}\n"
        f"What Gemini said: {opening['gemini']}\n"
        "Respond directly to the burns aimed at you. Name names, keep the persona rules."
    )


def _build_closer_prompt(
    topic: str, opening: Dict[str, str], rebuttal: Dict[str, str]
) -> str:
    return (
        f"Topic: {topic}\n"
        "Phase: CLOSER - final mic drop.\n"
        "Reference threads from earlier rounds.\n"
        f"Opening recap: Claude={opening['claude']} | GPT={opening['gpt']} | Gemini={opening['gemini']}\n"
        f"Rebuttal recap: Claude={rebuttal['claude']} | GPT={rebuttal['gpt']} | Gemini={rebuttal['gemini']}\n"
        "Drop the mic in under 3 sentences."
    )
