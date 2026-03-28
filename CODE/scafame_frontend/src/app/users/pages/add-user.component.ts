import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] pt-2 pb-4 sm:pt-4 sm:pb-8 font-display">
      <div class="w-full max-w-[600px] mx-auto bg-black text-white p-6 sm:p-8 rounded-2xl shadow-lg">

        <h1 class="text-3xl font-bold mb-6 text-center">Agregar Usuario</h1>

        <form (ngSubmit)="submit()" #form="ngForm" class="space-y-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input type="text" name="firstname" [(ngModel)]="user.firstname" required placeholder="Nombres" class="px-3 py-2 rounded text-black w-full"/>
            <input type="text" name="lastname" [(ngModel)]="user.lastname" required placeholder="Apellidos" class="px-3 py-2 rounded text-black w-full"/>
          </div>

          <input type="text" name="username" [(ngModel)]="user.username" required placeholder="Nombre de usuario" class="px-3 py-2 rounded text-black w-full"/>
          <input type="email" name="email" [(ngModel)]="user.email" required placeholder="Correo electrónico" class="px-3 py-2 rounded text-black w-full"/>
          <input type="password" name="password" [(ngModel)]="user.password" required placeholder="Contraseña" class="px-3 py-2 rounded text-black w-full"/>
          <input type="text" name="area" [(ngModel)]="user.area" required placeholder="Área" class="px-3 py-2 rounded text-black w-full"/>
          <input type="text" name="jobTitle" [(ngModel)]="user.jobTitle" required placeholder="Cargo / Puesto" class="px-3 py-2 rounded text-black w-full"/>

          <select name="role" [(ngModel)]="user.role" required class="px-3 py-2 rounded text-black w-full appearance-none">
            <option value="">Selecciona un rol</option>
            <option value="admin">Administrador</option>
            <option value="manager">Bodeguero</option>
            <option value="user">Usuario</option>
          </select>

          <div class="flex flex-col sm:flex-row justify-between gap-2 mt-4">
            <app-button label="Cancelar" variant="dark" (click)="goBack()" />
            <app-button label="Crear Usuario" variant="dark" type="submit" />
          </div>
        </form>

      </div>
    </main>
  `
})
export class AddUserComponent {
  user: User = {
    id: 0,
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    area: '',
    jobTitle: '',
    role: 'user',
    // accessLevel ya no se edita manualmente
    accessLevel: 'low'
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  private roleToAccessLevel(role: 'admin'|'manager'|'user'): 'high'|'medium'|'low' {
    if (role === 'admin') return 'high';
    if (role === 'manager') return 'medium';
    return 'low';
  }

  submit() {
    const payload: User = {
      ...this.user,
      accessLevel: this.roleToAccessLevel(this.user.role as 'admin'|'manager'|'user'),
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.toastr.success('Usuario creado correctamente');
        this.router.navigate(['/users/list']);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al crear usuario';
        this.toastr.error(msg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
