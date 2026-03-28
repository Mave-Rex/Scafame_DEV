import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-delete-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-4 sm:p-8 font-display">
      <div class="w-full max-w-[600px] mx-auto bg-black p-6 sm:p-8 rounded-2xl shadow space-y-6">

        <!-- Título -->
        <h1 class="text-3xl font-bold text-center text-white">Eliminar Usuario</h1>

        <form #deleteForm="ngForm" class="space-y-4">

          <!-- Buscador -->
          <div class="space-y-2 mb-6">
            <input
              [(ngModel)]="searchTerm"
              name="searchTerm"
              type="text"
              placeholder="Buscar por nombre o correo"
              class="px-3 py-2 rounded text-black w-full"
              (input)="buscarUsuarios()"
            />

            <!-- Lista de coincidencias -->
            <div *ngIf="coincidencias.length > 0" class="bg-white rounded p-3 text-black shadow">
              <ul class="space-y-1">
                <li
                  *ngFor="let u of coincidencias"
                  (click)="seleccionarUsuario(u)"
                  class="cursor-pointer hover:underline"
                >
                  {{ u.firstname }} {{ u.lastname }} — {{ u.email }} ({{ u.role }})
                </li>
              </ul>
            </div>
          </div>

          <!-- Resultado del usuario encontrado -->
          <div *ngIf="userFound" class="bg-white text-black p-4 rounded shadow space-y-2">
            <p><strong>Nombre:</strong> {{ userFound.firstname }} {{ userFound.lastname }}</p>
            <p><strong>Usuario:</strong> {{ userFound.username }}</p>
            <p><strong>Email:</strong> {{ userFound.email }}</p>
            <p><strong>Área:</strong> {{ userFound.area }}</p>
            <p><strong>Rol:</strong> {{ userFound.role }}</p>

            <!-- Botones de acción -->
            <div class="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <app-button
                label="Eliminar Usuario"
                variant="light"
                (click)="confirmDelete()"
              />
              <app-button
                label="Cancelar"
                variant="light"
                (click)="cancel()"
              />
            </div>
          </div>
        </form>

        <!-- Botón volver al dashboard -->
        <div class="flex justify-center mt-6">
          <app-button label="Volver al Dashboard" variant="dark" (click)="goBack()" />
        </div>
      </div>
    </main>
  `
})
export class DeleteUserComponent {
  searchTerm = '';
  coincidencias: any[] = [];
  allUsers: any[] = [];
  userFound: any = null;

  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private router: Router
  ) {}

  buscarUsuarios() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.coincidencias = [];
      return;
    }

    if (this.allUsers.length === 0) {
      this.http.get<any[]>(`${environment.API_BASE}/users`).subscribe({
        next: (res) => {
          this.allUsers = res;
          this.filtrarCoincidencias(term);
        },
        error: () => this.toastr.error('Error al cargar usuarios')
      });
    } else {
      this.filtrarCoincidencias(term);
    }
  }

  filtrarCoincidencias(term: string) {
    this.coincidencias = this.allUsers.filter((u) =>
      (`${u.firstname} ${u.lastname}`.toLowerCase().includes(term) ||
       u.email.toLowerCase().includes(term))
    );
  }

  seleccionarUsuario(user: any) {
    this.userFound = { ...user };
    this.searchTerm = `${user.firstname} ${user.lastname}`;
    this.coincidencias = [];
  }

  confirmDelete() {
    if (!this.userFound?.id) {
      this.toastr.warning('Ningún usuario seleccionado');
      return;
    }

    this.http.delete(`${environment.API_BASE}/users/${this.userFound.id}`).subscribe({
      next: () => {
        this.toastr.success(`Usuario ${this.userFound.username} eliminado correctamente`);
        this.userFound = null;
        this.searchTerm = '';
      },
      error: () => {
        this.toastr.error('No se pudo eliminar el usuario');
      }
    });
  }

  cancel() {
    this.userFound = null;
    this.searchTerm = '';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
