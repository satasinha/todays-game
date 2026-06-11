import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../../shared/shared.module';
import { CalendarViewComponent } from '../../components/calendar-view/calendar-view.component';
import { DayMatchesComponent } from '../../components/day-matches/day-matches.component';

@NgModule({
  declarations: [CalendarViewComponent, DayMatchesComponent],
  imports: [
    SharedModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: CalendarViewComponent }]),
  ],
})
export class ScheduleModule {}
