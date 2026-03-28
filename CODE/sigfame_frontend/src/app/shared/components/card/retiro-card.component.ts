import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-retiro-card',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="bg-white text-black rounded-xl p-4 flex items-center justify-between gap-4 w-full">

      <!-- Información -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:gap-8 font-bold">
        <span>ID: {{ id }}</span>
        <span>Retiro</span>
        <span>Fecha: {{ fecha }}</span>
      </div>

      <!-- Acciones -->
      <div class="flex items-center gap-4">
        <button
          class="bg-black text-white px-4 py-1 rounded-full hover:bg-gray-800 text-sm font-bold"
          (click)="verDetalles.emit()"
        >
          Detalles
        </button>

        <button (click)="rechazar.emit()">
          <iconify-icon icon="mdi:cancel" class="text-2xl hover:opacity-75"></iconify-icon>
        </button>

        <button (click)="aprobar.emit()">
          <iconify-icon icon="mdi:check-circle" class="text-2xl hover:opacity-75"></iconify-icon>
        </button>
      </div>
    </div>
  `
})
export class RetiroCardComponent {
  @Input() id: string = '';
  @Input() fecha: string = '';
  @Output() verDetalles = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<void>();
}
