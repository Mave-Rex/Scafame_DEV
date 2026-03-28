import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { ToastrService } from 'ngx-toastr';

import { CategoryService, Category } from '../../../services/category.service';
import { ProductService, Product } from '../../../services/product.service';
import { UnitService, Unit } from '../../../services/unit.service';

type Elemento = {
  id: number;
  nombre: string;
  descripcion: string;
  abreviacion?: string | null; // solo para Unidad
};

type SortKey = 'nombre' | 'id';

@Component({
  selector: 'app-eliminar-formulario',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
<main class="font-display">
  <div class="bg-black text-white rounded-2xl p-4 sm:p-5 w-full max-w-[960px] mx-auto shadow-[0_6px_0_#000]">

    <!-- BUSCADOR (compacto) -->
    <div class="flex items-center border border-black rounded-full px-3 py-2 w-full max-w-md mx-auto mb-3 bg-white">
      <iconify-icon icon="mdi:magnify" class="text-black text-lg mr-2"></iconify-icon>
      <input
        [(ngModel)]="searchQuery"
        (ngModelChange)="onSearchChange($event)"
        type="text"
        placeholder="Buscar por nombre…"
        class="w-full bg-transparent outline-none text-black text-sm"
        autocomplete="off"
      />
      <button *ngIf="searchQuery" class="text-black/70 text-xs ml-2 underline hover:opacity-80" (click)="clearSearch()">
        Limpiar
      </button>
    </div>

    <!-- CAJA TABLA (sin controles superiores) -->
    <section class="rounded-xl border-4 border-white/10 bg-white text-black shadow-lg">
      <div class="p-3">

        <!-- Tabla compacta con scroll interno y layout fijo -->
        <div class="rounded-lg border border-black/10 overflow-auto max-h-[48vh] sm:max-h-[54vh] lg:max-h-[60vh]">
          <table class="min-w-full table-fixed">
            <thead class="bg-gray-100 sticky top-0 z-10 text-xs">
              <tr class="text-left">
                <th class="px-3 py-2 w-20">
                  <button class="inline-flex items-center gap-1 font-semibold" (click)="sortBy('id')">
                    ID
                    <iconify-icon *ngIf="sort.key==='id'" [icon]="sort.dir==='asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"></iconify-icon>
                  </button>
                </th>
                <th class="px-3 py-2">
                  <button class="inline-flex items-center gap-1 font-semibold" (click)="sortBy('nombre')">
                    Nombre
                    <iconify-icon *ngIf="sort.key==='nombre'" [icon]="sort.dir==='asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'"></iconify-icon>
                  </button>
                </th>
                <th class="px-3 py-2 w-20" *ngIf="tipo==='Unidad'">Abrev.</th>
                <th class="px-3 py-2 hidden md:table-cell w-1/2">Descripción</th>
                <th class="px-3 py-2 w-28 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody class="text-sm">
              <tr *ngFor="let item of paged" class="border-t hover:bg-gray-50">
                <td class="px-3 py-2 font-mono text-xs sm:text-sm">{{ item.id }}</td>

                <td class="px-3 py-2 font-semibold break-words">
                  <div class="truncate" [title]="item.nombre">{{ item.nombre }}</div>
                </td>

                <td class="px-3 py-2" *ngIf="tipo==='Unidad'">
                  <span *ngIf="item.abreviacion" class="inline-block px-2 py-0.5 rounded-full bg-black text-white text-[10px] sm:text-xs">
                    {{ item.abreviacion }}
                  </span>
                  <span class="text-gray-400 text-xs" *ngIf="!item.abreviacion">—</span>
                </td>

                <td class="px-3 py-2 hidden md:table-cell">
                  <div class="truncate text-gray-700" [title]="item.descripcion || '—'">
                    {{ item.descripcion || '—' }}
                  </div>
                </td>

                <td class="px-3 py-2">
                  <div class="flex justify-center">
                    <app-button
                      variant="light"
                      [label]="'Eliminar'"
                      (click)="openConfirm(item)"
                    ></app-button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="paged.length === 0">
                <td class="px-3 py-6 text-center text-gray-600 text-sm" colspan="5">
                  No hay elementos para mostrar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINACIÓN mínima -->
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3">
          <span class="text-[11px] sm:text-xs text-gray-600">
            Mostrando {{ startIndex + 1 }}–{{ endIndex }} de {{ totalItems }}
            <ng-container *ngIf="searchQuery"> para “{{ searchQuery }}”</ng-container>
          </span>

          <div class="flex items-center gap-2">
            <button class="px-3 py-1 rounded border text-sm disabled:opacity-50" (click)="prevPage()" [disabled]="page === 1">Anterior</button>
            <span class="text-sm">Página {{ page }} / {{ totalPages }}</span>
            <button class="px-3 py-1 rounded border text-sm disabled:opacity-50" (click)="nextPage()" [disabled]="page === totalPages">Siguiente</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</main>

<!-- MODAL CONFIRMACIÓN -->
<div *ngIf="modalAbierto" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
  <div class="bg-white text-black rounded-2xl w-full max-w-sm sm:max-w-md p-5 text-center shadow-lg">
    <h3 class="text-lg sm:text-xl font-bold mb-2">¿Eliminar {{ tipo }}?</h3>
    <p class="text-xs sm:text-sm mb-4">Esta acción no se puede deshacer.</p>
    <p class="font-semibold mb-6">
      {{ itemAEliminar?.nombre }}
      <span *ngIf="tipo==='Unidad' && itemAEliminar?.abreviacion" class="opacity-70">
        ({{ itemAEliminar?.abreviacion }})
      </span>
    </p>

    <div class="flex justify-center gap-3 flex-wrap">
      <app-button variant="light" label="Cancelar" (click)="cerrarModal()"></app-button>
      <app-button
        variant="light"
        [label]="isDeleting ? 'Eliminando…' : 'Confirmar'"
        [disabled]="isDeleting"
        (click)="eliminarElemento()"
      ></app-button>
    </div>
  </div>
</div>
`
})
export class EliminarFormularioComponent implements OnInit, OnDestroy {
  @Input() tipo: 'Categoría' | 'Producto' | 'Unidad' | string = 'Elemento';

  // Datos
  datos: Elemento[] = [];
  filtered: Elemento[] = [];
  paged: Elemento[] = [];

  // UI / búsqueda / orden / paginación
  searchQuery = '';
  private searchDebounce?: any;
  sort: { key: SortKey; dir: 'asc' | 'desc' } = { key: 'nombre', dir: 'asc' };
  page = 1;
  pageSize = 8; // se reajusta en ngOnInit según pantalla

  // Modal
  modalAbierto = false;
  itemAEliminar: Elemento | null = null;
  isDeleting = false;

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private unitService: UnitService
  ) {}

  ngOnInit(): void {
    // PageSize responsive sin controles superiores
    try {
      if (window.matchMedia('(max-width: 480px)').matches) this.pageSize = 4;
      else if (window.matchMedia('(max-width: 768px)').matches) this.pageSize = 6;
      else this.pageSize = 8;
    } catch { /* SSR safe */ }
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
  }

  // ---------- CARGA ----------
  cargarDatos() {
    if (this.tipo === 'Categoría') {
      this.categoryService.getAll().subscribe({
        next: (data: Category[]) => {
          this.datos = data.map(c => ({ id: c.id, nombre: c.name, descripcion: c.description || '' }));
          this.resetView();
        },
        error: () => this.toastr.error('No se pudieron cargar las categorías')
      }); return;
    }

    if (this.tipo === 'Producto') {
      this.productService.getAll().subscribe({
        next: (data: Product[]) => {
          this.datos = data.map(p => ({ id: p.id, nombre: p.name, descripcion: p.description || '' }));
          this.resetView();
        },
        error: () => this.toastr.error('No se pudieron cargar los productos')
      }); return;
    }

    if (this.tipo === 'Unidad') {
      this.unitService.getAll().subscribe({
        next: (data: Unit[]) => {
          this.datos = data.map(u => ({
            id: u.id, nombre: u.name, descripcion: u.description || '', abreviacion: u.abbreviation ?? null
          }));
          this.resetView();
        },
        error: () => this.toastr.error('No se pudieron cargar las unidades')
      }); return;
    }

    this.datos = [];
    this.resetView();
    this.toastr.info('Este formulario soporta Categoría, Producto o Unidad.', 'Aviso');
  }

  // ---------- BÚSQUEDA / ORDEN / PÁGINA ----------
  onSearchChange(_v: string) {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.page = 1;
      this.applyFilterSortPage();
    }, 200);
  }

  clearSearch() {
    this.searchQuery = '';
    this.page = 1;
    this.applyFilterSortPage();
  }

  sortBy(key: SortKey) {
    if (this.sort.key === key) this.sort.dir = this.sort.dir === 'asc' ? 'desc' : 'asc';
    else this.sort = { key, dir: 'asc' };
    this.applyFilterSortPage();
  }

  goToPage(p: number) {
    this.page = Math.min(Math.max(1, p), this.totalPages || 1);
    this.paginate();
  }
  prevPage() { this.goToPage(this.page - 1); }
  nextPage() { this.goToPage(this.page + 1); }

  private resetView() {
    this.page = 1;
    this.applyFilterSortPage();
  }

  private applyFilterSortPage() {
    const q = this.searchQuery.trim().toLowerCase();

    // Filtrar
    this.filtered = this.datos.filter(item => {
      const matchNombre = item.nombre.toLowerCase().includes(q);
      const matchAbbr = (this.tipo === 'Unidad') ? ((item.abreviacion || '').toLowerCase().includes(q)) : false;
      return q ? (matchNombre || matchAbbr) : true;
    });

    // Ordenar
    const { key, dir } = this.sort;
    this.filtered.sort((a, b) => {
      const av = key === 'nombre' ? a.nombre : a.id;
      const bv = key === 'nombre' ? b.nombre : b.id;
      return (av < bv ? -1 : av > bv ? 1 : 0) * (dir === 'asc' ? 1 : -1);
    });

    // Paginar
    this.paginate();
  }

  private paginate() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paged = this.filtered.slice(start, end);
  }

  // ---------- GETTERS UI ----------
  get totalItems() { return this.filtered.length; }
  get totalPages() { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }
  get startIndex() { return this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize; }
  get endIndex() { return this.totalItems === 0 ? 0 : Math.min(this.page * this.pageSize, this.totalItems); }

  // ---------- MODAL / DELETE ----------
  openConfirm(item: Elemento) {
    this.itemAEliminar = item;
    this.modalAbierto = true;
  }

  cerrarModal() {
    if (this.isDeleting) return;
    this.modalAbierto = false;
    this.itemAEliminar = null;
  }

  eliminarElemento() {
    if (!this.itemAEliminar || this.isDeleting) return;
    this.isDeleting = true;

    const id = this.itemAEliminar.id;

    if (this.tipo === 'Categoría') {
      this.categoryService.delete(id).subscribe({
        next: () => this.afterDeleteOk(id, 'Categoría eliminada correctamente'),
        error: () => this.afterDeleteError('Error al eliminar la categoría')
      }); return;
    }

    if (this.tipo === 'Producto') {
      this.productService.delete(id).subscribe({
        next: () => this.afterDeleteOk(id, 'Producto eliminado correctamente'),
        error: () => this.afterDeleteError('Error al eliminar el producto')
      }); return;
    }

    if (this.tipo === 'Unidad') {
      this.unitService.delete(id).subscribe({
        next: () => this.afterDeleteOk(id, 'Unidad eliminada correctamente'),
        error: (err) => this.afterDeleteError(err?.error?.message || 'Error al eliminar la unidad')
      }); return;
    }

    this.afterDeleteError('Tipo no soportado');
  }

  private afterDeleteOk(id: number, msg: string) {
    this.toastr.success(msg);
    this.datos = this.datos.filter(i => i.id !== id);
    this.cerrarModal();
    this.isDeleting = false;
    this.applyFilterSortPage();
    if (this.paged.length === 0 && this.page > 1) this.goToPage(this.page - 1);
  }

  private afterDeleteError(msg: string) {
    this.toastr.error(msg);
    this.isDeleting = false;
    this.cerrarModal();
  }
}
