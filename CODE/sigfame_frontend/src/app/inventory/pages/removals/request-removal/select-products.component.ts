import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ProductTableComponent } from '../../../../shared/components/table/product-table.component';

@Component({
  selector: 'app-select-products',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ProductTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="flex-1 bg-white p-8 font-display overflow-hidden">
      <div class="max-w-[1100px] mx-auto relative h-full flex flex-col justify-center">

        <!-- Contenido centrado -->
        <div class="flex flex-col items-center text-center">

          <!-- Título -->
          <h1 class="text-4xl font-bold text-black mb-6 mt-2">
            Seleccionar productos
          </h1>

          <!-- Tabla centrada -->
          <app-product-table
            [productos]="productos"
            [areas]="areas"
            [categorias]="categorias"
            (verDetalles)="onDetails($event)"
            (agregar)="onAdd($event)"
          ></app-product-table>

          <!-- Botones alineados a la derecha -->
          <div class="absolute right-0 bottom-1 flex flex-col items-end gap-4">
            <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
            <app-button label="Ver pedido" variant="light" (click)="goToReview()"></app-button>
          </div>

        </div>
      </div>
    </main>
  `
})
export class SelectProductsComponent {
  productos = [
    { nombre: 'Producto 1', stock: 10 },
    { nombre: 'Producto 2', stock: 8 },
    { nombre: 'Producto 3', stock: 15 },
    { nombre: 'Producto 4', stock: 5 },
    { nombre: 'Producto 5', stock: 12 },
    { nombre: 'Producto 6', stock: 9 },
    { nombre: 'Producto 7', stock: 11 },
    { nombre: 'Producto 8', stock: 6 },
  ];

  areas = ['Área 1', 'Área 2'];
  categorias = ['Categoría 1', 'Categoría 2'];

  onDetails(producto: any) {
    console.log('Ver detalles de:', producto);
  }

  onAdd(producto: any) {
    console.log('Agregar producto:', producto);
  }

  goBack() {
    history.back();
  }

  goToReview() {
    history.pushState({}, '', '/removals/request/review');
    location.reload(); // o usa Router si prefieres navegación Angular
  }
}
