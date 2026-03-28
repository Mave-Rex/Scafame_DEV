import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectedProductTableComponent } from '../../../../shared/components/table/selected-product-table.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-request',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SelectedProductTableComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[1100px] w-full mx-auto relative flex flex-col justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Solicitar Retiro</h1>

        <!-- Tabla de productos seleccionados -->
        <app-selected-product-table
          [productos]="selected"
          (incrementar)="increase($event)"
          (decrementar)="decrease($event)"
        ></app-selected-product-table>

        <!-- Botones flotantes alineados a la derecha -->
        <div class="absolute -right-8 bottom-1 flex flex-col items-end gap-4">
          <app-button label="Volver a Inventario" variant="light" (click)="goBack()" />
          <app-button label="Generar Solicitud" variant="light" (click)="submitRequest()" />
        </div>

      </div>
    </main>
  `
})
export class ReviewRequestComponent {
  selected = [
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
    { nombre: 'Producto 1', cantidad: 2 },
    { nombre: 'Producto 2', cantidad: 1 },
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  goBack() {
    this.router.navigate(['/removals/request']);
  }

  submitRequest() {
    this.toastr.success('Solicitud generada correctamente');
    this.router.navigate(['/home']);
  }

  increase(product: any) {
    product.cantidad++;
  }

  decrease(product: any) {
    if (product.cantidad > 1) product.cantidad--;
  }
}
