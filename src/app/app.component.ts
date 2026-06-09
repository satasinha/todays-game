import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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

      <!-- Timezone picker -->
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

    <div class="app-content">
      <mat-tab-group class="main-tabs" animationDuration="250ms" dynamicHeight (selectedTabChange)="onTabChange($event.index)">

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">calendar_month</mat-icon>
            Schedule
          </ng-template>
          <div class="tab-content">
            <app-calendar-view></app-calendar-view>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">table_chart</mat-icon>
            Standings
          </ng-template>
          <div class="tab-content">
            <app-standings></app-standings>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">emoji_events</mat-icon>
            Knockout
          </ng-template>
          <div class="tab-content">
            <app-knockout-bracket></app-knockout-bracket>
          </div>
        </mat-tab>

      </mat-tab-group>
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

    /* Timezone select in the toolbar */
    .tz-field {
      width: 220px;
      flex-shrink: 0;
    }
    /* Override Material colors inside the dark toolbar */
    .tz-field ::ng-deep .mat-mdc-text-field-wrapper { background: rgba(255,255,255,0.15) !important; }
    .tz-field ::ng-deep .mat-mdc-floating-label,
    .tz-field ::ng-deep .mat-mdc-select-value,
    .tz-field ::ng-deep .mat-mdc-select-arrow { color: white !important; }
    .tz-field ::ng-deep .mdc-notched-outline__leading,
    .tz-field ::ng-deep .mdc-notched-outline__notch,
    .tz-field ::ng-deep .mdc-notched-outline__trailing { border-color: rgba(255,255,255,0.5) !important; }

    .app-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 24px 24px;
      box-sizing: border-box;
    }

    .main-tabs { width: 100%; }

    .tab-icon {
      margin-right: 6px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      vertical-align: middle;
    }

    .tab-content { padding: 16px 0 0; }
  `]
})
export class AppComponent {
  timezones: TzOption[] = COMMON_TIMEZONES;
  selectedTz: string;

  private readonly TAB_META = [
    {
      title: 'FIFA World Cup 2026 Schedule | Match Times in Your Timezone',
      description: 'Full FIFA World Cup 2026 match schedule — 104 games across 12 groups. Kickoff times automatically shown in your local timezone.',
    },
    {
      title: 'FIFA World Cup 2026 Group Standings',
      description: 'Live group standings for all 12 groups of the 2026 FIFA World Cup — points, goals, goal difference updated in real time.',
    },
    {
      title: 'FIFA World Cup 2026 Knockout Bracket',
      description: 'FIFA World Cup 2026 knockout stage bracket — Round of 32, Round of 16, Quarter-finals, Semi-finals and Final.',
    },
  ];

  constructor(
    private matchService: MatchService,
    private titleService: Title,
    private metaService: Meta,
  ) {
    this.selectedTz = matchService.timezone;
    if (!COMMON_TIMEZONES.find(t => t.value === this.selectedTz)) {
      this.timezones = [{ label: this.selectedTz, value: this.selectedTz }, ...COMMON_TIMEZONES];
    }
    this.setTabMeta(0);
  }

  onTabChange(index: number): void {
    this.setTabMeta(index);
  }

  onTzChange(tz: string): void {
    this.matchService.setTimezone(tz);
  }

  private setTabMeta(index: number): void {
    const m = this.TAB_META[index] ?? this.TAB_META[0];
    this.titleService.setTitle(m.title);
    this.metaService.updateTag({ name: 'description', content: m.description });
    this.metaService.updateTag({ property: 'og:title', content: m.title });
    this.metaService.updateTag({ property: 'og:description', content: m.description });
  }
}
