import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Match, GroupStanding } from '../models/match.model';

const TZ_KEY = 'wc2026_timezone';

interface ScoreEntry {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
  status: 'upcoming' | 'live' | 'finished';
}

interface ScoresFile {
  lastUpdated: string;
  scores: ScoreEntry[];
}

interface FixturesFile {
  fixtures: Match[];
  groupTeams: Record<string, string[]>;
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  matches$ = this.matchesSubject.asObservable();

  private groupTeams: Record<string, string[]> = {};

  private _timezone: string =
    localStorage.getItem(TZ_KEY) ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  get timezone(): string { return this._timezone; }

  constructor(private http: HttpClient) {
    this.loadData();
  }

  private loadData(): void {
    const emptyFixtures: FixturesFile = { fixtures: [], groupTeams: {} };
    const emptyScores: ScoresFile = { lastUpdated: '', scores: [] };

    const fixtures$ = this.http.get<FixturesFile>(`assets/data/fixtures.json?v=${Date.now()}`).pipe(
      catchError(() => of(emptyFixtures))
    );
    const scores$ = this.http.get<ScoresFile>(`assets/data/scores.json?v=${Date.now()}`).pipe(
      catchError(() => of(emptyScores))
    );

    forkJoin([fixtures$, scores$]).subscribe(([fixturesFile, scoresFile]) => {
      this.groupTeams = fixturesFile.groupTeams;
      const scoreMap = new Map(scoresFile.scores.map(s => [s.id, s]));
      const merged = fixturesFile.fixtures.map(m => {
        const s = scoreMap.get(m.id);
        return s ? { ...m, homeScore: s.homeScore, awayScore: s.awayScore, homePenalty: s.homePenalty, awayPenalty: s.awayPenalty, status: s.status } : m;
      });
      this.matchesSubject.next(this.resolveKnockoutTeams(merged));
    });
  }

  setTimezone(tz: string): void {
    this._timezone = tz;
    localStorage.setItem(TZ_KEY, tz);
    this.matchesSubject.next(this.matchesSubject.value);
  }

  // ── Date helpers ──────────────────────────────────────────────────────────

  private utcDate(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }

  private dateParts(utcDate: Date, tz: string): { year: number; month: number; day: number } {
    const fmt = new Intl.DateTimeFormat('en', {
      timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric',
    });
    const p = fmt.formatToParts(utcDate);
    return {
      year:  +p.find(x => x.type === 'year')!.value,
      month: +p.find(x => x.type === 'month')!.value - 1,
      day:   +p.find(x => x.type === 'day')!.value,
    };
  }

  toDateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  formatLocalDate(dateStr: string, timeStr: string, tz = this._timezone): string {
    return this.utcDate(dateStr, timeStr).toLocaleDateString('en', {
      weekday: 'short', day: 'numeric', month: 'short', timeZone: tz,
    });
  }

  formatLocalTime(dateStr: string, timeStr: string, tz = this._timezone): string {
    return this.utcDate(dateStr, timeStr).toLocaleTimeString('en', {
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: tz,
    });
  }

  shortTime(dateStr: string, timeStr: string, tz = this._timezone): string {
    return this.utcDate(dateStr, timeStr).toLocaleTimeString('en', {
      hour: 'numeric', minute: '2-digit', timeZone: tz,
    });
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  getMatchesForDate(calDate: Date): Match[] {
    const tz = this._timezone;
    const y = calDate.getFullYear(), m = calDate.getMonth(), d = calDate.getDate();
    return this.matchesSubject.value.filter(match => {
      const parts = this.dateParts(this.utcDate(match.date, match.timeUTC), tz);
      return parts.year === y && parts.month === m && parts.day === d;
    });
  }

  getMatchDates(): Set<string> {
    const tz = this._timezone;
    const dates = new Set<string>();
    this.matchesSubject.value.forEach(m => {
      const p = this.dateParts(this.utcDate(m.date, m.timeUTC), tz);
      dates.add(`${p.year}-${p.month}-${p.day}`);
    });
    return dates;
  }

  private resolveKnockoutTeams(matches: Match[]): Match[] {
    const standings = new Map<string, GroupStanding[]>();
    const getStandings = (group: string) => {
      if (!standings.has(group)) {
        standings.set(group, this.computeStandings(group, matches));
      }
      return standings.get(group)!;
    };

    const resolve = (placeholder: string): string => {
      const winnerMatch = placeholder.match(/^Winner Group ([A-L])$/);
      if (winnerMatch) {
        const s = getStandings(winnerMatch[1]);
        if (s.length && s[0].played >= 3) return s[0].team;
      }
      const runnerMatch = placeholder.match(/^Runner-up Group ([A-L])$/);
      if (runnerMatch) {
        const s = getStandings(runnerMatch[1]);
        if (s.length >= 2 && s[1].played >= 3) return s[1].team;
      }
      return placeholder;
    };

    return matches.map(m => ({
      ...m,
      homeTeam: resolve(m.homeTeam),
      awayTeam: resolve(m.awayTeam),
    }));
  }

  private computeStandings(group: string, matches: Match[]): GroupStanding[] {
    const teams = this.groupTeams[group] ?? [];
    const groupMatches = matches.filter(
      m => m.stage === `Group ${group}` && m.status === 'finished'
    );
    const table: Record<string, GroupStanding> = {};
    teams.forEach(t => {
      table[t] = { group, team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    groupMatches.forEach(m => {
      if (m.homeScore === null || m.awayScore === null) return;
      const h = table[m.homeTeam], a = table[m.awayTeam];
      if (!h || !a) return;
      h.played++; a.played++;
      h.gf += m.homeScore; h.ga += m.awayScore;
      a.gf += m.awayScore; a.ga += m.homeScore;
      if (m.homeScore > m.awayScore)      { h.won++; h.points += 3; a.lost++; }
      else if (m.homeScore < m.awayScore) { a.won++; a.points += 3; h.lost++; }
      else                                { h.drawn++; h.points++; a.drawn++; a.points++; }
    });
    Object.values(table).forEach(s => s.gd = s.gf - s.ga);
    return Object.values(table).sort((a, b) =>
      b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );
  }

  getGroupStandings(group: string): GroupStanding[] {
    return this.computeStandings(group, this.matchesSubject.value);
  }
}
