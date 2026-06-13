import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';

interface CalendarDay {
  date: Date | null;
  dayNum: number | null;
  matches: Match[];
  isToday: boolean;
  isSelected: boolean;
  inTournament: boolean;
}

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  template: `
    <div class="page-layout">

      <!-- Day view on top -->
      <div class="day-panel">
        <div class="day-panel-inner">
          <app-day-matches *ngIf="selectedDate" [selectedDate]="selectedDate" [calendarOpen]="showCalendar" (dateChange)="onDayNavChange($event)" (calendarToggle)="showCalendar = !showCalendar"></app-day-matches>
        </div>
      </div>

      <!-- Calendar panel below (toggled) -->
      <div class="cal-panel" *ngIf="showCalendar">
        <div class="month-nav">
          <button mat-icon-button (click)="prevMonth()" [disabled]="currentMonth <= 0" aria-label="Previous month">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="month-label">{{ monthLabel }}</span>
          <button mat-icon-button (click)="nextMonth()" [disabled]="currentMonth >= months.length - 1" aria-label="Next month">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <span class="tz-chip">{{ timezone }}</span>
        </div>

        <div class="dow-row">
          <div class="dow" *ngFor="let d of dayNames">{{ d }}</div>
        </div>

        <div class="cal-grid">
          <div
            *ngFor="let day of calendarDays"
            class="cal-cell"
            [class.empty]="!day.date"
            [class.today]="day.isToday"
            [class.selected]="day.isSelected"
            [class.has-matches]="day.matches.length > 0"
            [class.out-of-tournament]="day.date && !day.inTournament"
            (click)="day.date && selectDay(day)">

            <div class="day-num" *ngIf="day.date">{{ day.dayNum }}</div>

            <div class="day-matches" *ngIf="day.matches.length > 0">
              <div class="day-match-pill" *ngFor="let m of day.matches | slice:0:3">
                <div class="pill-row1">
                  <span class="pill-group">{{ stageLabel(m.stage) }}</span>
                  <span class="pill-teams">{{ abbr(m.homeTeam) }} <span class="vs">v</span> {{ abbr(m.awayTeam) }}</span>
                </div>
                <div class="pill-time">{{ shortTime(m) }}</div>
              </div>
              <div class="more-badge" *ngIf="day.matches.length > 3">+{{ day.matches.length - 3 }} more</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    /* ── Layout: calendar full-width, day view below ── */
    :host { display: block; }

    .page-layout {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    @media (max-width: 760px) {
      .cal-panel { border-bottom: none; border-top: 2px solid var(--mat-sys-outline-variant); }
    }

    /* ── Calendar panel: full width ── */
    .cal-panel {
      width: 100%;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--mat-sys-outline-variant);
    }

    .month-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 6px;
      position: sticky;
      top: 0;
      background: var(--mat-sys-surface);
      z-index: 1;
      padding: 6px 0;
    }
    .month-label { font-size: 40px; font-weight: 700; min-width: 220px; text-align: center; }
    .tz-chip {
      font-size: 22px;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-variant);
      padding: 3px 10px;
      border-radius: 12px;
      margin-left: auto;
    }

    .dow-row {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
      margin-bottom: 3px;
    }
    .dow {
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      padding: 3px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 3px;
    }

    .cal-cell {
      min-height: 280px;
      border-radius: 8px;
      padding: 5px 6px;
      background: var(--mat-sys-surface-container-low);
      cursor: pointer;
      transition: background 0.15s, box-shadow 0.15s;
      overflow: hidden;
      box-sizing: border-box;
    }
    .cal-cell.empty { background: transparent; cursor: default; pointer-events: none; }
    .cal-cell.out-of-tournament { opacity: 0.4; }
    .cal-cell:not(.empty):hover { background: var(--mat-sys-surface-container-high); box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .cal-cell.today { background: var(--mat-sys-tertiary-container); border: 2px solid var(--mat-sys-tertiary); }
    .cal-cell.selected { background: var(--mat-sys-primary-container); border: 2px solid var(--mat-sys-primary); }
    .cal-cell.has-matches { background: var(--mat-sys-surface-container); }
    .cal-cell.has-matches:hover { background: var(--mat-sys-surface-container-highest); }
    .cal-cell.selected { background: var(--mat-sys-primary-container) !important; }

    .day-num { font-size: 24px; font-weight: 600; margin-bottom: 3px; line-height: 1; }
    .cal-cell.today .day-num { color: var(--mat-sys-tertiary); font-weight: 700; }
    .cal-cell.selected .day-num { color: var(--mat-sys-primary); font-weight: 700; }

    .day-matches { display: flex; flex-direction: column; gap: 4px; }
    .day-match-pill {
      display: flex;
      flex-direction: column;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 20px;
      line-height: 1.35;
      gap: 1px;
    }
    .cal-cell.selected .day-match-pill {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
    .pill-row1 { display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
    .pill-group { font-size: 18px; opacity: 0.7; font-weight: 500; flex-shrink: 0; }
    .pill-teams { font-weight: 700; }
    .vs { font-weight: 400; opacity: 0.7; }
    .pill-time { font-size: 18px; opacity: 0.75; }
    .more-badge {
      font-size: 16px;
      color: var(--mat-sys-on-surface-variant);
      padding: 2px 6px;
      font-style: italic;
    }

    /* ── Day view panel (below calendar) ── */
    .day-panel {
      padding: 20px 0 48px;
    }
    .day-panel-inner { max-width: 900px; }
    .day-panel-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
      color: var(--mat-sys-on-surface-variant);
      gap: 12px;
    }
    .day-panel-placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.35; }
    .day-panel-placeholder p { margin: 0; font-size: 15px; }

    /* ── Compact cells on small screens ── */
    @media (max-width: 760px) {
      .month-label { font-size: 28px; min-width: 160px; }
      .tz-chip { font-size: 13px; padding: 2px 7px; }
      .dow { font-size: 13px; }
      .cal-cell { min-height: 80px; padding: 3px 3px; }
      .day-num { font-size: 14px; }
      .day-match-pill { font-size: 11px; padding: 3px 4px; gap: 0; }
      .pill-group { font-size: 10px; }
      .pill-time { display: none; }
      .pill-teams { font-size: 11px; }
      .more-badge { font-size: 10px; padding: 1px 3px; }
    }
  `]
})
export class CalendarViewComponent implements OnInit {
  showCalendar = false;
  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  months: { year: number; month: number; label: string }[] = [
    { year: 2026, month: 5, label: 'June 2026' },
    { year: 2026, month: 6, label: 'July 2026' },
  ];
  currentMonth = 0;
  calendarDays: CalendarDay[] = [];
  selectedDate: Date = new Date(2026, 5, 11);

