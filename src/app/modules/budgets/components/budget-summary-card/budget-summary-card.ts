import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { BudgetCategoryLine } from '../../../../core/models/budget.model';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-budget-summary-card',
  imports: [CurrencyRdPipe],
  templateUrl: './budget-summary-card.html',
  styleUrl: './budget-summary-card.scss',
})
export class BudgetSummaryCard implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');
  private chart?: Chart;

  readonly categories = input<BudgetCategoryLine[]>([]);
  readonly spent = input(0);
  readonly spentPercent = input(0);

  constructor() {
    effect(() => {
      const cats = this.categories();
      if (!this.chart) return;
      this.chart.data.labels = cats.map((c) => c.name);
      const dataset = this.chart.data.datasets[0];
      dataset.data = cats.map((c) => c.spent);
      dataset.backgroundColor = cats.map((c) => c.color);
      this.chart.update();
    });
  }

  legendPercent(spent: number): number {
    const total = this.spent();
    if (total <= 0) return 0;
    return Math.round((spent / total) * 100);
  }

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const cats = this.categories();
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cats.map((c) => c.name),
        datasets: [
          {
            data: cats.map((c) => c.spent),
            backgroundColor: cats.map((c) => c.color),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => {
                const value = Number(item.raw);
                return ` ${item.label}: RD$ ${value.toLocaleString('es-DO')}`;
              },
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
