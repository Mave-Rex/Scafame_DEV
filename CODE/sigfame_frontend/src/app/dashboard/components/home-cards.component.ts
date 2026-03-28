import { Component } from '@angular/core';
import { ActionCardComponent } from '../../shared/components/card/action-card.component';

@Component({
  selector: 'app-home-cards',
  standalone: true,
  imports: [ActionCardComponent],
  template: `
    
    <div class="pt-14">

    <!-- Título -->
    <h1 class="text-4xl font-bold text-black text-center mb-12">Inventario</h1>

    <!-- Tarjetas organizadas -->
    <div class="flex flex-col items-center gap-8">

      <!-- Fila 1 -->
      <div class="flex flex-wrap gap-8 justify-center">
        <app-action-card
          icon="mdi:package-variant"
          label="Ver Inventario"
          (clicked)="goTo('inventory')"
        ></app-action-card>

        <app-action-card
          icon="mdi:package-variant-minus"
          label="Retiros"
          (clicked)="goTo('removals')"
        ></app-action-card>
      </div>

      <!-- Fila 2 -->
      <div class="flex flex-wrap gap-8 justify-center">
        <app-action-card
          icon="mdi:pencil-box-outline"
          label="Modificar Inventario"
          (clicked)="goTo('modify')"
        ></app-action-card>

        <app-action-card
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
  `
})
export class HomeCardsComponent {
  goTo(path: string) {
    window.location.href = '/' + path;
  }
}
