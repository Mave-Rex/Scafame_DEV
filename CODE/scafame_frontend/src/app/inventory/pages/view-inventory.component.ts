import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductTableComponent } from '../../shared/components/table/product-table.component';

import { ProductService, ProductsPage, ProductFilters } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

import { normalizeImage } from '../../shared/utils/url.util';

@Component({
  selector: 'app-view-inventory',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ProductTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="flex-1 bg-white p-8 font-display overflow-hidden">
      <div class="max-w-[1100px] mx-auto relative h-full flex flex-col justify-center">
        <div class="flex flex-col items-center text-center">
          <h1 class="text-4xl font-bold text-black mb-6 mt-2">Inventario</h1>

          <div class="w-full mb-3 flex justify-end">
            <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
          </div>

          <app-product-table
            [productos]="productos"
            [categorias]="categorias"
            [showAddButton]="false"
            [externalFiltering]="true"
            [totalProductos]="totalItems"
            [showUnit]="true"
            [isLoadingMore]="isLoadingMore"
            (filtersChange)="onFiltersChange($event)"
            (scrollNearEnd)="onScrollNearEnd()"
            (verDetalles)="handleVerDetalles($event)"
            (agregar)="handleAgregar($event)"
            (remover)="handleRemover($event)"
          ></app-product-table>

          <p *ngIf="allLoaded && totalItems > 0" class="mt-3 text-xs text-gray-400">
            Todos los productos cargados ({{ totalItems }})
          </p>
        </div>
      </div>
    </main>
  `
})
export class ViewInventoryComponent implements OnInit {
  productos: {
    id: number;
    nombre: string;
    stock: number;
    categoria: string;
    unidad?: string;
    imagen?: string | null;
  }[] = [];
  categorias: string[] = [];
  private categoriesByName = new Map<string, number>();
  private currentFilters: ProductFilters = {};
  private currentPage = 1;
  private readonly pageSize = 20;
  private totalPages = 1;
  totalItems = 0;
  isLoadingMore = false;
  allLoaded = false;
  private lastRequestId = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadPage(1, true);
  }

  private loadPage(page: number, replace: boolean): void {
    if (this.isLoadingMore) return;
    this.isLoadingMore = true;
    const reqId = ++this.lastRequestId;

    this.productService.getPage(page, this.pageSize, this.currentFilters).subscribe((resp: ProductsPage) => {
      if (reqId !== this.lastRequestId) return;

      const mapped = resp.items.map((p) => ({
        id: p.id,
        nombre: p.name,
        stock: p.stock,
        categoria: p.productCategory?.name ?? '',
        unidad: (p.unit?.abbreviation || p.unit?.name) ?? '',
        imagen: normalizeImage(p.imageUrl),
      }));

      if (replace) {
        this.productos = mapped;
      } else {
        this.productos = [...this.productos, ...mapped];
      }

      this.currentPage = resp.page;
      this.totalPages = resp.totalPages;
      this.totalItems = resp.total;
      this.allLoaded = this.currentPage >= this.totalPages;
      this.isLoadingMore = false;
    });
  }

  loadCategorias(): void {
    this.categoryService.getAll().subscribe((categories: Category[]) => {
      this.categoriesByName = new Map(categories.map((c) => [c.name, c.id]));
      this.categorias = categories.map((c) => c.name);
    });
  }

  onFiltersChange(filters: { searchTerm: string; categoria: string }): void {
    const nextFilters: ProductFilters = {};

    if (filters.searchTerm) {
      nextFilters.q = filters.searchTerm;
    }

    if (filters.categoria) {
      const categoryId = this.categoriesByName.get(filters.categoria);
      if (categoryId !== undefined) {
        nextFilters.categoryId = categoryId;
      }
    }

    const changed = JSON.stringify(this.currentFilters) !== JSON.stringify(nextFilters);
    if (!changed) return;

    this.currentFilters = nextFilters;
    this.allLoaded = false;
    this.lastRequestId++;
    this.isLoadingMore = false;
    this.loadPage(1, true);
  }

  onScrollNearEnd(): void {
    if (this.isLoadingMore || this.allLoaded) return;
    this.loadPage(this.currentPage + 1, false);
  }

  handleVerDetalles(producto: any): void {}
  handleAgregar(producto: any): void {}
  handleRemover(producto: any): void {}

  goBack(): void {
    history.back();
  }
}

