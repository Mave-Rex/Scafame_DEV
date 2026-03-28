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
  imports: [CommonModule, ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="p-6 sm:p-8 min-h-[calc(100vh-120px)]">
      <div class="max-w-6xl mx-auto">

        <!-- HEADER (no se monta con el logo) -->
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
                <!-- Si tu app-button NO propaga (click), cambia a (clicked) -->
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

        <!-- KPIs -->
        <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Productos</h3>
              <iconify-icon icon="mdi:package-variant" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ totalProducts }}</p>
            <p class="text-white/70 mt-2">Ítems registrados</p>
          </div>

          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Unidades en stock</h3>
              <iconify-icon icon="mdi:warehouse" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ totalUnits }}</p>
            <p class="text-white/70 mt-2">Suma total del inventario</p>
          </div>

          <div class="rounded-2xl bg-black text-white p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Bajo stock</h3>
              <iconify-icon icon="mdi:alert" class="text-3xl"></iconify-icon>
            </div>
            <p class="text-4xl font-bold mt-4">{{ lowStockCount }}</p>
            <p class="text-white/70 mt-2">Stock ≤ mínimo</p>
          </div>
        </section>

        <!-- CHART -->
        <section class="rounded-2xl bg-white border border-black/10 p-6">
          <div class="flex items-center justify-between gap-4 mb-4">
            <h2 class="text-2xl font-bold text-black">Stock por categoría (Top 10)</h2>
            <span class="text-sm text-black/60">Barras</span>
          </div>

          <!-- overflow-x-auto para labels largos -->
          <div class="h-[420px] overflow-x-auto">
            <canvas #chartCanvas class="min-w-[900px]"></canvas>
          </div>

          <p class="text-sm text-black/60 mt-4">
            *Se muestra el Top 10 de categorías por stock total para mantener el gráfico legible.
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

        this.totalProducts = this.products.length;
        this.totalUnits = this.inv.totalUnits(this.products);
        this.lowStockCount = this.inv.countLowStock(this.products);

        const top = this.inv.buildCategoryStock(this.products);
        const labels = top.map(([cat]) => cat);
        const values = top.map(([, v]) => v);

        this.renderChart(labels, values);
      },
      error: (err) => console.error('Error cargando inventario:', err),
    });
  }

  private renderChart(labels: string[], values: number[]): void {
    this.chart?.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Stock total', data: values }],
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
