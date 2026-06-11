import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatchCardComponent } from '../components/match-card/match-card.component';

@NgModule({
  declarations: [MatchCardComponent],
  imports: [CommonModule, MatCardModule, MatIconModule],
  exports: [MatchCardComponent, CommonModule, MatCardModule, MatIconModule],
})
export class SharedModule {}
