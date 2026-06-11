import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StandingsComponent } from '../../components/standings/standings.component';

@NgModule({
  declarations: [StandingsComponent],
  imports: [
    SharedModule,
    RouterModule.forChild([{ path: '', component: StandingsComponent }]),
  ],
})
export class StandingsModule {}
