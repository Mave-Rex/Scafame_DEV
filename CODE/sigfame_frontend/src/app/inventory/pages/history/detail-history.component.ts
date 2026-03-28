import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-detail-history',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[900px] w-full mx-auto relative flex flex-col justify-center">
        
        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Registro ---</h1>

        <!-- Contenedor -->
        <div class="bg-black text-white rounded-2xl p-6">
          <h2 class="text-center font-bold text-lg mb-6">Registro: Tipo Registro</h2>
          <div
            class="flex flex-col gap-4 overflow-y-auto max-h-[360px] p-2"
            style="scrollbar-width: thin; scrollbar-color: white black;"
          >
            <div
              class="bg-white text-black rounded-xl p-4 flex justify-between font-bold"
              *ngFor="let prod of productos"
            >
              <span>Producto: {{ prod.nombre }}</span>
              <span>Cantidad Agregada/Retirada: {{ prod.cantidad }}</span>
            </div>
          </div>
        </div>

        <!-- Botón flotante -->
        <div class="absolute -right-5 translate-x-20 bottom-1">
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>

      </div>
    </main>
  `
})
export class DetailHistoryComponent {
  productos = [
    { nombre: 'Producto A', cantidad: 2 },
    { nombre: 'Producto B', cantidad: 1 },
    { nombre: 'Producto C', cantidad: 3 },
    { nombre: 'Producto D', cantidad: 2 }
  ];

  goBack() {
    history.back();
  }
}
