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
            <ng-container *ngIf="match.status === 'finished' || match.status === 'live'; else showTime">
              <span class="score" [class.live-score]="match.status === 'live'">
                {{ match.homeScore }} – {{ match.awayScore }}
              </span>
              <span *ngIf="match.status === 'live'" class="live-pill">LIVE</span>
            </ng-container>
            <ng-template #showTime>
              <span class="time">{{ localTime }}</span>
            </ng-template>
          </div>
          <div class="team away">
            <span class="name">{{ match.awayTeam }}</span>
            <span class="flag">{{ flag(match.awayTeam) }}</span>
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

    mat-card-content { padding: 12px 16px !important; }

    .stage-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .stage-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stage-group { background: #e8f5e9; color: #2e7d32; }
    .stage-knockout { background: #fff3e0; color: #e65100; }
    .stage-final { background: #fce4ec; color: #880e4f; }
    .venue { font-size: 12px; color: var(--mat-sys-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .teams-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px;
    }
    .team {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      font-size: 14px;
      min-width: 0;
    }
    .team.home { justify-content: flex-end; }
    .team.away { justify-content: flex-start; }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

    @media (max-width: 760px) {
      mat-card-content { padding: 16px 14px !important; }
      .teams-row {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 10px;
      }
      .team { justify-content: flex-start !important; font-size: 28px; gap: 8px; }
      .team.away { flex-direction: row; }
      .score-time { text-align: left; min-width: unset; }
      .name { white-space: normal; overflow: visible; text-overflow: unset; }
      .flag { font-size: 36px; }
      .score { font-size: 40px; }
      .time { font-size: 28px; }
      .stage-badge { font-size: 22px; padding: 4px 12px; }
      .venue { font-size: 20px; white-space: normal; }
      .stage-row { margin-bottom: 14px; gap: 10px; }
      .live-pill { font-size: 18px; padding: 3px 8px; }
    }
    .flag { font-size: 20px; line-height: 1; }
    .score-time { text-align: center; min-width: 72px; }
    .score { font-size: 20px; font-weight: 700; }
    .live-score { color: #e53935; }
    .live-pill {
      display: block;
      font-size: 10px;
      background: #e53935;
      color: white;
      border-radius: 4px;
      padding: 1px 5px;
      margin-top: 2px;
      animation: pulse 1.2s infinite;
    }
    .time { font-size: 14px; font-weight: 600; color: var(--mat-sys-primary); }

    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

    @media (max-width: 760px) {
      mat-card-content { padding: 10px 12px !important; }
      .stage-badge { font-size: 10px; padding: 2px 6px; }
      .venue { font-size: 11px; }
      .team { font-size: 13px; gap: 4px; }
      .flag { font-size: 18px; }
      .score { font-size: 18px; }
      .time { font-size: 13px; }
      .score-time { min-width: 60px; }
    }
  `]
})
export class MatchCardComponent {
  @Input() match!: Match;

  constructor(private matchService: MatchService) {}

  flag(team: string): string {
    return FLAGS[team] ?? '🏳️';
  }

  get localTime(): string {
    return this.matchService.formatLocalTime(this.match.date, this.match.timeUTC);
  }

  get stageClass(): string {
    const s = this.match.stage;
    if (s.startsWith('Group')) return 'stage-badge stage-group';
    if (s === 'Final') return 'stage-badge stage-final';
    return 'stage-badge stage-knockout';
  }
}
