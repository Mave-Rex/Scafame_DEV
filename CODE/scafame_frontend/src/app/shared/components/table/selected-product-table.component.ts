import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedProductCardComponent } from '../card/selected-product-card.component';

@Component({
  selector: 'app-selected-product-table',
  standalone: true,
  imports: [CommonModule, SelectedProductCardComponent],
  template: `
    <div class="bg-black text-white rounded-2xl w-full max-w-[700px] mx-auto p-4">
      
      <!-- Área scrollable de tarjetas -->
      <div
        class="flex flex-col gap-3 p-2"
        [class.overflow-y-auto]="productos.length > 4"
        [class.max-h-[360px]]="productos.length > 4"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >
        <app-selected-product-card
          *ngFor="let producto of productos"
          [nombre]="producto.nombre"
          [cantidad]="producto.cantidad"
          (incrementar)="incrementar.emit(producto)"
          (decrementar)="decrementar.emit(producto)"
          (cantidadCambiada)="onCantidadCambiada(producto, $event)"
        ></app-selected-product-card>
      </div>

    </div>
  `
})
export class SelectedProductTableComponent {
  @Input() productos: { nombre: string; cantidad: number }[] = [];

  @Output() incrementar = new EventEmitter<any>();
  @Output() decrementar = new EventEmitter<any>();

  onCantidadCambiada(producto: any, nuevaCantidad: number) {
    producto.cantidad = nuevaCantidad;
  }
}
