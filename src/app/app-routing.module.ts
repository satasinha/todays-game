import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'schedule', pathMatch: 'full' },
  {
    path: 'schedule',
    loadChildren: () => import('./features/schedule/schedule.module').then(m => m.ScheduleModule),
  },
  {
    path: 'standings',
    loadChildren: () => import('./features/standings/standings.module').then(m => m.StandingsModule),
  },
  {
    path: 'knockout',
    loadChildren: () => import('./features/knockout/knockout.module').then(m => m.KnockoutModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
