import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selected-product-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl p-2 w-[290px] h-20 flex items-center justify-between gap-2 shadow-md">
      
      <!-- Imagen -->
      <div class="bg-gray-300 w-14 h-14 rounded-md flex items-center justify-center text-xs font-bold text-black">
        Imagen
      </div>

      <!-- Info -->
      <div class="flex-1 text-left text-xs text-black leading-tight">
        <p class="font-bold">Producto: <span class="font-normal">{{ nombre }}</span></p>
        <p class="font-bold">Cantidad: <span class="font-normal">{{ cantidad }}</span></p>
      </div>

      <!-- Acciones -->
      <div class="flex gap-1">
        <button
          class="text-black border border-black rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center hover:bg-black hover:text-white"
          (click)="decrementar.emit()"
        >−</button>

        <button
          class="text-black border border-black rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center hover:bg-black hover:text-white"
          (click)="incrementar.emit()"
        >+</button>
      </div>
    </div>
  `
})
export class SelectedProductCardComponent {
  @Input() nombre = 'Producto';
  @Input() cantidad = 1;

  @Output() incrementar = new EventEmitter<void>();
  @Output() decrementar = new EventEmitter<void>();
}
