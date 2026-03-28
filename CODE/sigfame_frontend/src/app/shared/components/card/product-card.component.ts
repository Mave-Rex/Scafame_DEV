import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl p-2 w-36 h-40 text-black flex flex-col justify-between shadow-md">
      <!-- Imagen -->
      <div class="bg-gray-300 text-center text-black text-xs font-bold py-1 rounded">
        Imagen
      </div>

      <!-- Info -->
      <div class="text-xs mt-1 leading-tight">
        <p class="font-bold">Producto:</p>
        <p>{{ nombre }}</p>
        <p class="font-bold mt-1">Stock:</p>
        <p>{{ stock }}</p>
      </div>

      <!-- Acciones -->
      <div class="flex justify-between items-center mt-2">
        <button
          class="bg-black text-white text-[10px] px-2 py-1 rounded-full font-bold"
          (click)="verDetalles.emit()"
        >
          Detalles
        </button>
        <button
          class="bg-black text-white text-sm w-6 h-6 flex items-center justify-center rounded-full"
          (click)="accion.emit()"
        >
          +
        </button>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() nombre = 'Producto';
  @Input() stock: number = 0;

  @Output() verDetalles = new EventEmitter<void>();
  @Output() accion = new EventEmitter<void>();
}
