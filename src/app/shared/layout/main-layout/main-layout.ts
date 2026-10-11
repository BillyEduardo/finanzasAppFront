import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { finalize, filter, map, startWith } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { UsersService } from '../../../core/services/users.service';
import { ConfirmModal } from '../../components/confirm-modal/confirm-modal';
import { Sidebar } from '../sidebar/sidebar';
import { Navbar } from '../navbar/navbar';

interface PageMeta {
  title: string;
  subtitle: string;
}

const PAGE_META: Record<string, PageMeta> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Resumen general de tus finanzas',
  },
  transactions: {
    title: 'Registros',
    subtitle: 'Administra tus ingresos y gastos',
  },
  categories: {
    title: 'Categorías',
    subtitle: 'Organiza y gestiona las categorías de tus finanzas',
  },
  budgets: {
    title: 'Presupuestos',
    subtitle: 'Administra y controla tus presupuestos',
  },
  reports: {
    title: 'Reportes',
    subtitle: 'Analiza el comportamiento de tu dinero',
  },
};

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Navbar, ConfirmModal],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly users = inject(UsersService);

  readonly sidebarCollapsed = signal(false);
  readonly mobileSidebarOpen = signal(false);
  readonly logoutModalOpen = signal(false);
  readonly logoutLoading = signal(false);

  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly pageMeta = computed(() => {
    const segment = this.currentPath().split('?')[0].split('/').filter(Boolean)[0] ?? 'dashboard';
    return (
      PAGE_META[segment] ?? {
        title: 'Finanzas',
        subtitle: 'Gestiona tu dinero con claridad',
      }
    );
  });

  readonly periodLabel = computed(() => {
    const label = new Intl.DateTimeFormat('es-DO', {
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  readonly userName = computed(() => this.session.user()?.displayName ?? 'Usuario');

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update((value) => !value);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update((value) => !value);
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  onLogout(): void {
    this.logoutModalOpen.set(true);
  }

  closeLogoutModal(): void {
    if (this.logoutLoading()) return;
    this.logoutModalOpen.set(false);
  }

  confirmLogout(): void {
    if (this.logoutLoading()) return;

    this.logoutLoading.set(true);

    this.users
      .logout()
      .pipe(
        finalize(() => {
          this.logoutLoading.set(false);
          this.logoutModalOpen.set(false);
          this.session.clearSession();
          void this.router.navigate(['/login']);
        }),
      )
      .subscribe({
        error: () => {
          // Local session is cleared in finalize even if revoke fails.
        },
      });
  }

  onNewRecord(): void {
    // TODO: abrir modal/formulario de nuevo registro
  }
}
