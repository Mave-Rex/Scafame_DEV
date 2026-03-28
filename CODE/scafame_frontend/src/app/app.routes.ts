import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardLayoutComponent } from './dashboard/pages/dashboard-layout.component';
import { HomeCardsComponent } from './dashboard/components/home-cards.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent,
  },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./dashboard/components/home-cards.component').then((m) => m.HomeCardsComponent),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/routes/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/routes/inventory.routes').then((m) => m.inventoryRoutes),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./inventory/routes/dashboard.routes').then((m) => m.inventoryRoutes),
      },
      {
        path: 'removals',
        loadChildren: () =>
          import('./inventory/routes/removals.routes').then((m) => m.removalsRoutes),
      },
      {
        path: 'entries',
        loadChildren: () =>
          import('./inventory/routes/entries.routes').then((m) => m.entriesRoutes),
      },
      {
        path: 'history',
        loadChildren: () =>
          import('./inventory/routes/history.routes').then((m) => m.historyRoutes),
      },
      {
        path: 'modify',
        loadChildren: () =>
          import('./inventory/routes/modify.routes').then((m) => m.modifyRoutes),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
