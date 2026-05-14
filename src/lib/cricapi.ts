// Types for the CricAPI v1 response
export interface CricAPIMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: { name: string; img: string; shortname: string }[];
  score?: {
    r: number;      // runs
    w: number;      // wickets
    o: number;      // overs
    inning: string; // inning name
  }[];
  series_id?: string;
}

export interface IPLMatchState {
  id: string;
  teamA: string;
  teamB: string;
  shortA: string;
  shortB: string;
  status: 'live' | 'upcoming' | 'completed';
  venue: string;
  dateTimeGMT: string;
  score: {
    teamA?: string; // e.g. "165/4 (15.0 ov)"
    teamB?: string;
  };
  requiredRate?: string;
  currentBatters?: string;
  currentBowler?: string;
  statusText: string;
}

const CRICAPI_BASE = "https://api.cricapi.com/v1";
const API_KEY = process.env.NEXT_PUBLIC_CRICKET_API_KEY || "";

// Fetch all current/upcoming IPL matches
export async function fetchIPLMatches(): Promise<IPLMatchState[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(
      `${CRICAPI_BASE}/currentMatches?apikey=${API_KEY}&offset=0`,
      { next: { revalidate: 60 } } // cache for 60s
    );
    const data = await res.json();

    if (data.status !== "success") return [];

    // Filter only IPL matches
    const iplMatches: CricAPIMatch[] = (data.data || []).filter(
      (m: CricAPIMatch) =>
        m.name.toLowerCase().includes("ipl") ||
        m.name.toLowerCase().includes("indian premier league") ||
        (m.series_id && ["d5a498c8-7596-4b93-8ab0-e0efc3345312"].includes(m.series_id))
    );

    return iplMatches.map(formatMatch);
  } catch (e) {
    console.error("CricAPI error:", e);
    return [];
  }
}

function formatMatch(m: CricAPIMatch): IPLMatchState {
  const teams = m.teams || [];
  const teamA = teams[0] || "Team A";
  const teamB = teams[1] || "Team B";

  const infoA = m.teamInfo?.find((t) => t.name === teamA);
  const infoB = m.teamInfo?.find((t) => t.name === teamB);

  const scoreA = m.score?.find((s) => s.inning?.includes(teamA));
  const scoreB = m.score?.find((s) => s.inning?.includes(teamB));

  const formatScore = (s?: { r: number; w: number; o: number }) =>
    s ? `${s.r}/${s.w} (${s.o} ov)` : undefined;

  const isLive =
    m.status.toLowerCase().includes("in progress") ||
    m.status.toLowerCase().includes("live");

  const isCompleted = m.status.toLowerCase().includes("won") ||
    m.status.toLowerCase().includes("match ended");

  return {
    id: m.id,
    teamA,
    teamB,
    shortA: infoA?.shortname || teamA.substring(0, 3).toUpperCase(),
    shortB: infoB?.shortname || teamB.substring(0, 3).toUpperCase(),
    status: isLive ? "live" : isCompleted ? "completed" : "upcoming",
    venue: m.venue || "TBA",
    dateTimeGMT: m.dateTimeGMT,
    score: {
      teamA: formatScore(scoreA),
      teamB: formatScore(scoreB),
    },
    statusText: m.status,
  };
}

// Returns DEMO data when no API key is configured
export function getDemoIPLMatch(): IPLMatchState {
  return {
    id: "demo",
    teamA: "Mumbai Indians",
    teamB: "Chennai Super Kings",
    shortA: "MI",
    shortB: "CSK",
    status: "live",
    venue: "Wankhede Stadium, Mumbai",
    dateTimeGMT: new Date().toISOString(),
    score: {
      teamA: "187/4 (17.3 ov)",
      teamB: "165/6 (20.0 ov)",
    },
    requiredRate: "11.50",
    statusText: "MI need 23 runs off 15 balls",
  };
}
