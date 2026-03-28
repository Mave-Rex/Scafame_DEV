import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../card/product-card.component';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="bg-black text-white rounded-2xl w-full p-4">
      
      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 justify-center mb-3">
        <select
          [(ngModel)]="selectedArea"
          class="rounded-full text-black px-3 py-1 text-sm font-bold"
        >
          <option *ngFor="let area of areas" [value]="area">{{ area }}</option>
        </select>

        <select
          [(ngModel)]="selectedCategoria"
          class="rounded-full text-black px-3 py-1 text-sm font-bold"
        >
          <option *ngFor="let categoria of categorias" [value]="categoria">
            {{ categoria }}
          </option>
        </select>
      </div>

      <!-- Grilla scrollable -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[360px] p-2"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >
        <app-product-card
          *ngFor="let producto of productos"
          [nombre]="producto.nombre"
          [stock]="producto.stock"
          (accion)="onAgregar(producto)"
          (verDetalles)="onVerDetalles(producto)"
        ></app-product-card>
      </div>
    </div>
  `
})
export class ProductTableComponent {
  @Input() productos: { nombre: string; stock: number }[] = [];
  @Input() areas: string[] = ['Área 1', 'Área 2'];
  @Input() categorias: string[] = ['Categoría 1', 'Categoría 2'];

  @Output() verDetalles = new EventEmitter<any>();
  @Output() agregar = new EventEmitter<any>();

  selectedArea = 'Área 1';
  selectedCategoria = 'Categoría 1';

  onVerDetalles(producto: any) {
    this.verDetalles.emit(producto);
  }

  onAgregar(producto: any) {
    this.agregar.emit(producto);
  }
}
