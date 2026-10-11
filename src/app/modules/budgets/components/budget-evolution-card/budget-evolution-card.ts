import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-budget-evolution-card',
  imports: [],
  templateUrl: './budget-evolution-card.html',
  styleUrl: './budget-evolution-card.scss',
})
export class BudgetEvolutionCard implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');
  private chart?: Chart;

  readonly total = input(0);
  readonly spent = input(0);

  constructor() {
    effect(() => {
      const total = this.total();
      const spent = this.spent();
      if (!this.chart) return;

      const points = this.buildSeries(total, spent);
      this.chart.data.datasets[0].data = points.spent;
      this.chart.data.datasets[1].data = points.budget;
      this.chart.update();
    });
  }

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(9, 188, 138, 0.28)');
    gradient.addColorStop(1, 'rgba(9, 188, 138, 0)');

    const points = this.buildSeries(this.total(), this.spent());

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1', '7', '14', '21', '31'],
        datasets: [
          {
            label: 'Gasto acumulado',
            data: points.spent,
            borderColor: '#09bc8a',
            backgroundColor: gradient,
            borderWidth: 2.5,
            pointBackgroundColor: '#09bc8a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Presupuesto',
            data: points.budget,
            borderColor: '#94a3b8',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#6b7280',
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
            },
          },
          tooltip: {
            callbacks: {
              label: (item) => ` RD$ ${Number(item.raw).toLocaleString('es-DO')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(23, 42, 58, 0.06)' },
            border: { display: false },
            ticks: {
              color: '#9ca3af',
              font: { size: 11 },
              callback: (value) => {
                const n = Number(value);
                return n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
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

  private buildSeries(total: number, spent: number): { spent: number[]; budget: number[] } {
    const safeTotal = Math.max(total, 0);
    const safeSpent = Math.max(spent, 0);
    return {
      spent: [
        Math.round(safeSpent * 0.12),
        Math.round(safeSpent * 0.32),
        Math.round(safeSpent * 0.55),
        Math.round(safeSpent * 0.78),
        safeSpent,
      ],
      budget: [safeTotal, safeTotal, safeTotal, safeTotal, safeTotal],
    };
  }
}
