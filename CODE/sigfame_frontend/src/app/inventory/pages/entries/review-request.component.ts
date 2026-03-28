import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { SelectedProductTableComponent } from '../../../shared/components/table/selected-product-table.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-review-request',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SelectedProductTableComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[1100px] w-full mx-auto relative flex flex-col justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Realizar Ingresso</h1>

        <!-- Tabla de productos seleccionados -->
        <app-selected-product-table
          [productos]="selected"
          (incrementar)="increase($event)"
          (decrementar)="decrease($event)"
        ></app-selected-product-table>

        <!-- Botones flotantes alineados a la derecha -->
        <div class="absolute -right-8 bottom-1 flex flex-col items-end gap-4">
          <app-button label="Volver a Inventario" variant="light" (click)="goBack()" />
          <app-button label="Generar Solicitud" variant="light" (click)="submitEntry()" />
        </div>

      </div>
    </main>
  `
})
export class ReviewEntryComponent {
  selected = [
    { nombre: 'Producto 1', cantidad: 5 },
    { nombre: 'Producto 2', cantidad: 2 },
    { nombre: 'Producto 3', cantidad: 3 },
    { nombre: 'Producto 4', cantidad: 1 },
    { nombre: 'Producto 5', cantidad: 4 },
    { nombre: 'Producto 6', cantidad: 2 },
    { nombre: 'Producto 7', cantidad: 6 },
    { nombre: 'Producto 8', cantidad: 1 },
    { nombre: 'Producto 9', cantidad: 3 },
    { nombre: 'Producto 10', cantidad: 2 },
    { nombre: 'Producto 11', cantidad: 5 },
    { nombre: 'Producto 12', cantidad: 4 },
    { nombre: 'Producto 13', cantidad: 2 },
    { nombre: 'Producto 14', cantidad: 1 },
    { nombre: 'Producto 15', cantidad: 3 },
    { nombre: 'Producto 16', cantidad: 2 }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  goBack() {
    this.router.navigate(['/entries/request']);
  }

  submitEntry() {
    this.toastr.success('Ingreso registrado correctamente');
    this.router.navigate(['/home']);
  }

  increase(product: any) {
    product.cantidad++;
  }

  decrease(product: any) {
    if (product.cantidad > 1) product.cantidad--;
  }
}
