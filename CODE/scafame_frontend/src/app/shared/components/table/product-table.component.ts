import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  template: `
    <section class="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <!-- Barra de filtros sticky -->
      <div class="sticky top-0 z-20 bg-white border-b border-gray-200 p-3 sm:p-4">
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <!-- Buscador por nombre de producto -->
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="filtrarProductos()"
              placeholder="Buscar producto"
              class="rounded-lg text-black px-4 py-2 text-sm font-semibold w-full sm:w-[280px] border border-gray-300"
            />

            <!-- Categorías -->
            <select
              [(ngModel)]="selectedCategoria"
              (ngModelChange)="filtrarProductos()"
              class="rounded-lg text-black px-4 py-2 text-sm font-semibold border border-gray-300 min-w-[220px]"
            >
              <option value="">Todas las Categorías</option>
              <option *ngFor="let nombreCat of filteredCategorias" [value]="nombreCat">
                {{ nombreCat }}
              </option>
            </select>
          </div>

          <div class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            {{ filteredProductos.length }} producto(s)
          </div>
        </div>
      </div>

      <div class="overflow-auto max-h-[68vh]">
        <table class="w-full table-fixed text-sm text-left text-gray-800">
          <thead class="sticky top-0 z-10 bg-gray-100 border-b border-gray-200">
            <tr>
              <th *ngIf="showAddButton && modoIngreso" class="px-3 py-2 w-14 text-center align-middle whitespace-nowrap">Sel.</th>
              <th class="px-3 py-2 w-20 align-middle whitespace-nowrap">Foto</th>
              <th class="px-3 py-2 align-middle whitespace-nowrap">Nombre</th>
              <th class="px-3 py-2 align-middle whitespace-nowrap">Categoría</th>
              <th class="px-3 py-2 w-28 align-middle whitespace-nowrap">Stock</th>
              <th class="px-3 py-2 w-28 align-middle whitespace-nowrap">Unidad</th>
              <th class="px-3 py-2 w-52 text-right align-middle whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let producto of filteredProductos; trackBy: trackByProducto"
              class="border-b border-gray-100 hover:bg-gray-50"
              [class.bg-emerald-50]="!!producto.selected"
            >
              <td *ngIf="showAddButton && modoIngreso" class="px-3 py-2 text-center align-middle">
                <input
                  type="checkbox"
                  [checked]="!!producto.selected"
                  (change)="onSeleccionar(producto)"
                  aria-label="Seleccionar producto"
                />
              </td>

              <td class="px-3 py-2 align-middle">
                <div class="w-12 h-12 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                  <img
                    *ngIf="producto.imagen; else noImage"
                    [src]="producto.imagen | imageUrl"
                    [alt]="producto.nombre"
                    class="w-full h-full object-cover"
                    (error)="$any($event.target).style.display='none'; $any($event.target.parentElement).querySelector('.img-fallback')?.classList.remove('hidden')"
                  />
                  <div class="img-fallback hidden w-full h-full flex items-center justify-center text-[10px] text-gray-500">Sin img</div>
                  <ng-template #noImage>
                    <div class="w-full h-full flex items-center justify-center text-[10px] text-gray-500">Sin img</div>
                  </ng-template>
                </div>
              </td>

              <td class="px-3 py-2 align-middle font-medium">{{ producto.nombre }}</td>
              <td class="px-3 py-2 align-middle">{{ producto.categoria || 'Sin categoría' }}</td>
              <td class="px-3 py-2 align-middle">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="getStockBadgeClass(producto.stock)"
                >
                  {{ producto.stock }}
                </span>
              </td>
              <td class="px-3 py-2 align-middle">{{ producto.unidad || '—' }}</td>

              <td class="px-3 py-2 align-middle">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-100"
                    (click)="onVerDetalles(producto)"
                  >
                    Detalles
                  </button>

                  <ng-container *ngIf="showAddButton">
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                      (click)="onRemover(producto)"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      class="px-2.5 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      (click)="onAgregar(producto)"
                    >
                      +
                    </button>
                  </ng-container>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredProductos.length === 0">
              <td
                class="px-3 py-8 text-center text-gray-500"
                [attr.colspan]="showAddButton && modoIngreso ? 8 : 7"
              >
                No se encontraron productos para los filtros seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Detalles -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-lg max-w-sm w-full relative">
          <h2 class="text-xl font-bold mb-4">Detalles del Producto</h2>

          <div class="w-24 h-24 rounded-md bg-gray-100 overflow-hidden border border-gray-200 mb-4 mx-auto">
            <img
              *ngIf="selectedProduct?.imagen; else noModalImage"
              [src]="selectedProduct?.imagen | imageUrl"
              [alt]="selectedProduct?.nombre || 'Imagen del producto'"
              class="w-full h-full object-cover"
              (error)="$any($event.target).style.display='none'; $any($event.target.parentElement).querySelector('.modal-img-fallback')?.classList.remove('hidden')"
            />
            <div class="modal-img-fallback hidden w-full h-full flex items-center justify-center text-[11px] text-gray-500">Sin imagen</div>
            <ng-template #noModalImage>
              <div class="w-full h-full flex items-center justify-center text-[11px] text-gray-500">Sin imagen</div>
            </ng-template>
          </div>

          <p><strong>Nombre:</strong> {{ selectedProduct?.nombre }}</p>
          <p><strong>Categoría:</strong> {{ selectedProduct?.categoria || 'Sin categoría' }}</p>
          <p>
            <strong>Stock:</strong>
            {{ selectedProduct?.stock }}
            <span *ngIf="selectedProduct?.unidad">({{ selectedProduct?.unidad }})</span>
          </p>

          <button class="absolute top-2 right-3 text-gray-500 hover:text-black" (click)="closeModal()">✕</button>
        </div>
      </div>
    </section>
  `
})
export class ProductTableComponent implements OnChanges {
  @Input() productos: {
    nombre: string;
    stock: number;
    categoria: string;
    imagen?: string | null;
    selected?: boolean;
    unidad?: string | null;
  }[] = [];

