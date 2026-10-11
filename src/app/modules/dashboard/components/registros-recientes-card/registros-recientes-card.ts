import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

interface RecentRecord {
  name: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
  tone: 'expense' | 'income';
}

@Component({
  selector: 'app-registros-recientes-card',
  imports: [RouterLink, CurrencyRdPipe, LucideIconsModule],
  templateUrl: './registros-recientes-card.html',
  styleUrl: './registros-recientes-card.scss',
})
export class RegistrosRecientesCard {
  readonly records: RecentRecord[] = [
    {
      name: 'Supermercado Nacional',
      category: 'Alimentación',
      amount: -2450,
      date: '21 May',
      icon: 'shopping-cart',
      tone: 'expense',
    },
    {
      name: 'Shell Gas Station',
      category: 'Transporte',
      amount: -1800,
      date: '20 May',
      icon: 'fuel',
      tone: 'expense',
    },
    {
      name: 'Netflix',
      category: 'Ocio',
      amount: -449,
      date: '18 May',
      icon: 'film',
      tone: 'expense',
    },
    {
      name: 'Transferencia recibida',
      category: 'Ingresos',
      amount: 15000,
      date: '17 May',
      icon: 'arrow-down',
      tone: 'income',
    },
    {
      name: 'Restaurante El Fogón',
      category: 'Alimentación',
      amount: -1250,
      date: '16 May',
      icon: 'utensils',
      tone: 'expense',
    },
  ];
}
