import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-acciones-rapidas-card',
  imports: [RouterLink, LucideIconsModule],
  templateUrl: './acciones-rapidas-card.html',
  styleUrl: './acciones-rapidas-card.scss',
})
export class AccionesRapidasCard {
  readonly actions: QuickAction[] = [
    {
      label: 'Nuevo registro',
      description: 'Agregar ingreso o gasto',
      icon: 'plus',
      route: '/transactions',
    },
    {
      label: 'Nueva categoría',
      description: 'Organiza tus movimientos',
      icon: 'folder-plus',
      route: '/categories',
    },
    {
      label: 'Nuevo presupuesto',
      description: 'Define un límite de gasto',
      icon: 'wallet',
      route: '/budgets',
    },
    {
      label: 'Nueva meta',
      description: 'Ahorra con un objetivo',
      icon: 'target',
      route: '/budgets',
    },
  ];
}
