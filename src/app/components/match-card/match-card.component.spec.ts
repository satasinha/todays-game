import { TestBed } from '@angular/core/testing';
import { MatchCardComponent } from './match-card.component';
import { MatchService } from '../../services/match.service';
import { SharedModule } from '../../shared/shared.module';
import { Match } from '../../models/match.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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

const mockMatchService = {
  formatLocalTime: () => '8:00 PM GMT',
  shortTime: () => '8:00 PM',
  timezone: 'UTC',
};

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      providers: [{ provide: MatchService, useValue: mockMatchService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MatchCardComponent);
    component = fixture.componentInstance;
    component.match = makeMatch();
  });

  // ── stageClass ─────────────────────────────────────────────────────────────

  describe('stageClass', () => {
    it('returns group class for Group stages', () => {
      component.match = makeMatch({ stage: 'Group B' });
      expect(component.stageClass).toBe('stage-badge stage-group');
    });

    it('returns final class for the Final', () => {
      component.match = makeMatch({ stage: 'Final' });
      expect(component.stageClass).toBe('stage-badge stage-final');
    });

    it('returns knockout class for intermediate rounds', () => {
      component.match = makeMatch({ stage: 'Quarter-final' });
      expect(component.stageClass).toBe('stage-badge stage-knockout');

      component.match = makeMatch({ stage: 'Round of 32' });
      expect(component.stageClass).toBe('stage-badge stage-knockout');
    });
  });

  // ── flagUrl ────────────────────────────────────────────────────────────────

  describe('flagUrl', () => {
    it('returns a flagcdn URL for a known team', () => {
      expect(component.flagUrl('Canada')).toContain('flagcdn.com');
      expect(component.flagUrl('Canada')).toContain('ca');
    });

    it('returns a placeholder for an unknown team', () => {
      expect(component.flagUrl('Unknown FC')).toBe('assets/flag-placeholder.png');
    });
  });

  // ── showScore ──────────────────────────────────────────────────────────────

  describe('showScore', () => {
    it('shows score when match is live', () => {
      component.match = makeMatch({ status: 'live', homeScore: 1, awayScore: 0 });
      expect(component.showScore).toBe(true);
    });

    it('hides score when match is upcoming', () => {
      component.match = makeMatch({ status: 'upcoming' });
      expect(component.showScore).toBe(false);
    });

    it('hides score for a match finished less than 24 hours ago', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const dateStr = oneHourAgo.toISOString().slice(0, 10);
      const timeStr = oneHourAgo.toISOString().slice(11, 16);
      component.match = makeMatch({ status: 'finished', date: dateStr, timeUTC: timeStr, homeScore: 2, awayScore: 1 });
      expect(component.showScore).toBe(false);
    });

    it('shows score for a match finished more than 24 hours ago', () => {
      const twoDaysAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const dateStr = twoDaysAgo.toISOString().slice(0, 10);
      const timeStr = twoDaysAgo.toISOString().slice(11, 16);
      component.match = makeMatch({ status: 'finished', date: dateStr, timeUTC: timeStr, homeScore: 2, awayScore: 1 });
      expect(component.showScore).toBe(true);
    });
  });
});
