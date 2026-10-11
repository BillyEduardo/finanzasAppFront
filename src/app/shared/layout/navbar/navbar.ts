import { Component, computed, inject, input, output } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { LucideIconsModule } from '../../LucideIconsModule';

@Component({
  selector: 'app-navbar',
  imports: [LucideIconsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly theme = inject(ThemeService);

  readonly pageTitle = input('Dashboard');
  readonly pageSubtitle = input('Resumen general de tus finanzas');
  readonly userName = input('Billy Dionicio');
  readonly periodLabel = input('Mayo 2025');
  readonly menuToggle = output<void>();
  readonly logout = output<void>();

  readonly isDark = this.theme.isDark;

  readonly userInitials = computed(() => {
    const parts = this.userName().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  });

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }
}
