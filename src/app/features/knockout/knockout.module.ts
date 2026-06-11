import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../../shared/shared.module';
import { KnockoutBracketComponent } from '../../components/knockout-bracket/knockout-bracket.component';

@NgModule({
  declarations: [KnockoutBracketComponent],
  imports: [
    SharedModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: KnockoutBracketComponent }]),
  ],
})
export class KnockoutModule {}
