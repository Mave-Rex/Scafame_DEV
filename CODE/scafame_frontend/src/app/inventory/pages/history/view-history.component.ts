import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { HistoryService } from '../../../services/history.service';
import { AuthService } from '../../../auth/auth.service';
import { ExportService, ReportFormat } from '../../../services/export.service';
import { DeliveryReportService } from '../../../services/deliveryReport.service';
import { UserService } from '../../../users/services/user.service';

@Component({
  selector: 'app-view-history',
  standalone: true,
  // 👇 Importa explícitamente las directivas para resolver -998103
  imports: [CommonModule, FormsModule, ButtonComponent, NgIf, NgFor, NgClass],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
<main class="min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 pt-0 pb-24 font-display">
  <div class="w-full max-w-screen-lg mx-auto flex flex-col">

    <!-- Título + acciones -->
    <div class="flex flex-col items-center gap-4 mt-0 mb-4">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-black text-center">
        Historial de Movimientos
      </h1>

      <div class="flex flex-wrap justify-center items-center gap-3">
        <!-- Botón Filtros -->
        <button
          type="button"
          (click)="toggleFilters()"
          class="inline-flex items-center gap-2 border border-black/20 rounded-xl px-3 py-2 text-sm bg-white hover:bg-black hover:text-white transition-colors"
          [attr.aria-expanded]="showFilters"
        >
          <iconify-icon icon="mdi:filter-variant" width="18" height="18"></iconify-icon>
          <span>Filtrar</span>
          <span *ngIf="activeFiltersCount > 0"
                class="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-semibold rounded-full bg-black text-white">
            {{ activeFiltersCount }}
          </span>
        </button>

        <select [(ngModel)]="exportFormat"
                class="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/30">
          <option value="excel">Excel (.xlsx)</option>
          <option value="pdf">PDF (.pdf)</option>
        </select>

        <app-button
          [label]="'Exportar ' + (exportFormat === 'excel' ? 'Excel' : 'PDF')"
          variant="light"
          [disabled]="historial.length === 0"
          (click)="onExport()"
        />
        <app-button
          label="Volver"
          variant="light"
          (click)="goHome()"
        />
      </div>

      <!-- Chips de filtros activos -->
      <div *ngIf="activeFiltersCount > 0"
           class="flex flex-wrap items-center justify-center gap-2 text-xs mt-1">
        <span class="text-gray-600 mr-1">Filtros activos:</span>

        <button
          *ngIf="filters.startDate || filters.endDate"
          (click)="clearDate()"
          class="group inline-flex items-center gap-1 bg-black text-white rounded-full px-3 py-1"
          title="Quitar filtro de fechas"
        >
          <iconify-icon icon="mdi:calendar-range" width="14" height="14"></iconify-icon>
          <span>{{ filters.startDate || '—' }} → {{ filters.endDate || '—' }}</span>
          <iconify-icon icon="mdi:close" class="opacity-70 group-hover:opacity-100" width="14" height="14"></iconify-icon>
        </button>

        <button
          *ngIf="filters.name"
          (click)="filters.name=''; applyFilters()"
          class="group inline-flex items-center gap-1 bg-black text-white rounded-full px-3 py-1"
          title="Quitar filtro de nombre"
        >
          <iconify-icon icon="mdi:magnify" width="14" height="14"></iconify-icon>
          <span>{{ filters.name }}</span>
          <iconify-icon icon="mdi:close" class="opacity-70 group-hover:opacity-100" width="14" height="14"></iconify-icon>
        </button>

        <button
          *ngIf="filters.area"
          (click)="filters.area=''; applyFilters()"
          class="group inline-flex items-center gap-1 bg-black text-white rounded-full px-3 py-1"
          title="Quitar filtro de área"
        >
          <iconify-icon icon="mdi:domain" width="14" height="14"></iconify-icon>
          <span>{{ filters.area }}</span>
          <iconify-icon icon="mdi:close" class="opacity-70 group-hover:opacity-100" width="14" height="14"></iconify-icon>
        </button>

        <button (click)="clearFilters()"
                class="inline-flex items-center gap-1 underline underline-offset-2 ml-1">
          Limpiar todo
        </button>
      </div>
    </div>

    <!-- Panel colapsable de filtros -->
    <section
      *ngIf="showFilters"
      class="w-full max-w-[820px] mx-auto mb-4 rounded-2xl border border-black/15 bg-white shadow-sm transition-all"
    >
      <div class="p-4 sm:p-5">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

          <!-- Fecha inicio -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold mb-1">Desde</label>
            <input
              type="date"
              [(ngModel)]="filters.startDate"
              (ngModelChange)="applyFilters()"
              class="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>

          <!-- Fecha fin -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold mb-1">Hasta</label>
            <input
              type="date"
              [(ngModel)]="filters.endDate"
              (ngModelChange)="applyFilters()"
              class="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>

          <!-- Nombre -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold mb-1">Buscar por nombre</label>
            <input
              type="text"
              [(ngModel)]="filters.name"
              (ngModelChange)="applyFilters()"
              placeholder="Producto, usuario o #ID"
              class="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/30"
            />
          </div>

          <!-- Área -->
          <div class="flex flex-col">
            <label class="text-xs font-semibold mb-1">Área</label>
            <select
              [(ngModel)]="filters.area"
              (ngModelChange)="applyFilters()"
              class="border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/30"
            >
              <option value="">Todas</option>
              <option *ngFor="let a of availableAreas" [value]="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between mt-3 text-xs">
          <span *ngIf="invalidDateRange" class="text-red-600 font-semibold">
            Rango de fechas inválido (Hasta es menor que Desde).
          </span>
          <span class="ml-auto text-gray-600">
            {{ historial.length }} resultado{{ historial.length === 1 ? '' : 's' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Caja de historial -->
    <section
      class="mt-1 mx-auto w-full max-w-[820px] rounded-2xl border-4 border-black/80 bg-black text-white shadow-[0_6px_0_#000]"
    >
      <div class="p-4 sm:p-5">
        <div
          class="flex flex-col gap-4 p-2 overflow-y-visible md:overflow-y-auto md:max-h-[360px]"
          style="scrollbar-width: thin; scrollbar-color: white black;"
        >
          <div
            *ngFor="let r of historial; trackBy: trackById"
            class="bg-white text-black rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <!-- Izquierda -->
            <div class="flex flex-col">
              <span class="font-semibold">
                {{ r.type?.toLowerCase() === 'income' ? 'Ingreso' : 'Retiro' }} #{{ r.id }}
              </span>
              <span class="text-sm text-gray-600">
                {{ r.createdAt | date: 'dd/MM/yyyy' }}
              </span>
              <span class="text-sm text-gray-700">
                <strong>Usuario:</strong>
                {{ getDisplayUserName(r) }}
                <span class="italic text-gray-500">
                  (Área: {{ getUserArea(r) }})
                </span>
              </span>
            </div>

            <!-- Derecha: estado + botones -->
            <div class="flex items-center gap-3">
              <div class="text-sm font-semibold flex items-center gap-2">
                <span
                  class="w-3 h-3 rounded-full inline-block"
                  [ngClass]="{
                    'bg-green-500': getEstado(r) === 'Aprobado',
                    'bg-red-500': getEstado(r) === 'Rechazado',
                    'bg-yellow-500': getEstado(r) === 'Pendiente'
                  }"
                ></span>
                <span>{{ getEstado(r) }}</span>
              </div>

              <div class="flex items-center gap-2">
                <app-button
                  label="Detalles"
                  variant="light"
                  (click)="goToDetails(r.id)"
                />
                <!-- Botón de Acta SOLO para retiros -->
                <app-button
                  *ngIf="r.type?.toLowerCase() !== 'income'"
                  label="Acta PDF"
                  variant="light"
                  (click)="exportActa(r, 'pdf')"
                />
              </div>
            </div>
          </div>

          <div *ngIf="historial.length === 0"
               class="bg-white/90 text-gray-700 rounded-xl p-6 text-center">
            No hay movimientos para mostrar.
          </div>
        </div>
      </div>
    </section>
  </div>
</main>
  `
})
export class ViewHistoryComponent implements OnInit {
  historial: any[] = [];
  private allHistorial: any[] = [];

  exportFormat: ReportFormat = 'excel';
  showFilters = false;

  filters = {
    startDate: '' as string,
    endDate: '' as string,
    name: '' as string,
    area: '' as string
  };

  availableAreas: string[] = [];
  invalidDateRange = false;

  constructor(
    private router: Router,
    private historyService: HistoryService,
    private authService: AuthService,
    private exportService: ExportService,
    private deliveryReport: DeliveryReportService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    const role = this.authService.getRole()?.toLowerCase();

    this.historyService.getAllReports().subscribe({
      next: (res: any[]) => {
        const statusFiltered = res.filter(r => {
        const status = r.status?.toLowerCase?.();
        const type   = r.type?.toLowerCase?.();

        return (
          status === 'approved' ||
          status === 'rejected' ||
          status === 'pending'  || // 👈 agregamos los pendientes
          type === 'income'        // ingresos auto-aprobados
        );
      });


        const base = role === 'admin'
        ? statusFiltered
        : statusFiltered.filter(r =>
            (r?.user?.id === userId) ||
            (r?.requestedBy?.id === userId)
          );


        this.allHistorial = base;
        this.availableAreas = this.buildAreas(base);
        this.applyFilters();
      },
      error: () => {
        // opcional: toast
      }
    });
  }

  toggleFilters() { this.showFilters = !this.showFilters; }

  get activeFiltersCount(): number {
    let c = 0;
    if (this.filters.startDate) c++;
    if (this.filters.endDate) c++;
    if (this.filters.name) c++;
    if (this.filters.area) c++;
    return c;
  }

  // --- Utilidades de fecha robustas ---
  private parseLocalDate(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    // "YYYY-MM-DD" -> fecha local a medianoche
    const d = new Date(dateStr + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  private endOfLocalDay(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T23:59:59.999');
    return isNaN(d.getTime()) ? null : d;
  }

  private parseCreatedAt(r: any): Date | null {
    const c = r?.createdAt ?? r?.created_at ?? null;
    if (!c) return null;
    const d = new Date(c);
    return isNaN(d.getTime()) ? null : d;
  }
  // ------------------------------------

  applyFilters(): void {
    const start = this.parseLocalDate(this.filters.startDate);
    const end   = this.endOfLocalDay(this.filters.endDate);
    this.invalidDateRange = !!(start && end && end < start);

    const q = this.filters.name.trim().toLowerCase();
    const area = this.filters.area.trim().toLowerCase();

    this.historial = this.allHistorial.filter((r) => {
      if (this.invalidDateRange) return false;

      // Fecha
      const rDate = this.parseCreatedAt(r);
      if (start && (!rDate || rDate < start)) return false;
      if (end   && (!rDate || rDate > end))   return false;

      // Área
      if (area) {
        const areas = this.extractAreasFromReport(r).map(a => a.toLowerCase());
        if (!areas.some(a => a.includes(area))) return false;
      }

      // Búsqueda por nombre / id
      if (q) {
        const haystack = this.buildSearchHaystack(r);
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    // Orden: fecha desc, luego id desc
    this.historial.sort((a, b) => {
      const da = this.parseCreatedAt(a)?.getTime() ?? -Infinity;
      const db = this.parseCreatedAt(b)?.getTime() ?? -Infinity;
      if (db !== da) return db - da;
      const ia = typeof a?.id === 'number' ? a.id : -Infinity;
      const ib = typeof b?.id === 'number' ? b.id : -Infinity;
      return ib - ia;
    });
  }

  getDisplayUserName(r: any): string {
  if (!r) return '—';
  const type = r.type?.toLowerCase?.();

  const u = type === 'outcome'
    ? (r.requestedBy || r.user || {})
    : (r.user || {});

  const first = u.firstname ?? '';
  const last  = u.lastname ?? '';
  const full  = `${first} ${last}`.trim();

  return full || u.username || '—';
}

  clearFilters(): void {
    this.filters = { startDate: '', endDate: '', name: '', area: '' };
    this.invalidDateRange = false;
    this.applyFilters();
  }

  clearDate(): void {
    this.filters.startDate = '';
    this.filters.endDate = '';
    this.invalidDateRange = false;
    this.applyFilters();
  }

  private buildSearchHaystack(r: any): string {
  const parts: string[] = [];
  if (r?.id != null) parts.push(String(r.id));

  // Nombre del usuario (responsable / aprobador)
  const first = r?.user?.firstname ?? '';
  const last  = r?.user?.lastname ?? '';
  const userFull = `${first} ${last}`.trim();
  if (userFull) parts.push(userFull);

  // Nombre del solicitante (requestedBy)
  const rf = r?.requestedBy?.firstname ?? '';
  const rl = r?.requestedBy?.lastname ?? '';
  const reqFull = `${rf} ${rl}`.trim();
  if (reqFull) parts.push(reqFull);

  const productNames = this.extractProductNames(r);
  parts.push(...productNames);

  return parts.join(' ').toLowerCase();
}

  private extractProductNames(r: any): string[] {
    const names = new Set<string>();

    // ProductReports / productReports
    const prArray = Array.isArray(r?.ProductReports) ? r.ProductReports :
                    Array.isArray(r?.productReports) ? r.productReports : [];
    prArray.forEach((pr: any) => {
      const n = pr?.product?.name ?? pr?.product?.nombre ?? pr?.name ?? pr?.nombre;
      if (n) names.add(String(n));
    });

    // products
    if (Array.isArray(r?.products)) {
      r.products.forEach((p: any) => {
        const n = p?.product?.name ?? p?.name ?? p?.nombre;
        if (n) names.add(String(n));
      });
    }

    // items
    if (Array.isArray(r?.items)) {
      r.items.forEach((it: any) => {
        const n = it?.product?.name ?? it?.name ?? it?.nombre;
        if (n) names.add(String(n));
      });
    }

    return Array.from(names);
  }

  private buildAreas(data: any[]): string[] {
    const set = new Set<string>();
    data.forEach(r => this.extractAreasFromReport(r).forEach(a => set.add(a)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  private extractAreasFromReport(r: any): string[] {
    const areas = new Set<string>();

    const direct = r?.area?.name ?? r?.area?.nombre ?? r?.area;
    if (direct) areas.add(String(direct));

    // ProductReports / productReports
    const prArray = Array.isArray(r?.ProductReports) ? r.ProductReports :
                    Array.isArray(r?.productReports) ? r.productReports : [];
    prArray.forEach((pr: any) => {
      const a =
        pr?.product?.productCategory?.area?.name ??
        pr?.product?.category?.area?.name ??
        pr?.product?.productCategory?.area?.nombre ??
        pr?.product?.category?.area?.nombre ??
        pr?.area?.name ??
        pr?.area?.nombre;
      if (a) areas.add(String(a));
    });

    const tryArray = (arr: any[] | undefined) => {
      (arr ?? []).forEach((x: any) => {
        const a =
          x?.product?.productCategory?.area?.name ??
          x?.product?.category?.area?.name ??
          x?.productCategory?.area?.name ??
          x?.category?.area?.name ??
          x?.product?.productCategory?.area?.nombre ??
          x?.product?.category?.area?.nombre ??
          x?.productCategory?.area?.nombre ??
          x?.category?.area?.nombre ??
          x?.area?.name ?? x?.area?.nombre;
        if (a) areas.add(String(a));
      });
    };

    tryArray(r?.products);
    tryArray(r?.items);

    return Array.from(areas);
  }

  getUserArea(r: any): string {
  if (!r) return 'Sin área';

  const type = r.type?.toLowerCase?.();
  const requested = r.requestedBy || {};
  const user = r.user || {};

  // OUTCOME → área del solicitante, luego del aprobador
  if (type === 'outcome') {
    const a =
      requested?.area?.name ??
      requested?.area?.nombre ??
      requested?.area ??
      user?.area?.name ??
      user?.area?.nombre ??
      user?.area;
    if (a) return String(a);
  }

  // INCOME (u otro) → área del responsable / user primero
  const direct =
    user?.area?.name ??
    user?.area?.nombre ??
    user?.area ??
    r?.area?.name ??
    r?.area?.nombre ??
    r?.area;
  if (direct) return String(direct);

  const areas = this.extractAreasFromReport(r);
  return areas.length ? areas[0] : 'Sin área';
}

  async exportActa(r: any, format: ReportFormat) {
  const uid = this.authService.getUserId();
  const role = (this.authService.getRole?.() ?? 'user').toLowerCase();

  // Si no hay usuario logueado (caso raro), generamos el acta igual,
  // y el entregado por vendrá de r.user (BD)
  if (!uid) {
    this.deliveryReport.exportActa(r, {
      format,
      author: 'Usuario',
      role,
      logoPath: '/fame_logo.png',
      websiteText: 'www.fame.ec',
      matrizTitle: 'PUNTO DE VENTA MATRIZ',
      matrizAddress: 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)',
      puntoQuito: 'PUNTO DE VENTA QUITO',
      puntoGuayaquil: 'PUNTO DE VENTA GUAYAQUIL'
      // 👈 OJO: ya NO mandamos deliveredByName ni deliveredByTitle
    });
    return;
  }

  this.userService.getById(uid).subscribe({
    next: (user) => {
      const author =
        [user?.firstname, user?.lastname].filter(Boolean).join(' ') ||
        user?.username ||
        'Usuario';

      this.deliveryReport.exportActa(r, {
        format,
        author,
        role,
        logoPath: '/fame_logo.png',
        websiteText: 'www.fame.ec',
        matrizTitle: 'PUNTO DE VENTA MATRIZ',
        matrizAddress: 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)',
        puntoQuito: 'PUNTO DE VENTA QUITO',
        puntoGuayaquil: 'PUNTO DE VENTA GUAYAQUIL'
        // 👈 SIN deliveredByName / deliveredByTitle
      });
    },
    error: () => {
      this.deliveryReport.exportActa(r, {
        format,
        author: 'Usuario',
        role,
        logoPath: '/fame_logo.png',
        websiteText: 'www.fame.ec',
        matrizTitle: 'PUNTO DE VENTA MATRIZ',
        matrizAddress: 'Dirección: Av. General Rumiñahui, Sangolquí 171103. (Junto a la ESPE)',
        puntoQuito: 'PUNTO DE VENTA QUITO',
        puntoGuayaquil: 'PUNTO DE VENTA GUAYAQUIL'
        // 👈 Igual, sin deliveredBy*
      });
    }
  });
}

  async onExport() {
    if (!this.historial || this.historial.length === 0) return;

    const role = (this.authService.getRole?.() ?? 'user').toLowerCase();
    const sampleUser = this.historial.find(r => r?.user)?.user;
    const author =
      sampleUser
        ? `${sampleUser.firstname ?? ''} ${sampleUser.lastname ?? ''}`.trim() || 'Usuario'
        : (this.authService as any)?.getFullName?.() || (this.authService as any)?.getUsername?.() || 'Usuario';

    await this.exportService.exportHistory(this.historial, {
      format: this.exportFormat,
      author,
      role,
      logoPath: '/fame_logo.png'
    });
  }

  goToDetails(id: number) { this.router.navigate(['/history', id]); }

  getEstado(r: any): string {
    const status = r.status?.toLowerCase?.();
    const type = r.type?.toLowerCase?.();
    if (type === 'income') return 'Aprobado';
    if (status === 'approved') return 'Aprobado';
    if (status === 'rejected') return 'Rechazado';
    return 'Pendiente';
  }

  goHome() { this.router.navigate(['/home']); }

  trackById = (_: number, r: any) => r?.id ?? _;
}
