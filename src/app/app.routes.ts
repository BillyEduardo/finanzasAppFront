import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/Security/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./modules/Security/register/register').then((m) => m.Register),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./modules/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./modules/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'budgets',
        loadComponent: () =>
          import('./modules/budgets/budgets').then((m) => m.Budgets),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./modules/reports/reports').then((m) => m.Reports),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
