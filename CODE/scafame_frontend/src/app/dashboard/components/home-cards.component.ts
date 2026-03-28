import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActionCardComponent } from '../../shared/components/card/action-card.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-home-cards',
  standalone: true,
  imports: [CommonModule, ActionCardComponent],
  template: `
    <div class="pt-14">

      <!-- Título -->
      <h1 class="text-4xl font-bold text-black text-center mb-12">Inventario</h1>

      <div class="flex flex-col items-center gap-8">
        <!-- Fila 1 -->
        <div class="flex flex-wrap gap-8 justify-center">
          <app-action-card
            icon="mdi:package-variant"
            label="Ver Inventario"
            (clicked)="goTo('inventory')"
          ></app-action-card>

          <app-action-card
            *ngIf="role === 'admin' || role === 'manager'"
            icon="mdi:view-dashboard-outline"
            label="Dashboard"
            (clicked)="goTo('dashboard')"
          ></app-action-card>

          <app-action-card
            icon="mdi:package-variant-minus"
            label="Retiros"
            (clicked)="goToRetiro()"
          ></app-action-card>
        </div>

        <!-- Fila 2 -->
        <div class="flex flex-wrap gap-8 justify-center">
          <app-action-card
            *ngIf="role === 'admin'"
            icon="mdi:pencil-box-outline"
            label="Modificar Inventario"
            (clicked)="goTo('modify')"
          ></app-action-card>

          <app-action-card
            *ngIf="role === 'admin' || role === 'manager'"
            icon="mdi:package-variant-plus"
            label="Ingresar Productos"
            (clicked)="goTo('entries/request')"
          ></app-action-card>


          <app-action-card
            icon="mdi:clipboard-list"
            label="Historial de Movimientos"
            (clicked)="goTo('history')"
          ></app-action-card>
        </div>
      </div>
    </div>
  `
})
export class HomeCardsComponent implements OnInit {
  role: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getPerfilUsuario().subscribe({
      next: (user) => {
        this.role = (user.role || '').toString().toLowerCase().trim();
        console.log('ROL DETECTADO:', this.role);
      },
      error: (err) => {
        console.error('Error obteniendo el perfil de usuario:', err);
      }
    });
  }

  goTo(path: string) {
    if (path.startsWith('/')) path = path.slice(1);
    this.router.navigate([path]);
  }

  goToRetiro() {
    if (this.role === 'admin') {
      this.router.navigate(['/removals']);
    } else {
      this.router.navigate(['/removals/request']);
    }
  }
}
