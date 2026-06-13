import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Match } from '../../models/match.model';
import { MatchService } from '../../services/match.service';
import { KNOCKOUT_ROUNDS } from '../../data/fixtures';

@Component({
  selector: 'app-knockout-bracket',
  standalone: false,
  template: `
    <div class="bracket-container">
      <div class="bracket-intro">
        <mat-icon>emoji_events</mat-icon>
        <div>
          <div class="bracket-title">Knockout Stage</div>
          <div class="bracket-sub">Round of 32 · Jul 4–19, 2026</div>
        </div>
      </div>

      <mat-tab-group animationDuration="200ms">
        <mat-tab *ngFor="let round of rounds" [label]="round">
          <div class="round-matches">
            <app-match-card
              *ngFor="let m of getMatchesForRound(round)"
              [match]="m">
            </app-match-card>
            <div *ngIf="getMatchesForRound(round).length === 0" class="tbd-notice">
              <mat-icon>hourglass_empty</mat-icon>
              <p>Teams TBD — results from previous rounds determine match-ups</p>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .bracket-container { padding: 0 4px; }

    .bracket-intro {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: linear-gradient(135deg, var(--mat-sys-primary-container), var(--mat-sys-tertiary-container));
      border-radius: 12px;
    }
    .bracket-intro mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--mat-sys-primary); }
    .bracket-title { font-size: 18px; font-weight: 700; }
    .bracket-sub { font-size: 13px; color: var(--mat-sys-on-surface-variant); }

    .round-matches { padding: 16px 0; }

    .tbd-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: var(--mat-sys-on-surface-variant);
      gap: 8px;
      text-align: center;
    }
    .tbd-notice mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.4; }
    .tbd-notice p { margin: 0; font-size: 14px; max-width: 280px; }
  `]
})
export class KnockoutBracketComponent implements OnInit {
  rounds = KNOCKOUT_ROUNDS;
  private allMatches: Match[] = [];

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.matchService.matches$.subscribe(m => { this.allMatches = m; this.cdr.markForCheck(); });
  }

  getMatchesForRound(round: string): Match[] {
    return this.allMatches.filter(m => m.stage === round);
  }
}
