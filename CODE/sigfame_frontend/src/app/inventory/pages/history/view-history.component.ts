import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-view-history',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[900px] w-full mx-auto relative flex flex-col justify-center">
        
        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Historial de Movimientos</h1>

        <!-- Contenedor -->
        <div
          class="bg-black text-white rounded-2xl w-full p-4"
        >
          <div
            class="flex flex-col gap-4 overflow-y-auto max-h-[360px] p-2"
            style="scrollbar-width: thin; scrollbar-color: white black;"
          >
            <div
              class="bg-white text-black rounded-xl p-4 flex items-center justify-between"
              *ngFor="let registro of historial"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:gap-8 font-bold">
                <span>ID: {{ registro.id }}</span>
                <span>Registro: {{ registro.tipo }}</span>
                <span>Fecha: {{ registro.fecha }}</span>
              </div>
              <button
                class="bg-black text-white px-4 py-1 rounded-full hover:bg-gray-800 text-sm font-bold"
                (click)="verDetalles(registro)"
              >
                Detalles
              </button>
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
export class ViewHistoryComponent {
  historial = [
    { id: '001', tipo: 'Ingreso', fecha: '12/07/2025' },
    { id: '002', tipo: 'Retiro', fecha: '11/07/2025' },
    { id: '003', tipo: 'Ingreso', fecha: '10/07/2025' },
    { id: '004', tipo: 'Retiro', fecha: '09/07/2025' }
  ];

  verDetalles(registro: any) {
    history.pushState({}, '', `/history/${registro.id}`);
    location.reload();
  }

  goBack() {
    history.back();
  }
}
