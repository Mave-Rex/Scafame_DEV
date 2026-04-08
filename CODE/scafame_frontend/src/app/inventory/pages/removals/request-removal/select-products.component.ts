import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ProductTableComponent } from '../../../../shared/components/table/product-table.component';
import { ToastrService } from 'ngx-toastr';

import { ProductService, Product } from '../../../../services/product.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { WithdrawalService } from '../../../../services/withdrawal.service';
import { AuthService } from '../../../../auth/auth.service';

import { normalizeImage } from '../../../../shared/utils/url.util';

@Component({
  selector: 'app-select-products',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ProductTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<main class="flex-1 bg-white p-8 font-display overflow-hidden">
  <div class="max-w-[1100px] mx-auto relative h-full flex flex-col justify-center">
    <div class="flex flex-col items-center text-center">
      <h1 class="text-4xl font-bold text-black mb-6 mt-2">Seleccionar productos</h1>

      <div
        class="w-full mb-4 sticky top-2 z-30 bg-white/95 backdrop-blur-sm rounded-xl py-2 flex flex-col sm:flex-row gap-3 items-center sm:justify-end"
      >
        <div
          *ngIf="selectedIds.length > 0"
          class="sm:mr-auto flex items-center bg-black text-white px-3 py-2 rounded-md shadow-md"
          role="status"
          [attr.aria-label]="'Retiros: ' + selectedIds.length"
          [attr.title]="'Retiros: ' + selectedIds.length"
        >
          <div class="relative flex items-center">
            <iconify-icon icon="mdi:package-variant-minus" width="22" height="22"></iconify-icon>
            <span class="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-semibold rounded-full bg-white text-black">
              {{ selectedIds.length }}
            </span>
          </div>
        </div>

        <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
        <app-button
          label="Ver pedido"
          variant="light"
          [disabled]="selectedIds.length === 0"
          (click)="goToReview()"
        ></app-button>
      </div>

      <app-product-table
        [productos]="productosMarcados"
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
      <h2 class="text-xl font-bold mb-4">¿Deseas salir sin completar la solicitud?</h2>
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
export class SelectProductsComponent implements OnInit {
  productos: {
    id: number;
    nombre: string;
    stock: number;
    categoria: string;           // <- string obligatorio
    imagen?: string;
  }[] = [];

  // categorías como lista de nombres (sin área)
  categorias: string[] = [];

  selectedIds: number[] = [];
  showExitModal = false;
  role: string | null = null;

  private toastRef: any;

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private withdrawalService: WithdrawalService,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Obtener rol
    this.authService.getPerfilUsuario().subscribe({
      next: (user) => {
        this.role = (user.role || '').toLowerCase().trim();
      },
      error: () => {
        this.role = null;
      }
    });

    // Restaurar selección previa
    const seleccionados = this.withdrawalService.getSelected();
    this.selectedIds = seleccionados.map(p => p.id);

    // Productos (sin área)
    this.productService.getAll({ inStock: true }).subscribe((products: Product[]) => {
      this.productos = products.map(p => ({
        id: p.id,
        nombre: p.name,
        stock: p.stock,
        categoria: p.productCategory?.name ?? '',
        unidad: (p.unit?.abbreviation || p.unit?.name) ?? '',
        imagen: normalizeImage(p.imageUrl) || undefined
      }));
    });

    // Categorías (lista de nombres)
    this.categoryService.getAll().subscribe((categories: Category[]) => {
      this.categorias = categories.map(c => c.name);
    });
  }

  private showSelectToast(total: number) {
    if (this.toastRef) this.toastr.remove(this.toastRef.toastId);
    this.toastRef = this.toastr.info(`Producto seleccionado: ${total}`, '', {
      positionClass: 'toast-bottom-right',
      timeOut: 1200,
      closeButton: false,
      tapToDismiss: true,
    });
  }

  get productosMarcados() {
    return this.productos.map(p => ({
      ...p,
      selected: this.selectedIds.includes(p.id)
    }));
  }

  onDetails(producto: any) {
    console.log('Ver detalles:', producto);
  }

  onToggleSelect(producto: any) {
    const exists = this.selectedIds.includes(producto.id);
    if (exists) {
      this.onRemove(producto);
      return;
    }
    this.onAdd(producto);
  }

  onAdd(producto: any) {
    this.withdrawalService.addProduct({
      id: producto.id,
      nombre: producto.nombre,
      stock: producto.stock,
      imagen: producto.imagen
    });

    if (!this.selectedIds.includes(producto.id)) {
      this.selectedIds.push(producto.id);
    }

    // Total: intenta con 'cantidad' del servicio; si no, usa items distintos
    const sel = this.withdrawalService.getSelected?.() ?? [];
    const total = Array.isArray(sel) && sel.length > 0
      ? sel.reduce((acc: number, p: any) => acc + (p?.cantidad ?? 1), 0)
      : this.selectedIds.length;

    this.showSelectToast(total);
  }

  onRemove(producto: any) {
    this.withdrawalService.removeProduct(producto.id);
    this.selectedIds = this.selectedIds.filter(id => id !== producto.id);
  }

  goBack() {
    if (this.selectedIds.length > 0) {
      this.showExitModal = true;
    } else {
      const destino = (this.role === 'admin') ? '/removals' : '/home';
      this.router.navigate([destino]);
    }
  }

  confirmExit() {
    this.withdrawalService.clear();
    const destino = (this.role === 'admin' || this.role === 'manager') ? '/removals' : '/home';
    this.router.navigate([destino]);
  }

  cancelExit() {
    this.showExitModal = false;
  }

  goToReview() {
    if (this.selectedIds.length === 0) {
      this.toastr.warning('Debes seleccionar al menos un producto');
      return;
    }
    this.router.navigate(['/removals/request/review']);
  }
}
