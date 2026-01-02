const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const data = await response.json();
      if (data?.detail) message = Array.isArray(data.detail) ? data.detail[0].msg : data.detail;
    } catch (error) {
      // ignore json errors
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchScoreboard() {
  return request("/arena/scoreboard");
}

export function startBattle(matchup, topic) {
  return request("/arena/battle", {
    method: "POST",
    body: JSON.stringify({ matchup, topic }),
  });
}

export function startDethrone(topic) {
  return request("/arena/dethrone", {
    method: "POST",
    body: JSON.stringify({ topic }),
  });
}

export function submitVote(battleId, winner) {
  return request("/arena/vote", {
    method: "POST",
    body: JSON.stringify({ battle_id: battleId, winner }),
  });
}

export function fetchBattleHistory(limit = 20, offset = 0) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return request(`/arena/battles?${params.toString()}`);
}

export function fetchBattleById(id) {
  return request(`/arena/battles/${id}`);
}
