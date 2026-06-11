import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatchService } from './services/match.service';
import { COMMON_TIMEZONES, TzOption } from './data/timezones';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <mat-toolbar class="app-toolbar" color="primary">
      <span class="toolbar-icon">⚽</span>
      <span class="toolbar-title">FIFA World Cup 2026</span>
      <span class="toolbar-sub">Canada · Mexico · USA</span>
      <span class="spacer"></span>

      <mat-form-field class="tz-field" appearance="outline" subscriptSizing="dynamic">
        <mat-label>Timezone</mat-label>
        <mat-select [(ngModel)]="selectedTz" (ngModelChange)="onTzChange($event)">
          <mat-option *ngFor="let tz of timezones" [value]="tz.value">
            {{ tz.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <span class="toolbar-dates">Jun 11 – Jul 19</span>
    </mat-toolbar>

    <nav class="tab-nav">
      <a routerLink="/schedule" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">calendar_month</mat-icon>
        Schedule
      </a>
      <a routerLink="/standings" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">table_chart</mat-icon>
        Standings
      </a>
      <a routerLink="/knockout" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">emoji_events</mat-icon>
        Knockout
      </a>
    </nav>

    <div class="app-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; }

    .app-toolbar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      min-height: 48px !important;
    }
    .toolbar-icon { font-size: 22px; }
    .toolbar-title { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap; }
    .toolbar-sub {
      font-size: 12px;
      opacity: 0.75;
      margin-left: 4px;
      align-self: flex-end;
      padding-bottom: 4px;
      white-space: nowrap;
    }
    .spacer { flex: 1; }
    .toolbar-dates { font-size: 13px; opacity: 0.85; white-space: nowrap; }

    .tz-field { width: 220px; flex-shrink: 0; }
    .tz-field ::ng-deep .mat-mdc-text-field-wrapper { background: rgba(255,255,255,0.15) !important; }
    .tz-field ::ng-deep .mat-mdc-floating-label,
    .tz-field ::ng-deep .mat-mdc-select-value,
    .tz-field ::ng-deep .mat-mdc-select-arrow { color: white !important; }
    .tz-field ::ng-deep .mdc-notched-outline__leading,
    .tz-field ::ng-deep .mdc-notched-outline__notch,
    .tz-field ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.5) !important; }

    /* Tab nav */
    .tab-nav {
      display: flex;
      flex-shrink: 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      padding: 0 8px;
    }
    .tab-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 20px;
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface-variant);
      text-decoration: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .tab-link:hover { color: var(--mat-sys-primary); }
    .tab-link.active-tab {
      color: var(--mat-sys-primary);
      border-bottom-color: var(--mat-sys-primary);
    }
    .tab-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      vertical-align: middle;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 24px 24px;
      box-sizing: border-box;
    }

    @media (max-width: 760px) {
      .app-toolbar { flex-wrap: wrap; padding: 8px 12px; gap: 6px; }
      .toolbar-title { font-size: 15px; }
      .toolbar-sub { font-size: 11px; }
      .toolbar-dates { display: none; }
      .tz-field { width: 160px; }
      .spacer { display: none; }
      .app-content { padding: 0 8px 16px; }
      .tab-link { padding: 10px 12px; font-size: 12px; gap: 4px; }
    }
  `]
})
export class AppComponent {
  timezones: TzOption[] = COMMON_TIMEZONES;
  selectedTz: string;

  private readonly TAB_META: Record<string, { title: string; description: string }> = {
    schedule: {
      title: 'FIFA World Cup 2026 Schedule | Match Times in Your Timezone',
      description: 'Full FIFA World Cup 2026 match schedule — 104 games across 12 groups. Kickoff times automatically shown in your local timezone.',
    },
    standings: {
      title: 'FIFA World Cup 2026 Group Standings',
      description: 'Group standings for all 12 groups of the 2026 FIFA World Cup — points, goals scored, and goal difference.',
    },
    knockout: {
      title: 'FIFA World Cup 2026 Knockout Bracket',
      description: 'FIFA World Cup 2026 knockout stage bracket — Round of 32, Round of 16, Quarter-finals, Semi-finals and Final.',
    },
  };

  constructor(
    private matchService: MatchService,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
  ) {
    this.selectedTz = matchService.timezone;
    if (!COMMON_TIMEZONES.find(t => t.value === this.selectedTz)) {
      this.timezones = [{ label: this.selectedTz, value: this.selectedTz }, ...COMMON_TIMEZONES];
    }

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      const url = (e as NavigationEnd).url;
      const tab = url.includes('standings') ? 'standings' : url.includes('knockout') ? 'knockout' : 'schedule';
      this.setTabMeta(tab);
      (window as any).gtag?.('event', 'tab_view', { tab });
    });
  }

  onTzChange(tz: string): void {
    this.matchService.setTimezone(tz);
  }

  private setTabMeta(tab: string): void {
    const m = this.TAB_META[tab] ?? this.TAB_META['schedule'];
    this.titleService.setTitle(m.title);
    this.metaService.updateTag({ name: 'description', content: m.description });
    this.metaService.updateTag({ property: 'og:title', content: m.title });
    this.metaService.updateTag({ property: 'og:description', content: m.description });
  }
}