  // categorías como lista de nombres
  @Input() categorias: string[] = [];

  @Input() showAddButton = true;
  @Input() modoIngreso = false;

  @Output() verDetalles = new EventEmitter<any>();
  @Output() agregar = new EventEmitter<any>();
  @Output() remover = new EventEmitter<any>();
  @Output() seleccionar = new EventEmitter<any>();

  // Filtros
  searchTerm = '';
  selectedCategoria = '';

  // Data filtrada
  filteredProductos: {
    nombre: string;
    stock: number;
    categoria: string;
    imagen?: string | null;
    selected?: boolean;
    unidad?: string | null;
  }[] = [];

  // lista de nombres de categoría únicos
  filteredCategorias: string[] = [];

  selectedProduct: {
    nombre: string;
    stock: number;
    categoria?: string;
    unidad?: string | null;
    imagen?: string | null;
  } | null = null;
  showModal = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productos'] || changes['categorias']) {
      this.buildCategoriasUnicas();
      this.filtrarProductos();
    }
  }

  /** Construye una lista única de nombres de categoría */
  private buildCategoriasUnicas() {
    const set = new Set<string>();

    // 1) Preferimos las categorías que llegan por input
    this.categorias.forEach((name) => {
      if (name) set.add(name);
    });

    // 2) Si no llegan por input, inferimos de los productos
    if (set.size === 0 && Array.isArray(this.productos)) {
      this.productos.forEach(p => {
        if (p?.categoria) set.add(p.categoria);
      });
    }

    this.filteredCategorias = Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  filtrarProductos(): void {
    const q = this.searchTerm.trim().toLowerCase();

    this.filteredProductos = this.productos.filter(p => {
      const matchNombre = !q || (p?.nombre ?? '').toLowerCase().includes(q);
      const matchCategoria = this.selectedCategoria === '' || p.categoria === this.selectedCategoria;
      return matchNombre && matchCategoria;
    });
  }

  onVerDetalles(producto: any) {
    this.selectedProduct = producto;
    this.showModal = true;
    this.verDetalles.emit(producto);
  }

  onAgregar(producto: any) {
    this.agregar.emit(producto);
  }

  onRemover(producto: any) {
    this.remover.emit(producto);
  }

  onSeleccionar(producto: any) {
    if (!this.showAddButton || !this.modoIngreso) {
      return;
    }
    this.seleccionar.emit(producto);
  }

  getStockBadgeClass(stock: number): string {
    if (stock <= 0) return 'bg-red-100 text-red-700';
    if (stock <= 5) return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  closeModal() {
    this.selectedProduct = null;
    this.showModal = false;
  }

  /**
   * TrackBy para *ngFor de productos
   * Evita que Angular rerendeice las filas cuando la lista se actualiza
   */
  trackByProducto(_index: number, producto: any): string {
    return producto.nombre;
  }
}
