import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductTableComponent } from '../../shared/components/table/product-table.component';

import { ProductService, ProductsPage } from '../../services/product.service';
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

          <div class="w-full mb-4 border border-gray-200 rounded-lg bg-white px-3 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-sm text-black">
              Mostrando página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} productos)
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1 rounded border border-black disabled:opacity-40"
                [disabled]="currentPage <= 1"
                (click)="goToPage(currentPage - 1)">
                Anterior
              </button>
              <button
                class="px-3 py-1 rounded border border-black disabled:opacity-40"
                [disabled]="currentPage >= totalPages"
                (click)="goToPage(currentPage + 1)">
                Siguiente
              </button>
              <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
            </div>
          </div>

          <app-product-table
            [productos]="productos"
            [categorias]="categorias"
            [showAddButton]="false"
            [showUnit]="true" 
            (verDetalles)="handleVerDetalles($event)"
            (agregar)="handleAgregar($event)"
            (remover)="handleRemover($event)"
          ></app-product-table>
        </div>
      </div>
    </main>
  `
})
export class ViewInventoryComponent implements OnInit {
  productos: {
    nombre: string;
    stock: number;
    categoria: string;           
    unidad?: string; 
    imagen?: string | null;
  }[] = [];
  categorias: string[] = [];
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  totalItems = 0;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadData(this.currentPage);
  }

  loadData(page: number): void {
    this.productService.getPage(page, this.pageSize).subscribe((resp: ProductsPage) => {
      this.productos = resp.items.map((p) => ({
        nombre: p.name,
        stock: p.stock,
        categoria: p.productCategory?.name ?? '',
        unidad: (p.unit?.abbreviation || p.unit?.name) ?? '',
        imagen: normalizeImage(p.imageUrl),
      }));

      this.currentPage = resp.page;
      this.totalPages = resp.totalPages;
      this.totalItems = resp.total;
    });
  }

  loadCategorias(): void {
    this.categoryService.getAll().subscribe((categories: Category[]) => {
      this.categorias = categories.map((c) => c.name);
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadData(page);
  }

  handleVerDetalles(producto: any): void {
    console.log('Ver detalles de:', producto);
  }

  handleAgregar(producto: any): void {
    console.log('Agregar producto:', producto);
  }

  handleRemover(producto: any): void {
    console.log('Quitar producto:', producto);
  }

  goBack(): void {
    history.back();
  }
}
