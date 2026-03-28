import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retiro-card',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
  template: `
    <div
      class="rounded-xl p-4 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
             border-2 transition-colors duration-200 bg-white text-black min-w-0"
      [ngClass]="{
        'border-green-500': aprobadoInterno,
        'border-red-500': rechazadoInterno,
        'border-gray-300': !aprobadoInterno && !rechazadoInterno
      }"
    >
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
          (click)="onVerDetalles()"
          [disabled]="disabled"
          [ngClass]="{ 'opacity-50 cursor-not-allowed': disabled }"
        >
          Detalles
        </button>

        <button
          (click)="showConfirmModal('rechazar')"
          [disabled]="disabled || aprobadoInterno || rechazadoInterno"
          [ngClass]="{
            'opacity-50 cursor-not-allowed': disabled || aprobadoInterno || rechazadoInterno,
            'text-red-600': !(disabled || aprobadoInterno || rechazadoInterno)
          }"
          title="Rechazar"
          aria-label="Rechazar"
        >
          <iconify-icon icon="mdi:cancel" class="text-2xl hover:opacity-75"></iconify-icon>
        </button>

        <button
          (click)="showConfirmModal('aprobar')"
          [disabled]="disabled || aprobadoInterno || rechazadoInterno"
          [ngClass]="{
            'opacity-50 cursor-not-allowed': disabled || aprobadoInterno || rechazadoInterno,
            'text-green-600': !(disabled || aprobadoInterno || rechazadoInterno)
          }"
          title="Aprobar"
          aria-label="Aprobar"
        >
          <iconify-icon icon="mdi:check-circle" class="text-2xl hover:opacity-75"></iconify-icon>
        </button>
      </div>

      <!-- Modal de confirmación -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-xl max-w-sm w-full">
          <h2 class="text-xl font-bold mb-4">Confirmar acción</h2>
          <p class="mb-4">¿Estás seguro de que deseas {{ accion === 'aprobar' ? 'aprobar' : 'rechazar' }} este retiro?</p>
          <div class="flex justify-center gap-4">
            <button
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              *ngIf="accion === 'aprobar'"
              (click)="emitAprobar()"
            >
              Sí, aprobar
            </button>
            <button
              class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              *ngIf="accion === 'rechazar'"
              (click)="emitRechazar()"
            >
              Sí, rechazar
            </button>
            <button
              class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              (click)="cancelModal()"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RetiroCardComponent {
  @Input() id = '';
  @Input() fecha = '';
  @Input() aprobado = false;
  @Input() rechazado = false;
  @Input() disabled = false;            // ✅ nuevo: para reflejar el estado del table

  @Output() verDetalles = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<void>();
  @Output() rechazar = new EventEmitter<void>();

  aprobadoInterno = false;
  rechazadoInterno = false;
  showModal = false;
  accion: 'aprobar' | 'rechazar' | null = null;

  ngOnInit() {
    this.aprobadoInterno = this.aprobado;
    this.rechazadoInterno = this.rechazado;
  }

  onVerDetalles() {
    if (this.disabled) return;
    this.verDetalles.emit();
  }

  showConfirmModal(action: 'aprobar' | 'rechazar') {
    if (this.disabled || this.aprobadoInterno || this.rechazadoInterno) return;
    this.accion = action;
    this.showModal = true;
  }

  emitAprobar() {
    this.aprobadoInterno = true;
    this.showModal = false;
    this.aprobar.emit();
  }

  emitRechazar() {
    this.rechazadoInterno = true;
    this.showModal = false;
    this.rechazar.emit();
  }

  cancelModal() {
    this.accion = null;
    this.showModal = false;
  }
}
