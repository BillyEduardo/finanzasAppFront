import { Component, input } from '@angular/core';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

@Component({
  selector: 'app-presupuesto-resumen-card',
  imports: [CurrencyRdPipe, LucideIconsModule],
  templateUrl: './presupuesto-resumen-card.html',
  styleUrl: './presupuesto-resumen-card.scss',
})
export class PresupuestoResumenCard {
  readonly amount = input(50000);
  readonly usedPercent = input(65);
}
