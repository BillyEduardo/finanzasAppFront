import { Component } from '@angular/core';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';

interface BudgetItem {
  title: string;
  spent: number;
  total: number;
  percent: number;
}

@Component({
  selector: 'app-presupuestos-overview-card',
  imports: [CurrencyRdPipe],
  templateUrl: './presupuestos-overview-card.html',
  styleUrl: './presupuestos-overview-card.scss',
})
export class PresupuestosOverviewCard {
  readonly budgets: BudgetItem[] = [
    { title: 'Presupuesto Mensual', spent: 32450, total: 50000, percent: 65 },
    { title: 'Presupuesto Quincenal', spent: 8200, total: 20000, percent: 40 },
  ];

  circumference = 2 * Math.PI * 36;

  dashOffset(percent: number): number {
    return this.circumference * (1 - percent / 100);
  }

  remaining(spent: number, total: number): number {
    return Math.max(total - spent, 0);
  }
}
