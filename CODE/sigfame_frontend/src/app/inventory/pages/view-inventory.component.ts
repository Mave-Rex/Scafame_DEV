import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProductTableComponent } from '../../shared/components/table/product-table.component';

import { ProductService, Product } from '../../services/product.service';
import { AreaService, Area } from '../../services/area.service';
import { CategoryService, Category } from '../../services/category.service';

@Component({
  selector: 'app-view-inventory',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ProductTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="flex-1 bg-white p-8 font-display overflow-hidden">
      <div class="max-w-[1100px] mx-auto relative h-full flex flex-col justify-center">

        <!-- Contenido centrado -->
        <div class="flex flex-col items-center text-center">

          <!-- Título -->
          <h1 class="text-4xl font-bold text-black mb-6 mt-2">
            Inventario
          </h1>

          <!-- Tabla centrada -->
          <app-product-table
            [productos]="productos"
            [areas]="areas"
            [categorias]="categorias"
            (verDetalles)="handleVerDetalles($event)"
            (agregar)="handleAgregar($event)"
          ></app-product-table>

          <!-- Botón al final a la derecha -->
          <div class="flex justify-end w-full -mt-9 px-100">
            <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
          </div>

        </div>
      </div>
    </main>
  `
})
export class ViewInventoryComponent implements OnInit {
  productos: { nombre: string; stock: number }[] = [];
  areas: string[] = [];
  categorias: string[] = [];

  constructor(
    private productService: ProductService,
    private areaService: AreaService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.productService.getAll().subscribe((products: Product[]) => {
      this.productos = products.map((p) => ({
        nombre: p.name,
        stock: p.stock
      }));
    });

    this.areaService.getAll().subscribe((areas: Area[]) => {
      this.areas = areas.map((a) => a.name);
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

  goBack(): void {
    history.back();
  }
}
