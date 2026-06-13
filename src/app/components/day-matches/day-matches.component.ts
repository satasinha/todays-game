import { Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';

const TOURNAMENT_START = new Date(2026, 5, 11);
const TOURNAMENT_END   = new Date(2026, 6, 19);

@Component({
  selector: 'app-day-matches',
  standalone: false,
  template: `
    <div class="day-view">
      <!-- Nav bar -->
      <div class="day-nav">
        <button mat-icon-button (click)="go(-1)" [disabled]="!canGoPrev" aria-label="Previous day">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <div class="day-nav-center">
          <span class="day-title">{{ dateLabel }}</span>
          <span class="match-count" *ngIf="matches.length">
            {{ matches.length }} match{{ matches.length > 1 ? 'es' : '' }}
          </span>
        </div>

        <button mat-icon-button (click)="go(1)" [disabled]="!canGoNext" aria-label="Next day">
          <mat-icon>chevron_right</mat-icon>
        </button>

        <button mat-icon-button (click)="calendarToggle.emit()" [attr.aria-label]="calendarOpen ? 'Hide calendar' : 'Show calendar'" [class.active-toggle]="calendarOpen">
          <mat-icon>{{ calendarOpen ? 'calendar_view_day' : 'calendar_month' }}</mat-icon>
        </button>
      </div>

      <!-- Match list -->
      <div *ngIf="matches.length === 0" class="no-matches">
        <mat-icon>sports_soccer</mat-icon>
        <p>No matches scheduled</p>
      </div>

      <app-match-card *ngFor="let m of matches" [match]="m"></app-match-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .day-view { padding: 0 4px; }

    .day-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .day-nav-center {
      flex: 1;
      display: flex;
      align-items: baseline;
      gap: 12px;
      min-width: 0;
    }
    .day-title { font-size: 20px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .match-count {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-variant);
      padding: 2px 10px;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .active-toggle { color: var(--mat-sys-primary); }

    .no-matches {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: var(--mat-sys-on-surface-variant);
      gap: 8px;
    }
    .no-matches mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; }
    .no-matches p { margin: 0; font-size: 14px; }

    @media (max-width: 760px) {
      .day-nav { flex-wrap: wrap; gap: 4px; }
      .day-nav-center { flex-wrap: wrap; gap: 6px; }
      .day-title { font-size: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .match-count { font-size: 14px; padding: 2px 10px; }
      .no-matches mat-icon { font-size: 80px; width: 80px; height: 80px; }
      .no-matches p { font-size: 26px; }
    }
  `]
})
export class DayMatchesComponent implements OnChanges, OnInit, OnDestroy {
  @Input()  selectedDate!: Date;
  @Input()  calendarOpen = false;
  @Output() dateChange = new EventEmitter<Date>();
  @Output() calendarToggle = new EventEmitter<void>();

  matches: Match[] = [];
  private tzSub!: Subscription;

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tzSub = this.matchService.matches$.subscribe(() => {
      if (this.selectedDate) {
        this.matches = this.matchService.getMatchesForDate(this.selectedDate).map(m => ({ ...m }));
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.tzSub.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.selectedDate) {
      this.matches = this.matchService.getMatchesForDate(this.selectedDate).map(m => ({ ...m }));
    }
  }

  get dateLabel(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  }

  get canGoPrev(): boolean {
    return !!this.selectedDate && this.selectedDate > TOURNAMENT_START;
  }

  get canGoNext(): boolean {
    return !!this.selectedDate && this.selectedDate < TOURNAMENT_END;
  }

  go(delta: -1 | 1): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + delta);
    this.dateChange.emit(d);
  }
}
