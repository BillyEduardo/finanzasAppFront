import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
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
} from 'chart.js';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
);

@Component({
  selector: 'app-gastos-dia-card',
  imports: [LucideIconsModule],
  templateUrl: './gastos-dia-card.html',
  styleUrl: './gastos-dia-card.scss',
})
export class GastosDiaCard implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');
  private chart?: Chart;

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(9, 188, 138, 0.28)');
    gradient.addColorStop(1, 'rgba(9, 188, 138, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1', '7', '14', '21', '31'],
        datasets: [
          {
            data: [820, 1450, 980, 2100, 1680],
            borderColor: '#004346',
            backgroundColor: gradient,
            borderWidth: 2.5,
            pointBackgroundColor: '#004346',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
              callback: (value) => `${Number(value) / 1000}k`,
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
