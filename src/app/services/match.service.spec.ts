import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatchService } from './match.service';
import { Match } from '../models/match.model';

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'm1',
    date: '2026-06-11',
    timeUTC: '20:00',
    homeTeam: 'Canada',
    awayTeam: 'Mexico',
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
    stage: 'Group A',
    homeScore: null,
    awayScore: null,
    status: 'upcoming',
    ...overrides,
  };
}

describe('MatchService', () => {
  let service: MatchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MatchService);
    http = TestBed.inject(HttpTestingController);
    // Flush the initial loadData() requests
    http.expectOne(r => r.url.includes('fixtures.json')).flush({ fixtures: [], groupTeams: {} });
    http.expectOne(r => r.url.includes('scores.json')).flush({ lastUpdated: '', scores: [] });
  });

  afterEach(() => http.verify());

  // ── toDateKey ──────────────────────────────────────────────────────────────

  describe('toDateKey', () => {
    it('formats a date as year-month-day', () => {
      const d = new Date(2026, 5, 11); // June 11 2026 (month is 0-indexed)
      expect(service.toDateKey(d)).toBe('2026-5-11');
    });
  });

  // ── setTimezone ────────────────────────────────────────────────────────────

  describe('setTimezone', () => {
    it('updates the timezone and persists to localStorage', () => {
      service.setTimezone('America/New_York');
      expect(service.timezone).toBe('America/New_York');
      expect(localStorage.getItem('wc2026_timezone')).toBe('America/New_York');
    });

    it('re-emits the current matches after a timezone change', () => {
      const emitted: Match[][] = [];
      service.matches$.subscribe(m => emitted.push(m));
      const before = emitted.length;
      service.setTimezone('Asia/Tokyo');
      expect(emitted.length).toBeGreaterThan(before);
    });
  });

  // ── formatLocalTime / shortTime ────────────────────────────────────────────

  describe('formatLocalTime', () => {
    it('returns a non-empty string for a valid UTC date+time', () => {
      const result = service.formatLocalTime('2026-06-11', '20:00', 'UTC');
      expect(result).toMatch(/\d/); // contains at least a digit
    });
  });

  describe('shortTime', () => {
    it('returns a non-empty string for a valid UTC date+time', () => {
      const result = service.shortTime('2026-06-11', '20:00', 'UTC');
      expect(result).toMatch(/\d/);
    });
  });

  // ── getMatchesForDate ──────────────────────────────────────────────────────

  describe('getMatchesForDate', () => {
    beforeEach(() => {
      // Load two matches on different UTC dates
      (service as any).matchesSubject.next([
        makeMatch({ id: 'm1', date: '2026-06-11', timeUTC: '20:00' }),
        makeMatch({ id: 'm2', date: '2026-06-12', timeUTC: '18:00' }),
      ]);
      service.setTimezone('UTC');
    });

    it('returns matches on the requested calendar date', () => {
      const matches = service.getMatchesForDate(new Date(2026, 5, 11));
      expect(matches.map(m => m.id)).toEqual(['m1']);
    });

    it('returns empty array for a date with no matches', () => {
      expect(service.getMatchesForDate(new Date(2026, 5, 20))).toEqual([]);
    });
  });

  // ── getMatchDates ──────────────────────────────────────────────────────────

  describe('getMatchDates', () => {
    it('returns unique date keys for all match dates', () => {
      (service as any).matchesSubject.next([
        makeMatch({ id: 'm1', date: '2026-06-11', timeUTC: '20:00' }),
        makeMatch({ id: 'm2', date: '2026-06-11', timeUTC: '23:00' }),
        makeMatch({ id: 'm3', date: '2026-06-12', timeUTC: '18:00' }),
      ]);
      service.setTimezone('UTC');
      const dates = service.getMatchDates();
      expect(dates.size).toBe(2);
    });
  });

  // ── getGroupStandings ──────────────────────────────────────────────────────

  describe('getGroupStandings', () => {
    const groupTeams = { A: ['Canada', 'Mexico', 'Brazil', 'France'] };

    function loadMatches(matches: Partial<Match>[]) {
      (service as any).groupTeams = groupTeams;
      (service as any).matchesSubject.next(matches.map(m => makeMatch(m)));
    }

    it('returns a row for every team even with no matches played', () => {
      loadMatches([]);
      const standings = service.getGroupStandings('A');
      expect(standings.map(s => s.team).sort()).toEqual(['Brazil', 'Canada', 'France', 'Mexico']);
    });

    it('awards 3 points to the winner and 0 to the loser', () => {
      loadMatches([{
        id: 'm1', homeTeam: 'Canada', awayTeam: 'Mexico',
        homeScore: 2, awayScore: 1, status: 'finished', stage: 'Group A',
      }]);
      const standings = service.getGroupStandings('A');
      const canada = standings.find(s => s.team === 'Canada')!;
      const mexico = standings.find(s => s.team === 'Mexico')!;
      expect(canada.points).toBe(3);
      expect(canada.won).toBe(1);
      expect(mexico.points).toBe(0);
      expect(mexico.lost).toBe(1);
    });

    it('awards 1 point to each team on a draw', () => {
      loadMatches([{
        id: 'm1', homeTeam: 'Canada', awayTeam: 'Mexico',
        homeScore: 1, awayScore: 1, status: 'finished', stage: 'Group A',
      }]);
      const standings = service.getGroupStandings('A');
      const canada = standings.find(s => s.team === 'Canada')!;
      const mexico = standings.find(s => s.team === 'Mexico')!;
      expect(canada.points).toBe(1);
      expect(canada.drawn).toBe(1);
      expect(mexico.points).toBe(1);
      expect(mexico.drawn).toBe(1);
    });

    it('computes goal difference correctly', () => {
      loadMatches([{
        id: 'm1', homeTeam: 'Canada', awayTeam: 'Mexico',
        homeScore: 3, awayScore: 1, status: 'finished', stage: 'Group A',
      }]);
      const standings = service.getGroupStandings('A');
      const canada = standings.find(s => s.team === 'Canada')!;
      const mexico = standings.find(s => s.team === 'Mexico')!;
      expect(canada.gf).toBe(3);
      expect(canada.ga).toBe(1);
      expect(canada.gd).toBe(2);
      expect(mexico.gd).toBe(-2);
    });

    it('sorts by points descending, then goal difference', () => {
      loadMatches([
        { id: 'm1', homeTeam: 'Canada', awayTeam: 'Mexico', homeScore: 2, awayScore: 0, status: 'finished', stage: 'Group A' },
        { id: 'm2', homeTeam: 'Brazil', awayTeam: 'France', homeScore: 1, awayScore: 0, status: 'finished', stage: 'Group A' },
        { id: 'm3', homeTeam: 'Canada', awayTeam: 'France', homeScore: 0, awayScore: 0, status: 'finished', stage: 'Group A' },
      ]);
      const standings = service.getGroupStandings('A');
      // Canada: 4pts (+2 GD), Brazil: 3pts (+1 GD), Mexico: 0pts (-2 GD), France: 1pt (-1 GD)
      expect(standings[0].team).toBe('Canada');
      expect(standings[1].team).toBe('Brazil');
      expect(standings[2].team).toBe('France');
      expect(standings[3].team).toBe('Mexico');
    });

    it('ignores upcoming matches', () => {
      loadMatches([{
        id: 'm1', homeTeam: 'Canada', awayTeam: 'Mexico',
        homeScore: null, awayScore: null, status: 'upcoming', stage: 'Group A',
      }]);
      const standings = service.getGroupStandings('A');
      standings.forEach(s => expect(s.played).toBe(0));
    });

    it('returns empty array for an unknown group', () => {
      loadMatches([]);
      expect(service.getGroupStandings('Z')).toEqual([]);
    });
  });
});