  private today = new Date();
  private allMatchDates: Map<string, Match[]> = new Map();

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.matchService.matches$.subscribe(() => {
      this.allMatchDates = this.buildMatchDateMap();
      this.buildCalendar();
      this.cdr.markForCheck();
    });

    // Default to today if within tournament
    const tournamentStart = new Date(2026, 5, 11);
    const tournamentEnd = new Date(2026, 6, 19);
    if (this.today >= tournamentStart && this.today <= tournamentEnd) {
      this.selectedDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
      this.currentMonth = this.today.getMonth() === 5 ? 0 : 1;
    }
  }

  get monthLabel(): string {
    return this.months[this.currentMonth].label;
  }

  get timezone(): string {
    return this.matchService.timezone;
  }

  prevMonth(): void {
    if (this.currentMonth > 0) { this.currentMonth--; this.buildCalendar(); }
  }

  nextMonth(): void {
    if (this.currentMonth < this.months.length - 1) { this.currentMonth++; this.buildCalendar(); }
  }

  onDayNavChange(date: Date): void {
    this.selectedDate = date;
    // Switch calendar month if the navigated date is in a different month
    const monthIdx = this.months.findIndex(m => m.year === date.getFullYear() && m.month === date.getMonth());
    if (monthIdx !== -1) this.currentMonth = monthIdx;
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    if (!day.date) return;
    this.selectedDate = day.date;
    this.buildCalendar();
  }

  shortTime(m: Match): string {
    return this.matchService.shortTime(m.date, m.timeUTC);
  }

  stageLabel(stage: string): string {
    if (stage.startsWith('Group ')) return `(${stage.slice(6)})`;
    const map: Record<string, string> = {
      'Round of 32': '(R32)', 'Round of 16': '(R16)',
      'Quarter-final': '(QF)', 'Semi-final': '(SF)',
      'Third place': '(3rd)', 'Final': '(F)',
    };
    return map[stage] ?? '';
  }

  abbr(team: string): string {
    const custom: Record<string, string> = {
      'Bosnia and Herzegovina': 'BIH',
      'United States': 'USA',
      'Saudi Arabia': 'KSA',
      'New Zealand': 'NZL',
      'Czech Republic': 'CZE',
      'South Africa': 'RSA',
      'South Korea': 'KOR',
      'Ivory Coast': 'CIV',
      'Cape Verde': 'CPV',
      'DR Congo': 'COD',
      'Netherlands': 'NED',
    };
    if (custom[team]) return custom[team];
    return team.slice(0, 3).toUpperCase();
  }

  private buildCalendar(): void {
    const { year, month } = this.months[this.currentMonth];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const tournamentStart = new Date(2026, 5, 11);
    const tournamentEnd = new Date(2026, 6, 19);

    this.calendarDays = [];

    // Full month: leading empty cells from day 1
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push({ date: null, dayNum: null, matches: [], isToday: false, isSelected: false, inTournament: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = this.dayKey(date);
      const matches = (this.allMatchDates.get(key) ?? []).sort((a, b) => a.timeUTC.localeCompare(b.timeUTC));
      this.calendarDays.push({
        date,
        dayNum: d,
        matches,
        isToday: this.dayKey(this.today) === key,
        isSelected: this.selectedDate ? this.dayKey(this.selectedDate) === key : false,
        inTournament: date >= tournamentStart && date <= tournamentEnd,
      });
    }

  }

  private buildMatchDateMap(): Map<string, Match[]> {
    const map = new Map<string, Match[]>();
    // Delegate TZ-aware date grouping to the service
    const months = [
      { year: 2026, month: 5 },
      { year: 2026, month: 6 },
    ];
    months.forEach(({ year, month }) => {
      const days = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const date = new Date(year, month, d);
        const matches = this.matchService.getMatchesForDate(date);
        if (matches.length) map.set(this.dayKey(date), matches);
      }
    });
    return map;
  }

  private dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
}
