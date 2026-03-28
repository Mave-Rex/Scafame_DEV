import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-view-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[1000px] w-full mx-auto relative flex flex-col justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Ver Usuarios</h1>

        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            [(ngModel)]="searchTerm"
            placeholder="Buscar por nombre o correo"
            class="border border-gray-300 rounded px-3 py-2 w-full"
            (input)="applyFilters()"
          />

          <select [(ngModel)]="selectedRole" class="border border-gray-300 rounded px-3 py-2 w-full" (change)="applyFilters()">
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="manager">Encargado</option>
            <option value="user">Usuario</option>
          </select>

          <select [(ngModel)]="selectedArea" class="border border-gray-300 rounded px-3 py-2 w-full" (change)="applyFilters()">
            <option value="">Todas las áreas</option>
            <option *ngFor="let area of areas" [value]="area">{{ area }}</option>
          </select>
        </div>

        <!-- Tabla -->
        <div class="bg-black text-white rounded-xl p-6 shadow-lg">
          <div class="overflow-x-auto max-h-[400px]">
            <table class="min-w-full text-sm text-left">
              <thead class="uppercase text-gray-400 border-b border-gray-500 sticky top-0 bg-black z-10">
                <tr>
                  <th class="py-2 px-4">Nombre</th>
                  <th class="py-2 px-4">Correo</th>
                  <th class="py-2 px-4">Rol</th>
                  <th class="py-2 px-4">Área</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let u of filteredUsers"
                  class="border-b border-gray-700 hover:bg-gray-800 transition"
                >
                  <td class="py-2 px-4">{{ u.firstname }} {{ u.lastname }}</td>
                  <td class="py-2 px-4">{{ u.email }}</td>
                  <td class="py-2 px-4 capitalize">{{ u.role }}</td>
                  <td class="py-2 px-4">{{ u.area }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Volver -->
        <div class="flex justify-center mt-8">
          <app-button label="Volver al Dashboard" variant="light" (click)="goBack()" />
        </div>
      </div>
    </main>
  `
})
export class ViewUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  areas: string[] = [];

  searchTerm: string = '';
  selectedRole: string = '';
  selectedArea: string = '';

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => {
        this.users = res;
        this.areas = Array.from(new Set(res.map((u) => u.area))).filter(Boolean);
        this.applyFilters();
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los usuarios');
      }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter((u) =>
      (`${u.firstname} ${u.lastname}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)) &&
      (!this.selectedRole || u.role === this.selectedRole) &&
      (!this.selectedArea || u.area === this.selectedArea)
    );
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
