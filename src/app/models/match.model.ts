export interface Match {
  id: string;
  date: string;       // YYYY-MM-DD (UTC date)
  timeUTC: string;    // HH:MM (UTC)
  homeTeam: string;
  awayTeam: string;
  venue: string;
  city: string;
  stage: string;      // "Group A" | "Round of 32" | "Quarter-final" etc.
  homeScore: number | null;
  awayScore: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
  status: 'upcoming' | 'live' | 'finished';
}

export interface GroupStanding {
  group: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}
