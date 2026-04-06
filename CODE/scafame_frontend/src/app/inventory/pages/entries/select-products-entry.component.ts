import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProductTableComponent } from '../../../shared/components/table/product-table.component';

import { ProductService, Product } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { EntryService } from '../../../services/entry.service';

import { normalizeImage } from '../../../shared/utils/url.util';

@Component({
  selector: 'app-select-products-entry',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ProductTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<main class="flex-1 bg-white p-6 md:p-8 font-display overflow-x-hidden overflow-y-auto">
  <div class="max-w-[1100px] mx-auto relative min-h-full flex flex-col justify-start">
    <div class="flex flex-col items-center text-center">
      <h1 class="text-4xl font-bold text-black mb-6 mt-2">Realizar ingresos</h1>

      <!-- Botonera superior fija mientras haces scroll -->
      <div
        class="w-full mb-4 sticky top-2 z-30 bg-white/95 backdrop-blur-sm rounded-xl py-2 flex flex-col sm:flex-row gap-3 items-center sm:justify-end"
      >
        <div
          *ngIf="selectedProducts.length > 0"
          class="sm:mr-auto flex items-center bg-black text-white px-3 py-2 rounded-md shadow-md"
          role="status"
          [attr.aria-label]="'Ingresos: ' + selectedProducts.length"
          [attr.title]="'Ingresos: ' + selectedProducts.length"
        >
          <div class="relative flex items-center">
            <iconify-icon icon="mdi:package-variant-plus" width="22" height="22"></iconify-icon>
            <span class="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-semibold rounded-full bg-white text-black">
              {{ selectedProducts.length }}
            </span>
          </div>
        </div>

        <app-button label="Volver" variant="light" (click)="onGoBack()"></app-button>
        <app-button
          label="Ver ingreso"
          variant="light"
          [disabled]="selectedProducts.length === 0"
          (click)="goToReview()"
        ></app-button>
      </div>

      <app-product-table
        [productos]="productos"
        [categorias]="categorias"
        [showAddButton]="true"
        [modoIngreso]="true"
        (verDetalles)="onDetails($event)"
        (seleccionar)="onToggleSelect($event)"
        (agregar)="onAdd($event)"
        (remover)="onRemove($event)"
      ></app-product-table>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <div
    *ngIf="showExitModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white text-black p-6 rounded-lg max-w-sm w-full text-center">
      <h2 class="text-xl font-bold mb-4">¿Deseas salir sin completar el ingreso?</h2>
      <p class="mb-4">Los productos seleccionados se perderán.</p>
      <div class="flex justify-center gap-4">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          (click)="confirmExit()"
        >
          Sí, salir
        </button>
        <button
          class="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          (click)="cancelExit()"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</main>
  `
})
export class SelectProductsEntryComponent implements OnInit {
  productos: {
    id: number;
    nombre: string;
    stock: number;
    categoria: string;
    unidad?: string; 
    imagen?: string | null;
    selected?: boolean;
  }[] = [];

  // Lista de nombres de categorías (sin área)
  categorias: string[] = [];

  selectedProducts: {
    id: number;
    nombre: string;
    cantidad: number;
    unidad?: string; 
    imagen?: string | null;
  }[] = [];

  totalIngresos = 0;
  showExitModal = false;

  private toastRef: any;

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private entryService: EntryService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.selectedProducts = this.entryService.getSelectedProducts();

    // Productos sin "área"
    this.productService.getAll().subscribe((products: Product[]) => {
      this.productos = products.map(p => {
        const imagen = normalizeImage(p.imageUrl);
        const isSelected = this.selectedProducts.some(sp => sp.id === p.id);
        const categoria = p.productCategory?.name ?? '';
        const unidad = (p.unit?.abbreviation || p.unit?.name) ?? '';
        return {
          id: p.id,
          nombre: p.name,
          stock: p.stock,
          categoria,
          unidad,
          imagen,
          selected: isSelected
        };
      });

      this.totalIngresos = this.selectedProducts.reduce((sum, p) => sum + p.cantidad, 0);
    });

    // Categorías sin "área"
    this.categoryService.getAll().subscribe((categories: Category[]) => {
      this.categorias = categories.map(c => c.name);
    });
  }

  onDetails(producto: any) {
    console.log('Ver detalles:', producto);
  }

  onAdd(producto: any) {
    const existing = this.selectedProducts.find(p => p.id === producto.id);
    if (existing) {
      existing.cantidad++;
    } else {
      this.selectedProducts.push({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        unidad: producto.unidad,
        imagen: producto.imagen
      });
    }

    // Recalcular total y persistir
    this.totalIngresos = this.selectedProducts.reduce((sum, p) => sum + p.cantidad, 0);
    this.markSelected();
    this.entryService.setSelectedProducts(this.selectedProducts);

    this.showTotalToast('Producto seleccionado');
  }

  onToggleSelect(producto: any) {
    const existing = this.selectedProducts.find(p => p.id === producto.id);

    if (existing) {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== producto.id);
      this.totalIngresos -= existing.cantidad;
    } else {
      this.selectedProducts.push({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        unidad: producto.unidad,
        imagen: producto.imagen
      });
      this.totalIngresos++;
    }

    if (this.totalIngresos < 0) {
      this.totalIngresos = 0;
    }

    this.markSelected();
    this.entryService.setSelectedProducts(this.selectedProducts);
    this.showTotalToast('Total seleccionados');
  }

  private showTotalToast(actionLabel: string) {
    if (this.toastRef) this.toastr.remove(this.toastRef.toastId);
    this.toastRef = this.toastr.info(`${actionLabel}: ${this.totalIngresos}`, '', {
      positionClass: 'toast-bottom-right',
      timeOut: 1200,
      closeButton: false,
      tapToDismiss: true,
    });
  }

  onRemove(producto: any) {
    const existing = this.selectedProducts.find(p => p.id === producto.id);
    if (!existing) {
      return;
    }

    if (existing.cantidad > 1) {
      existing.cantidad--;
      this.totalIngresos--;
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== producto.id);
      this.totalIngresos--;
    }

    if (this.totalIngresos < 0) {
      this.totalIngresos = 0;
    }

    this.markSelected();
    this.entryService.setSelectedProducts(this.selectedProducts);
    this.showTotalToast('Total seleccionados');
  }

  markSelected() {
    this.productos = this.productos.map(p => ({
      ...p,
      selected: this.selectedProducts.some(sp => sp.id === p.id)
    }));
  }

  onGoBack() {
    if (this.selectedProducts.length > 0) {
      this.showExitModal = true;
    } else {
      this.router.navigate(['/home']);
    }
  }

  confirmExit() {
    this.entryService.clearSelectedProducts();
    this.router.navigate(['/home']);
  }

  cancelExit() {
    this.showExitModal = false;
  }

  goToReview() {
    if (this.selectedProducts.length === 0) {
      this.toastr.warning('Debes seleccionar al menos un producto antes de continuar');
      return;
    }

    this.router.navigate(['/entries/request/review']);
  }
}
