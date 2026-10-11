import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideIconsModule } from '../../LucideIconsModule';

export interface NavItem {
  label: string;
  route?: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideIconsModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly collapsed = input(false);
  readonly mobileOpen = input(false);
  readonly collapseToggle = output<void>();
  readonly navigate = output<void>();
  readonly newRecord = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'layout-grid' },
    { label: 'Registros', route: '/transactions', icon: 'list' },
    { label: 'Categorías', route: '/categories', icon: 'folder' },
    { label: 'Presupuestos', route: '/budgets', icon: 'wallet' },
    {
      label: 'Inversiones',
      icon: 'trending-up',
      disabled: true,
      badge: 'Pronto',
    },
    { label: 'Reportes', route: '/reports', icon: 'bar-chart-3' },
    {
      label: 'Configuración',
      icon: 'settings',
      disabled: true,
    },
  ];

  onCollapseToggle(): void {
    this.collapseToggle.emit();
  }

  onNavigate(): void {
    this.navigate.emit();
  }

  onNewRecord(): void {
    this.newRecord.emit();
  }
}
