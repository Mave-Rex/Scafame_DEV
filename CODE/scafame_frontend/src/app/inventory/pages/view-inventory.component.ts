import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductTableComponent } from '../../shared/components/table/product-table.component';

import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { Unit } from '../../services/unit.service';

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

          <app-product-table
            [productos]="productos"
            [categorias]="categorias"
            [showAddButton]="false"
            [showUnit]="true" 
            (verDetalles)="handleVerDetalles($event)"
            (agregar)="handleAgregar($event)"
            (remover)="handleRemover($event)"
          ></app-product-table>

          <div class="w-full mt-4 md:-mt-9 md:px-100 flex justify-center md:justify-end">
            <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
          </div>
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

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getAll().subscribe((products) => {
      this.productos = products.map((p) => ({
        nombre: p.name,
        stock: p.stock,
        categoria: p.productCategory?.name ?? '',
        unidad: (p.unit?.abbreviation || p.unit?.name) ?? '',
        imagen: normalizeImage(p.imageUrl),
      }));
    });

    this.categoryService.getAll().subscribe((categories: Category[]) => {
      this.categorias = categories.map((c) => c.name);
    });
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
