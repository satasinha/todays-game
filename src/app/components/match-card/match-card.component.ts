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
  styleUrl: './match-card.component.scss'
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
    const matchDate = new Date(`${this.match.date}T${this.match.timeUTC}:00Z`);
    matchDate.setTime(matchDate.getTime() + 24 * 60 * 60 * 1000);
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
