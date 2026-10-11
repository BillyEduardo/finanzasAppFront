import { Component, input } from '@angular/core';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

@Component({
  selector: 'app-gastos-totales-card',
  imports: [CurrencyRdPipe, LucideIconsModule],
  templateUrl: './gastos-totales-card.html',
  styleUrl: './gastos-totales-card.scss',
})
export class GastosTotalesCard {
  readonly amount = input(32450);
  readonly changePercent = input(-12.5);
  readonly periodLabel = input('Este mes');
}
