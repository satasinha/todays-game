import { Component, Input } from '@angular/core';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';

const FLAGS: Record<string, string> = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Czech Republic': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'United States': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Turkey': '🇹🇷',
  'Germany': '🇩🇪', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮', 'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Sweden': '🇸🇪', 'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spain': '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦', 'Uruguay': '🇺🇾',
  'France': '🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway': '🇳🇴',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Austria': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'DR Congo': '🇨🇩', 'Uzbekistan': '🇺🇿', 'Colombia': '🇨🇴',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croatia': '🇭🇷', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
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
            <span class="flag">{{ flag(match.homeTeam) }}</span>
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
            <span class="flag">{{ flag(match.awayTeam) }}</span>
            <span class="name">{{ match.awayTeam }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
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
    .flag { font-size: 44px; line-height: 1; }
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
      .flag { font-size: 44px; }
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

  flag(team: string): string {
    return FLAGS[team] ?? '🏳️';
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
