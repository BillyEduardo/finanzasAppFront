import { Component, input } from '@angular/core';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

@Component({
  selector: 'app-disponible-card',
  imports: [CurrencyRdPipe, LucideIconsModule],
  templateUrl: './disponible-card.html',
  styleUrl: './disponible-card.scss',
})
export class DisponibleCard {
  readonly amount = input(17550);
  readonly budgetPercent = input(34);
}
