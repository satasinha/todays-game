import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { GroupStanding } from '../../models/match.model';
import { MatchService } from '../../services/match.service';
import { GROUPS } from '../../data/fixtures';

interface GroupTable {
  group: string;
  rows: GroupStanding[];
}

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
  selector: 'app-standings',
  standalone: false,
  template: `
    <div class="standings-wrap">
      <div class="standings-intro">
        <mat-icon>table_chart</mat-icon>
        <div>
          <div class="intro-title">Group Stage Standings</div>
          <div class="intro-sub">Top 2 per group + best 8 third-place teams advance to Round of 32</div>
        </div>
        <div class="legend">
          <span class="swatch q1"></span><span>Qualify (1st/2nd)</span>
          <span class="swatch q3"></span><span>Possible 3rd</span>
        </div>
      </div>

      <div class="groups-grid">
        <div class="group-card mat-elevation-z1" *ngFor="let gt of tables">
          <div class="group-title">Group {{ gt.group }}</div>
          <table>
            <thead>
              <tr>
                <th class="col-team">Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th class="col-pts">Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of gt.rows; let i = index"
                  [class.qualify-top]="i < 2"
                  [class.qualify-third]="i === 2">
                <td class="col-team">
                  <img class="flag" [src]="flagUrl(row.team)" [alt]="row.team" width="24" height="18">
                  <span class="team-name">{{ row.team }}</span>
                </td>
                <td>{{ row.played }}</td>
                <td>{{ row.won }}</td>
                <td>{{ row.drawn }}</td>
                <td>{{ row.lost }}</td>
                <td>{{ row.gf }}</td>
                <td>{{ row.ga }}</td>
                <td [class.positive]="row.gd > 0" [class.negative]="row.gd < 0">
                  {{ row.gd > 0 ? '+' : '' }}{{ row.gd }}
                </td>
                <td class="col-pts pts-val">{{ row.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .standings-wrap { padding: 0 0 48px; }

    .standings-intro {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      margin-bottom: 20px;
      background: linear-gradient(135deg, var(--mat-sys-primary-container), var(--mat-sys-tertiary-container));
      border-radius: 14px;
      flex-wrap: wrap;
    }
    .standings-intro mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--mat-sys-primary); flex-shrink: 0; }
    .intro-title { font-size: 18px; font-weight: 700; }
    .intro-sub { font-size: 13px; color: var(--mat-sys-on-surface-variant); margin-top: 2px; }

    .legend {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      flex-wrap: wrap;
    }
    .swatch { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-left: 6px; }
    .swatch.q1 { background: #c8e6c9; }
    .swatch.q3 { background: #fff9c4; }

    /* 4-column grid of group tables */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    @media (max-width: 1100px) { .groups-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 800px)  { .groups-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 500px)  { .groups-grid { grid-template-columns: 1fr; } }

    .group-card {
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
    }
    .group-title {
      font-size: 15px;
      font-weight: 700;
      padding: 10px 14px 6px;
      color: var(--mat-sys-primary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 13px;
    }
    thead tr {
      background: var(--mat-sys-surface-container-high);
    }
    th {
      padding: 5px 6px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: var(--mat-sys-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    th.col-team { text-align: left; padding-left: 10px; width: 38%; }

    td {
      padding: 6px 6px;
      text-align: center;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }

    /* Qualification highlighting */
    tr.qualify-top td { background: #e8f5e9; }
    tr.qualify-third td { background: #fffde7; }

    /* Team column */
    .col-team { text-align: left !important; }
    td.col-team {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-left: 10px;
      min-width: 0;
    }
    .flag { width: 24px; height: 18px; object-fit: cover; border-radius: 2px; flex-shrink: 0; }
    .team-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Points column */
    .col-pts { font-weight: 700; }
    .pts-val { font-size: 14px; font-weight: 800; color: var(--mat-sys-primary); }

    /* GD colouring */
    .positive { color: #2e7d32; font-weight: 600; }
    .negative { color: #c62828; font-weight: 600; }

    /* Divider line after 2nd row (between qualifiers and rest) */
    tr.qualify-top:nth-child(2) td { border-bottom: 2px solid var(--mat-sys-outline); }
  `]
})
export class StandingsComponent implements OnInit {
  tables: GroupTable[] = [];

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.matchService.matches$.subscribe(() => {
      this.tables = GROUPS.map(g => ({
        group: g,
        rows: this.matchService.getGroupStandings(g),
      }));
      this.cdr.markForCheck();
    });
  }

  flagUrl(team: string): string {
    const code = FLAG_CODES[team];
    return code ? `https://flagcdn.com/w40/${code}.png` : '';
  }
}
