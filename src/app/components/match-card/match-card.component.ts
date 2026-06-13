import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';

// ISO 3166-1 alpha-2 codes for flagcdn.com
const FLAG_CODES: Record<string, string> = {
  'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr', 'Czech Republic': 'cz',
  'Canada': 'ca', 'Bosnia and Herzegovina': 'ba', 'Qatar': 'qa', 'Switzerland': 'ch',
  'Brazil': 'br', 'Morocco': 'ma', 'Haiti': 'ht', 'Scotland': 'gb-sct',
  'United States': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turkey': 'tr',
  'Germany': 'de', 'Curaçao': 'cw', 'Ivory Coast': 'ci', 'Ecuador': 'ec',
  'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
  'Belgium': 'be', 'Egypt': 'eg', 'Iran': 'ir', 'New Zealand': 'nz',
  'Spain': 'es', 'Cape Verde': 'cv', 'Saudi Arabia': 'sa', 'Uruguay': 'uy',
  'France': 'fr', 'Senegal': 'sn', 'Iraq': 'iq', 'Norway': 'no',
  'Argentina': 'ar', 'Algeria': 'dz', 'Austria': 'at', 'Jordan': 'jo',
  'Portugal': 'pt', 'DR Congo': 'cd', 'Uzbekistan': 'uz', 'Colombia': 'co',
  'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
};

@Component({
  selector: 'app-match-card',
  standalone: false,
  template: `
    <mat-card class="match-card" [class.finished]="match.status === 'finished'" [class.live]="match.status === 'live'">
      <mat-card-content>
        <div class="stage-row">
          <span class="stage-badge" [class]="stageClass">{{ match.stage }}</span>
          <span class="venue">{{ match.city }} · {{ match.venue }}</span>
        </div>
        <div class="teams-row">
          <div class="team home">
            <img class="flag" [src]="flagUrl(match.homeTeam)" [alt]="match.homeTeam" width="44" height="33">
            <span class="name">{{ match.homeTeam }}</span>
          </div>
          <div class="score-time">
            <ng-container *ngIf="showScore; else showTime">
              <span class="score" [class.live-score]="match.status === 'live'">
                {{ match.homeScore }} – {{ match.awayScore }}
              </span>
              <span *ngIf="match.status === 'live'" class="live-pill">LIVE</span>
            </ng-container>
            <ng-template #showTime>
              <span class="time">{{ localTime }}<span class="tz-suffix"> {{ localTz }}</span></span>
            </ng-template>
          </div>
          <div class="team away">
            <img class="flag" [src]="flagUrl(match.awayTeam)" [alt]="match.awayTeam" width="44" height="33">
            <span class="name">{{ match.awayTeam }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .match-card {
      margin: 6px 0;
      border-radius: 12px !important;
      transition: box-shadow 0.2s;
    }
    .match-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important; }
    .match-card.finished { opacity: 0.8; }
    .match-card.live { border-left: 4px solid #e53935; }

    mat-card-content { padding: 16px 20px !important; }

    .stage-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .stage-badge {
      font-size: 18px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .stage-group { background: #e8f5e9; color: #2e7d32; }
    .stage-knockout { background: #fff3e0; color: #e65100; }
    .stage-final { background: #fce4ec; color: #880e4f; }
    .venue { font-size: 16px; color: var(--mat-sys-on-surface-variant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

    .teams-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 12px;
    }
    .team {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      font-size: 28px;
      min-width: 0;
    }
    .team.home { justify-content: flex-end; }
    .team.away { justify-content: flex-start; }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .flag { width: 44px; height: 33px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
    .score-time { text-align: center; min-width: 100px; }
    .score { font-size: 44px; font-weight: 700; }
    .live-score { color: #e53935; }
    .live-pill {
      display: block;
      font-size: 18px;
      background: #e53935;
      color: white;
      border-radius: 4px;
      padding: 3px 8px;
      margin-top: 4px;
      animation: pulse 1.2s infinite;
    }
    .time { font-size: 32px; font-weight: 600; color: var(--mat-sys-primary); }
    .tz-suffix { font-size: 0.5em; font-weight: 400; opacity: 0.75; vertical-align: middle; }

    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 760px) {
      mat-card-content { padding: 14px 12px !important; }
      .teams-row {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 10px;
      }
      .team { justify-content: flex-start !important; font-size: 36px; gap: 10px; }
      .team.away { flex-direction: row; }
      .score-time { text-align: left; min-width: unset; }
      .name { white-space: normal; overflow: visible; text-overflow: unset; }
      .flag { width: 44px; height: 33px; }
      .score { font-size: 48px; }
      .time { font-size: 36px; }
      .stage-badge { font-size: 18px; padding: 3px 10px; }
      .venue { font-size: 15px; white-space: normal; }
      .stage-row { margin-bottom: 12px; }
      .live-pill { font-size: 20px; padding: 3px 8px; }
    }
  `]
})
export class MatchCardComponent {
  @Input() match!: Match;

  constructor(private matchService: MatchService) {}

  flagUrl(team: string): string {
    const code = FLAG_CODES[team];
    return code ? `https://flagcdn.com/w80/${code}.png` : 'assets/flag-placeholder.png';
  }

  get showScore(): boolean {
    if (this.match.status === 'live') return true;
    if (this.match.status !== 'finished') return false;
    const matchDate = new Date(`${this.match.date}T00:00:00`);
    matchDate.setDate(matchDate.getDate() + 2);
    return new Date() >= matchDate;
  }

  get localTime(): string {
    const full = this.matchService.formatLocalTime(this.match.date, this.match.timeUTC);
    // Return only the time portion (before the timezone name)
    return full.replace(/\s*(GMT[+-][\d:]+|[A-Z]{2,5})$/, '').trim();
  }

  get localTz(): string {
    const full = this.matchService.formatLocalTime(this.match.date, this.match.timeUTC);
    const match = full.match(/\s*(GMT[+-][\d:]+|[A-Z]{2,5})$/);
    return match ? match[1] : '';
  }

  get stageClass(): string {
    const s = this.match.stage;
    if (s.startsWith('Group')) return 'stage-badge stage-group';
    if (s === 'Final') return 'stage-badge stage-final';
    return 'stage-badge stage-knockout';
  }
}
