import { Routes } from '@angular/router';
import { UsersComponent } from '../../dashboard/components/users.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UsersComponent, // Pantalla con tarjetas de gestión de usuarios
  },
  {
    path: 'list',
    loadComponent: () =>
      import('../pages/view-users.component').then((m) => m.ViewUsersComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('../pages/add-user.component').then((m) => m.AddUserComponent),
  },
  {
    path: 'edit',
    loadComponent: () =>
      import('../pages/edit-user.component').then((m) => m.EditUserComponent),
  },
  {
    path: 'delete',
    loadComponent: () =>
      import('../pages/delete-user.component').then((m) => m.DeleteUserComponent),
  },
];
