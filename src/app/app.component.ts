import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatchService } from './services/match.service';
import { COMMON_TIMEZONES, TzOption } from './data/timezones';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <!-- ── Desktop header ── -->
    <mat-toolbar class="app-toolbar desktop-only" color="primary">
      <span class="toolbar-icon">⚽</span>
      <span class="toolbar-title">FIFA World Cup 2026</span>
      <span class="toolbar-sub">Canada · Mexico · USA</span>
      <span class="spacer"></span>
      <mat-form-field class="tz-field" appearance="outline" subscriptSizing="dynamic">
        <mat-label>Timezone</mat-label>
        <mat-select [(ngModel)]="selectedTz" (ngModelChange)="onTzChange($event)" panelClass="tz-overlay-panel">
          <mat-option *ngFor="let tz of timezones" [value]="tz.value">{{ tz.label }}</mat-option>
        </mat-select>
      </mat-form-field>
      <span class="toolbar-dates">Jun 11 – Jul 19</span>
    </mat-toolbar>

    <nav class="tab-nav desktop-only">
      <a routerLink="/schedule" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">calendar_month</mat-icon>Schedule
      </a>
      <a routerLink="/standings" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">table_chart</mat-icon>Standings
      </a>
      <a routerLink="/knockout" routerLinkActive="active-tab" matRipple class="tab-link">
        <mat-icon class="tab-icon">emoji_events</mat-icon>Knockout
      </a>
    </nav>

    <!-- ── Mobile header ── -->
    <div class="mobile-header mobile-only" [class.menu-open]="menuOpen">
      <span class="toolbar-icon">⚽</span>
      <span class="mobile-title">FIFA World Cup 2026</span>
      <span class="spacer"></span>
      <button class="hamburger" (click)="toggleMenu()" [attr.aria-expanded]="menuOpen" aria-label="Menu">
        <mat-icon>{{ menuOpen ? 'close' : 'menu' }}</mat-icon>
      </button>
    </div>

    <!-- Mobile drawer -->
    <div class="mobile-drawer mobile-only" [class.open]="menuOpen" (click)="closeMenu()">
      <div class="drawer-inner" (click)="$event.stopPropagation()">
        <a routerLink="/schedule" routerLinkActive="active-tab" matRipple class="drawer-link" (click)="closeMenu()">
          <mat-icon>calendar_month</mat-icon>Schedule
        </a>
        <a routerLink="/standings" routerLinkActive="active-tab" matRipple class="drawer-link" (click)="closeMenu()">
          <mat-icon>table_chart</mat-icon>Standings
        </a>
        <a routerLink="/knockout" routerLinkActive="active-tab" matRipple class="drawer-link" (click)="closeMenu()">
          <mat-icon>emoji_events</mat-icon>Knockout
        </a>
        <div class="drawer-tz">
          <mat-form-field class="tz-field-drawer" appearance="outline" subscriptSizing="dynamic">
            <mat-label>Timezone</mat-label>
            <mat-select [(ngModel)]="selectedTz" (ngModelChange)="onTzChange($event)">
              <mat-option *ngFor="let tz of timezones" [value]="tz.value">{{ tz.label }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </div>
    </div>

    <main class="app-content">
      <router-outlet></router-outlet>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100vh; }

    /* ── Desktop ── */
    .app-toolbar {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px 8px;
      height: auto !important;
      min-height: unset !important;
      overflow: visible !important;
      background: var(--mat-sys-primary) !important;
      color: var(--mat-sys-on-primary) !important;
    }
    .toolbar-icon { font-size: 22px; }
    .toolbar-title { font-size: 18px; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap; }
    .toolbar-sub {
      font-size: 12px; opacity: 0.75; margin-left: 4px;
      align-self: flex-end; padding-bottom: 4px; white-space: nowrap;
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

    .tab-nav {
      display: flex; flex-shrink: 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface); padding: 0 8px;
    }
    .tab-link {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 20px; font-size: 14px; font-weight: 500;
      color: var(--mat-sys-on-surface-variant); text-decoration: none;
      border-bottom: 3px solid transparent; cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap; letter-spacing: 0.3px; text-transform: uppercase;
    }
    .tab-link:hover { color: var(--mat-sys-primary); }
    .tab-link.active-tab { color: var(--mat-sys-primary); border-bottom-color: var(--mat-sys-primary); }
    .tab-icon { font-size: 18px; width: 18px; height: 18px; vertical-align: middle; }

    /* ── Mobile header ── */
    .mobile-header {
      display: none;
      flex-shrink: 0;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 48px;
      background: var(--mat-sys-primary);
      color: white;
      position: relative;
      z-index: 200;
    }
    .mobile-title { font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hamburger {
      background: none; border: none; color: white;
      cursor: pointer; padding: 4px; display: flex; align-items: center;
      border-radius: 4px;
    }
    .hamburger:hover { background: rgba(255,255,255,0.15); }

    /* ── Mobile drawer ── */
    .mobile-drawer {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 150;
      background: rgba(0,0,0,0);
      pointer-events: none;
      transition: background 0.25s;
    }
    .mobile-drawer.open {
      background: rgba(0,0,0,0.4);
      pointer-events: all;
    }
    .drawer-inner {
      position: absolute;
      top: 48px;
      left: 0; right: 0;
      background: var(--mat-sys-surface);
      display: flex;
      flex-direction: column;
      transform: translateY(-100%);
      transition: transform 0.25s ease;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .mobile-drawer.open .drawer-inner { transform: translateY(0); }

    .drawer-link {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 20px; font-size: 16px; font-weight: 500;
      color: var(--mat-sys-on-surface); text-decoration: none;
      border-left: 3px solid transparent;
      transition: background 0.15s, border-color 0.15s;
    }
    .drawer-link mat-icon { color: var(--mat-sys-on-surface-variant); }
    .drawer-link:hover { background: var(--mat-sys-surface-container); }
    .drawer-link.active-tab {
      color: var(--mat-sys-primary);
      border-left-color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
    }
    .drawer-link.active-tab mat-icon { color: var(--mat-sys-primary); }

    .drawer-tz {
      padding: 12px 20px 20px;
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
    .tz-field-drawer { width: 100%; }

    /* ── Shared ── */
    .app-content {
      flex: 1; overflow-y: auto;
      padding: 0 24px 24px; box-sizing: border-box;
    }

    /* ── Responsive visibility ── */
    .desktop-only { display: flex; }
    .mobile-only  { display: none; }

    @media (max-width: 760px) {
      .desktop-only { display: none !important; }
      .mobile-only  { display: flex; }
      .mobile-drawer { display: block; }
      .app-content { padding: 0 8px 16px; }
    }
  `]
})
export class AppComponent {
  timezones: TzOption[] = COMMON_TIMEZONES;
  selectedTz: string;
  menuOpen = false;

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

  private readonly BASE_URL = 'https://fifa-2026.curatedforsale.in';

  constructor(
    private matchService: MatchService,
    private titleService: Title,
    private metaService: Meta,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
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
      this.cdr.markForCheck();
    });
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }

  onTzChange(tz: string): void {
    this.matchService.setTimezone(tz);
    this.closeMenu();
  }

  private setTabMeta(tab: string): void {
    const m = this.TAB_META[tab] ?? this.TAB_META['schedule'];
    this.titleService.setTitle(m.title);
    this.metaService.updateTag({ name: 'description', content: m.description });
    this.metaService.updateTag({ property: 'og:title', content: m.title });
    this.metaService.updateTag({ property: 'og:description', content: m.description });

    const canonicalUrl = `${this.BASE_URL}/${tab}`;
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });
  }
}
