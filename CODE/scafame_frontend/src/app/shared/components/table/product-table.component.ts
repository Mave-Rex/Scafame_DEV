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
import { ProductCardComponent } from '../card/product-card.component';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="bg-black text-white rounded-2xl w-full p-4">
      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 justify-center mb-3">
        <!-- Buscador por nombre de producto -->
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filtrarProductos()"
          placeholder="Buscar producto..."
          class="rounded-full text-black px-3 py-1 text-sm font-bold w-[220px]"
        />

        <!-- Categorías -->
        <select
          [(ngModel)]="selectedCategoria"
          (ngModelChange)="filtrarProductos()"
          class="rounded-full text-black px-3 py-1 text-sm font-bold"
        >
          <option value="">Todas las Categorías</option>
          <option *ngFor="let nombreCat of filteredCategorias" [value]="nombreCat">
            {{ nombreCat }}
          </option>
        </select>
      </div>

      <!-- Grilla scrollable -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 overflow-y-auto max-h-[360px] p-2 justify-items-center"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >

        <app-product-card
        *ngFor="let producto of filteredProductos"
        [nombre]="producto.nombre"
        [stock]="producto.stock"
        [imagen]="producto.imagen"
        [selected]="!!producto.selected"
        [mostrarAccion]="showAddButton"
        (accion)="onAgregar(producto)"
        (verDetalles)="onVerDetalles(producto)"
        (remover)="onRemover(producto)"
        [modoIngreso]="modoIngreso"

        [showUnit]="true"
        [unit]="producto.unidad"
        ></app-product-card>
      </div>

      <!-- Modal de Detalles -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-lg max-w-sm w-full relative">
          <h2 class="text-xl font-bold mb-4">Detalles del Producto</h2>
          <p><strong>Nombre:</strong> {{ selectedProduct?.nombre }}</p>
          <p>
            <strong>Stock:</strong>
            {{ selectedProduct?.stock }}
            <span *ngIf="selectedProduct?.unidad">({{ selectedProduct?.unidad }})</span>
          </p>

          <button class="absolute top-2 right-3 text-gray-500 hover:text-black" (click)="closeModal()">✕</button>
        </div>
      </div>
    </div>
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

  selectedProduct: { nombre: string; stock: number; unidad?: string | null } | null = null;
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

  closeModal() {
    this.selectedProduct = null;
    this.showModal = false;
  }
}
