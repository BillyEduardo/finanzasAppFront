import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export interface CategorySlice {
  label: string;
  amount: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'app-gastos-categoria-card',
  imports: [CurrencyRdPipe, LucideIconsModule],
  templateUrl: './gastos-categoria-card.html',
  styleUrl: './gastos-categoria-card.scss',
})
export class GastosCategoriaCard implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');
  private chart?: Chart;

  readonly slices: CategorySlice[] = [
    { label: 'Alimentación', amount: 12331, percent: 38, color: '#004346' },
    { label: 'Transporte', amount: 7140, percent: 22, color: '#0f766e' },
    { label: 'Hogar', amount: 5841, percent: 18, color: '#09bc8a' },
    { label: 'Ocio', amount: 3894, percent: 12, color: '#75dddd' },
    { label: 'Otros', amount: 3244, percent: 10, color: '#508991' },
  ];

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.slices.map((s) => s.label),
        datasets: [
          {
            data: this.slices.map((s) => s.percent),
            backgroundColor: this.slices.map((s) => s.color),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw}%`,
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
