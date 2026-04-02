import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InventoryReportService, ProductDto } from '../../../services/inventory-report.service';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="p-6 sm:p-8 min-h-[calc(100vh-120px)]">
      <div class="max-w-6xl mx-auto">

        <!-- HEADER -->
        <header class="mb-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">

            <!-- Título -->
            <div class="lg:col-span-2">
              <h1 class="text-4xl sm:text-5xl font-bold text-black">
                Dashboard de Inventario
              </h1>
              <p class="text-black/60 mt-2">
                Resumen rápido del stock y alertas.
              </p>
            </div>

            <!-- Logo + Botones -->
            <div class="flex flex-col items-end gap-3">
              <img
                src="/Logo-BN.png"
                alt="FAME"
                class="h-10 w-auto object-contain"
              />

              <div class="flex flex-wrap justify-end gap-3">
                <app-button
                  label="Descargar reporte (Excel)"
                  variant="light"
                  (click)="downloadReport()"
                ></app-button>

                <app-button
                  label="Volver"
                  variant="light"
                  (click)="goBack()"
                ></app-button>
              </div>
            </div>

          </div>
        </header>

        <!-- FILTROS DINÁMICOS -->
        <section class="mb-8 bg-white border border-black/10 rounded-2xl p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="text-xl font-bold text-black">Filtros</h2>
            <span class="text-xs sm:text-sm text-black/60">
              Activos: {{ activeFiltersCount }}
            </span>
          </div>
          <p class="text-sm text-black/60 mb-4">
            Primero selecciona una categoría para habilitar filtros avanzados.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            <!-- Filtro por Categoría -->
            <div>
              <label class="block text-sm font-semibold text-black mb-2">Categoría</label>
              <select 
                [(ngModel)]="filterCategory" 
                (ngModelChange)="onCategoryChange()"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Filtro por Nombre -->
            <div [class.opacity-60]="!hasCategorySelected">
              <label class="block text-sm font-semibold text-black mb-2">Nombre del producto</label>
              <input
                type="text"
                [(ngModel)]="filterName"
                (ngModelChange)="onFilterChange()"
                [disabled]="!hasCategorySelected"
                placeholder="Buscar por nombre"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-black/40"
              />
            </div>

            <!-- Filtro por Unidad -->
            <div [class.opacity-60]="!hasCategorySelected">
              <label class="block text-sm font-semibold text-black mb-2">Unidad</label>
              <select
                [(ngModel)]="filterUnit"
                (ngModelChange)="onFilterChange()"
                [disabled]="!hasCategorySelected"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-black/40"
              >
                <option value="">Todas</option>
                <option *ngFor="let unit of units" [value]="unit">{{ unit }}</option>
              </select>
            </div>

            <!-- Filtro por Rango de Stock -->
            <div [class.opacity-60]="!hasCategorySelected">
              <label class="block text-sm font-semibold text-black mb-2">Stock Mínimo</label>
              <input 
                type="number" 
                [(ngModel)]="filterMinStock"
                (ngModelChange)="onFilterChange()"
                [disabled]="!hasCategorySelected"
                placeholder="0"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-black/40"
              />
            </div>

            <!-- Filtro por Stock Máximo -->
            <div [class.opacity-60]="!hasCategorySelected">
              <label class="block text-sm font-semibold text-black mb-2">Stock Máximo</label>
              <input 
                type="number" 
                [(ngModel)]="filterMaxStock"
                (ngModelChange)="onFilterChange()"
                [disabled]="!hasCategorySelected"
                placeholder="9999"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-black/40"
              />
            </div>

            <!-- Filtro por Estado de Stock -->
            <div [class.opacity-60]="!hasCategorySelected">
              <label class="block text-sm font-semibold text-black mb-2">Estado</label>
              <select 
                [(ngModel)]="filterStockStatus" 
                (ngModelChange)="onFilterChange()"
                [disabled]="!hasCategorySelected"
                class="w-full rounded-lg border border-black/20 bg-white text-black px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-black/40"
              >
                <option value="">Todos</option>
                <option value="critical">Crítico (0 unidades)</option>
                <option value="low">Bajo (≤ mínimo)</option>
                <option value="normal">Normal</option>
                <option value="optimal">Óptimo (> 50% extra)</option>
              </select>
            </div>

          </div>

          <!-- Botón Limpiar Filtros -->
          <div class="mt-4 flex justify-end">
            <button
              (click)="clearFilters()"
              class="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm font-semibold hover:bg-gray-300"
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        <!-- KPIs (filtrados) -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Productos</h3>
              <iconify-icon icon="mdi:package-variant" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ (filteredProducts | slice:0).length }}</p>
            <p class="text-white/70 mt-2">Ítems registrados</p>
          </div>

          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Unidades en stock</h3>
              <iconify-icon icon="mdi:warehouse" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ getTotalUnits() }}</p>
            <p class="text-white/70 mt-2">Suma total (filtrado)</p>
          </div>

          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Bajo stock</h3>
              <iconify-icon icon="mdi:alert" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ getLowStockCount() }}</p>
            <p class="text-white/70 mt-2">Stock ≤ mínimo (filtrado)</p>
          </div>
        </section>

        <!-- CHART -->
        <section class="rounded-2xl bg-white border border-black/10 p-6">
          <div class="flex items-center justify-between gap-4 mb-4">
            <h2 class="text-2xl font-bold text-black">
              {{ hasCategorySelected ? ('Stock por producto - ' + filterCategory) : 'Stock por categoría' }}
            </h2>
            <span class="text-sm text-black/60">Barras</span>
          </div>

          <!-- overflow-x-auto para labels largos -->
          <div class="h-[420px] overflow-x-auto">
            <canvas #chartCanvas class="min-w-[900px]"></canvas>
          </div>

          <p class="text-sm text-black/60 mt-4">
            *{{ hasCategorySelected ? 'Se muestran productos filtrados dentro de la categoría.' : 'Vista general del stock total por categoría.' }}
          </p>
        </section>

      </div>
    </main>
  `,
})
export class InventoryDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  products: ProductDto[] = [];
  filteredProducts: ProductDto[] = [];
  categories: string[] = [];
  units: string[] = [];

  // Filtros
  filterName = '';
  filterCategory = '';
  filterUnit = '';
  filterMinStock = 0;
  filterMaxStock = 9999;
  filterStockStatus = '';

  totalProducts = 0;
  totalUnits = 0;
  lowStockCount = 0;

  constructor(
    private readonly inv: InventoryReportService,
    private readonly router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private load(): void {
    this.inv.getProducts().subscribe({
      next: (products) => {
        this.products = products ?? [];
        this.extractCategories();
        this.extractUnits();
        this.onFilterChange(); // Aplicar filtros iniciales
      },
      error: (err) => console.error('Error cargando inventario:', err),
    });
  }

  private extractCategories(): void {
    const catSet = new Set<string>();
    this.products.forEach(p => {
      if (p.productCategory?.name) {
        catSet.add(p.productCategory.name);
      }
    });
    this.categories = Array.from(catSet).sort();
  }

  private extractUnits(): void {
    const base = this.filterCategory
      ? this.products.filter((p) => p.productCategory?.name === this.filterCategory)
      : this.products;
    const unitSet = new Set<string>();
    base.forEach((p) => {
      if (p.unit?.name) {
        unitSet.add(p.unit.name);
      }
    });
    this.units = Array.from(unitSet).sort();
  }

  onCategoryChange(): void {
    this.extractUnits();
    if (!this.filterCategory) {
      this.filterName = '';
      this.filterUnit = '';
      this.filterMinStock = 0;
      this.filterMaxStock = 9999;
      this.filterStockStatus = '';
    }
    this.onFilterChange();
  }

  onFilterChange(): void {
    if (!this.filterCategory) {
      this.filteredProducts = [...this.products];
      this.totalUnits = this.inv.totalUnits(this.filteredProducts);
      this.lowStockCount = this.inv.countLowStock(this.filteredProducts);

      const topByCategory = this.inv.buildCategoryStock(this.filteredProducts);
      this.renderChart(
        topByCategory.map(([cat]) => cat),
        topByCategory.map(([, value]) => value),
      );
      return;
    }

    this.filteredProducts = this.products.filter(p => {
      if (p.productCategory?.name !== this.filterCategory) {
        return false;
      }

      if (this.filterName && !p.name?.toLowerCase().includes(this.filterName.trim().toLowerCase())) {
        return false;
      }

      if (this.filterUnit && p.unit?.name !== this.filterUnit) {
        return false;
      }

      // Filtrar por rango de stock
      const stock = p.stock || 0;
      if (stock < this.filterMinStock || stock > this.filterMaxStock) {
        return false;
      }

      // Filtrar por estado
      if (this.filterStockStatus) {
        const minStock = p.minimumStock || 0;
        switch (this.filterStockStatus) {
          case 'critical':
            if (stock !== 0) return false;
            break;
          case 'low':
            if (stock > minStock || stock === 0) return false;
            break;
          case 'normal':
            if (stock <= minStock || stock > minStock * 1.5) return false;
            break;
          case 'optimal':
            if (stock <= minStock * 1.5) return false;
            break;
        }
      }

      return true;
    });

    // Actualizar KPIs filtrados
    this.totalUnits = this.inv.totalUnits(this.filteredProducts);
    this.lowStockCount = this.inv.countLowStock(this.filteredProducts);

    const sortedProducts = [...this.filteredProducts].sort((a, b) => (b.stock || 0) - (a.stock || 0));
    this.renderChart(
      sortedProducts.map((p) => p.name || 'Sin nombre'),
      sortedProducts.map((p) => p.stock || 0),
    );
  }

  clearFilters(): void {
    this.filterName = '';
    this.filterCategory = '';
    this.filterUnit = '';
    this.filterMinStock = 0;
    this.filterMaxStock = 9999;
    this.filterStockStatus = '';
    this.onFilterChange();
  }

  get hasCategorySelected(): boolean {
    return !!this.filterCategory;
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filterCategory) count++;
    if (this.hasCategorySelected && this.filterName.trim()) count++;
    if (this.hasCategorySelected && this.filterUnit) count++;
    if (this.hasCategorySelected && this.filterMinStock !== 0) count++;
    if (this.hasCategorySelected && this.filterMaxStock !== 9999) count++;
    if (this.hasCategorySelected && this.filterStockStatus) count++;
    return count;
  }

  getTotalUnits(): number {
    return this.filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  getLowStockCount(): number {
    return this.filteredProducts.filter(p => 
      (p.stock || 0) <= (p.minimumStock || 0)
    ).length;
  }

  private renderChart(labels: string[], values: number[]): void {
    this.chart?.destroy();

    const palette = [
      '#0F766E',
      '#0891B2',
      '#2563EB',
      '#4F46E5',
      '#7C3AED',
      '#BE185D',
      '#C2410C',
      '#CA8A04',
      '#15803D',
      '#374151',
    ];
    const colors = labels.map((_, i) => palette[i % palette.length]);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Stock total',
          data: values,
          backgroundColor: colors,
          borderColor: '#111827',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
        scales: {
          y: { beginAtZero: true },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: false,
            },
          },
        },
      },
    });
  }

  downloadReport(): void {
    console.log('CLICK descargar');

    this.inv.downloadInventoryXlsx().subscribe({
      next: (blob) => {
        const file = new Blob([blob], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ReporteInventario_${this.localDateYYYYMMDD()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error descargando reporte:', err),
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  private localDateYYYYMMDD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${m}-${y}`;
  }
}
