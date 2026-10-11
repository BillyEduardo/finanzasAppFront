import { Component, input } from '@angular/core';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

@Component({
  selector: 'app-registros-count-card',
  imports: [LucideIconsModule],
  templateUrl: './registros-count-card.html',
  styleUrl: './registros-count-card.scss',
})
export class RegistrosCountCard {
  readonly count = input(24);
  readonly delta = input(8);
}
