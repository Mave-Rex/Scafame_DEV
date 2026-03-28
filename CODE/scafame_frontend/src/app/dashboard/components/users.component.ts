import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionCardComponent } from '../../shared/components/card/action-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ActionCardComponent],
  template: `
    <div class="pt-14">
      <!-- Título -->
      <h1 class="text-4xl font-bold text-black text-center mb-12">Gestión de Usuarios</h1>

      <!-- Tarjetas en 2 filas de 2 columnas -->
      <div class="flex flex-col items-center gap-8">
        <!-- Fila 1 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <app-action-card
            icon="mdi:account-multiple"
            label="Ver Usuarios"
            (clicked)="goTo('list')"
          ></app-action-card>

          <app-action-card
            icon="mdi:account-plus"
            label="Agregar Usuario"
            (clicked)="goTo('add')"
          ></app-action-card>
        </div>

        <!-- Fila 2 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <app-action-card
            icon="mdi:account-edit"
            label="Editar Usuario"
            (clicked)="goTo('edit')"
          ></app-action-card>

          <app-action-card
            icon="mdi:account-remove"
            label="Eliminar Usuario"
            (clicked)="goTo('delete')"
          ></app-action-card>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate(['users', path]);
  }
}
