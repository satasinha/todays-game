import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Match, GroupStanding } from '../models/match.model';
import { FIXTURES, GROUP_TEAMS } from '../data/fixtures';

const SCORES_KEY = 'wc2026_scores';
const TZ_KEY     = 'wc2026_timezone';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private matchesSubject = new BehaviorSubject<Match[]>(this.loadMatches());
  matches$ = this.matchesSubject.asObservable();

  private _timezone: string =
    localStorage.getItem(TZ_KEY) ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  get timezone(): string { return this._timezone; }

  setTimezone(tz: string): void {
    this._timezone = tz;
    localStorage.setItem(TZ_KEY, tz);
    // Re-emit so all subscribers (calendar, cards) recompute with new TZ
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
      month: +p.find(x => x.type === 'month')!.value - 1,  // 0-based
      day:   +p.find(x => x.type === 'day')!.value,
    };
  }

  toDateKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  // Returns a formatted local time string in the active (or supplied) timezone
  formatLocalTime(dateStr: string, timeStr: string, tz = this._timezone): string {
    return this.utcDate(dateStr, timeStr).toLocaleTimeString('en', {
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: tz,
    });
  }

  // Short time (no TZ suffix) for calendar cell pills
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

  getGroupStandings(group: string): GroupStanding[] {
    const teams = GROUP_TEAMS[group] ?? [];
    const matches = this.matchesSubject.value.filter(
      m => m.stage === `Group ${group}` && m.status === 'finished'
    );
    const table: Record<string, GroupStanding> = {};
    teams.forEach(t => {
      table[t] = { group, team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    matches.forEach(m => {
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

  updateScore(matchId: string, homeScore: number, awayScore: number): void {
    const matches = this.matchesSubject.value.map(m =>
      m.id === matchId ? { ...m, homeScore, awayScore, status: 'finished' as const } : m
    );
    this.saveMatches(matches);
    this.matchesSubject.next(matches);
  }

  // ── Persistence ───────────────────────────────────────────────────────────

  private loadMatches(): Match[] {
    try {
      const stored = localStorage.getItem(SCORES_KEY);
      if (stored) {
        const scores: Record<string, Partial<Match>> = JSON.parse(stored);
        return FIXTURES.map(m => ({ ...m, ...(scores[m.id] as Partial<Match>) }));
      }
    } catch {}
    return [...FIXTURES];
  }

  private saveMatches(matches: Match[]): void {
    const scores: Record<string, unknown> = {};
    matches.forEach(m => {
      if (m.homeScore !== null || m.awayScore !== null)
        scores[m.id] = { homeScore: m.homeScore, awayScore: m.awayScore, status: m.status };
    });
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  }
}
