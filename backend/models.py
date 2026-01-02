"""Pydantic schemas and SQLAlchemy ORM models."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base

Phase = Literal["opening", "rebuttal", "closer"]
WinnerLiteral = Literal["claude", "gpt", "gemini"]


# SQLAlchemy ORM Models -------------------------------------------------------
class AgentORM(Base):
    __tablename__ = "agents"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    victories = relationship("BattleORM", back_populates="winner")


class BattleORM(Base):
    __tablename__ = "battles"
    id = Column(String, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    matchup = Column(String, nullable=False)
    winner_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    winner = relationship("AgentORM", back_populates="victories")
    rounds = relationship(
        "RoundORM", back_populates="battle", cascade="all, delete-orphan"
    )


class RoundORM(Base):
    __tablename__ = "rounds"
    id = Column(Integer, primary_key=True, index=True)
    battle_id = Column(String, ForeignKey("battles.id"), nullable=False)
    phase = Column(String, nullable=False)
    claude_roast = Column(Text, nullable=False)
    gpt_roast = Column(Text, nullable=False)
    gemini_roast = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    battle = relationship("BattleORM", back_populates="rounds")


# Pydantic Schemas ------------------------------------------------------------
class Round(BaseModel):
    phase: Phase
    claude: str
    gpt: str
    gemini: str

    class Config:
        from_attributes = True


class Battle(BaseModel):
    id: str
    topic: str
    matchup: str
    rounds: List[Round]
    created_at: Optional[datetime] = None
    winner: Optional[str] = None

    class Config:
        from_attributes = True


class BattleSummary(BaseModel):
    id: str
    topic: str
    matchup: str
    created_at: datetime
    winner: Optional[str] = None

    class Config:
        from_attributes = True


class BattleRequest(BaseModel):
    matchup: str = Field(
        default="ffa",
        description="Matchup descriptor such as 'ffa', '1v1 claude gpt', etc.",
    )
    topic: str = Field(..., min_length=3, max_length=256)


class DethroneRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=256)


class VoteRequest(BaseModel):
    battle_id: str = Field(..., description="Battle identifier from recent matches.")
    winner: WinnerLiteral


class AgentRecord(BaseModel):
    wins: int = 0
    losses: int = 0


class Scoreboard(BaseModel):
    champion: Optional[str] = None
    records: Dict[str, AgentRecord]
    streak: int = 0
