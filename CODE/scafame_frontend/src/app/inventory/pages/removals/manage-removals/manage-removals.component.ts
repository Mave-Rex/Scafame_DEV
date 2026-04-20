import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RetiroTableComponent, RetiroItem } from '../../../../shared/components/table/retiro-table.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../services/report.service';
import { firstValueFrom } from 'rxjs';
import { UserService, User } from '../../../../users/services/user.service';
import { InventoryReportService } from '../../../../services/inventory-report.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-removals',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, RetiroTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[1200px] w-full mx-auto relative">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-black text-center mb-8">
          Administrar Retiros
        </h1>

        <section class="mt-5 rounded-xl border border-zinc-300 bg-white p-4 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-black">Reporte Excel: Productos mas consumidos por area</h2>
              <p class="text-sm text-zinc-600 mt-1">Filtra por area y por rango de fechas para descargar el consolidado de consumos aprobados.</p>
            </div>

            <div class="flex items-center gap-2">
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

              <button
                type="button"
                class="bg-black text-white px-4 py-2 rounded-md font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="isExporting"
                (click)="downloadTopConsumedByAreaExcel()"
              >
                {{ isExporting ? 'Generando...' : 'Descargar reporte' }}
              </button>
            </div>
          </div>

          <div *ngIf="showFilters" class="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:items-end">
            <div>
              <label class="block text-sm font-semibold text-zinc-800 mb-1">Area</label>
              <select
                [(ngModel)]="selectedArea"
                [disabled]="isExporting"
                class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                <option value="">Todas las areas</option>
                <option *ngFor="let area of areaOptions" [value]="area">{{ area }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-zinc-800 mb-1">Desde</label>
              <input
                type="date"
                [(ngModel)]="startDate"
                [disabled]="isExporting"
                class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-zinc-800 mb-1">Hasta</label>
              <input
                type="date"
                [(ngModel)]="endDate"
                [disabled]="isExporting"
                class="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          </div>
        </section>

        <div class="mt-12">
          <app-retiro-table
            [retiros]="withdrawals"
            [disabled]="isSaving"
            (verDetalles)="onDetails($event)"
            (aprobar)="onApprove($event)"
            (rechazar)="onReject($event)"
          ></app-retiro-table>
        </div>

        <!-- Acciones -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center sm:justify-end items-center mt-6">
          <app-button label="Volver" variant="light" (click)="goBack()" />
          <app-button
            [label]="isSaving ? 'Guardando…' : 'Guardar Cambios'"
            variant="light"
            [disabled]="isSaving"
            (click)="saveChanges()"
          />
        </div>
      </div>

      <!-- Modal Detalles de Retiro -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-xl max-w-md w-full relative shadow-lg">
          <h2 class="text-xl font-bold mb-4">Detalles del Retiro</h2>

          <div class="text-sm space-y-2 max-h-[300px] overflow-y-auto">
            <!-- Usuario -->
            <p>
              <strong>Usuario:</strong>
              <ng-container *ngIf="!loadingUser; else loadingUserTpl">
                {{
                  (selectedRetiro?.requestedBy?.firstname || '') + ' ' +
                  (selectedRetiro?.requestedBy?.lastname || '')
                    || selectedRetiro?.requestedBy?.username
                    || selectedUserFullName
                    || selectedRetiroUsernameFallback
                }}
              </ng-container>
              <ng-template #loadingUserTpl>
                <span class="opacity-70">Cargando usuario…</span>
              </ng-template>
            </p>

            <!-- Área -->
            <p>
              <strong>Área:</strong>
              {{
                selectedRetiro?.requestedBy?.area
                  || selectedUserArea
                  || '—'
              }}
            </p>

            <!-- Fecha -->
            <p><strong>Fecha:</strong> {{ formatDate(selectedRetiro?.createdAt) }}</p>

            <!-- Productos -->
            <div>
              <p class="font-bold mb-1">Productos retirados:</p>
              <ul class="list-disc list-inside">
                <li *ngFor="let p of selectedRetiro?.ProductReports">
                  {{ p.product?.name }} × {{ p.quantity }}
                </li>
              </ul>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <app-button label="Cerrar" variant="light" (click)="showModal = false"></app-button>
          </div>
        </div>
      </div>
    </main>
  `
})
export class ManageRemovalsComponent implements OnInit {
  withdrawals: RetiroItem[] = [];
  showModal = false;
  selectedRetiro: any = null;
  loadingUser = false;
  selectedUser: Partial<User> | null = null;
  areaOptions: string[] = [];

  isSaving = false;
  isExporting = false;
  showFilters = false;
  selectedArea = '';
  startDate = '';
  endDate = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private reportService: ReportService,
    private userService: UserService,
    private inventoryReportService: InventoryReportService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.loadAreas();
  }

  loadAreas() {
    this.userService.getAll().subscribe({
      next: (users) => {
        const areas = Array.from(
          new Set(
            (users ?? [])
              .map((user) => (user?.area ?? '').trim())
              .filter((area) => area.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

        this.areaOptions = areas;
      },
      error: () => {
        this.areaOptions = [];
      }
    });
  }

  loadReports() {
    this.reportService.getAllByType('outcome', 'pending').subscribe({
      next: (reports) => {
        this.withdrawals = (reports ?? [])
          .filter((r: any) =>
            String(r?.type ?? '').toLowerCase() === 'outcome' &&
            String(r?.status ?? '').toLowerCase() === 'pending'
          )
          .map((r: any) => ({
            id: String(r.id),
            fecha: this.formatDate(r.createdAt),
            area:
              r?.requestedBy?.area ||
              r?.user?.area ||
              'Sin area',
            solicitante:
              `${r?.requestedBy?.firstname || ''} ${r?.requestedBy?.lastname || ''}`.trim() ||
              r?.requestedBy?.username ||
              r?.user?.username ||
              'No identificado',
            raw: r,
            aprobado: false,
            rechazado: false
          }));
      },
      error: () => {
        this.toastr.error('No se pudieron cargar los retiros');
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-EC');
  }

  goBack() {
    this.router.navigate(['/removals']);
  }

  onApprove(retiro: any) {
    if (retiro.aprobado || retiro.rechazado) {
      this.toastr.warning('Este retiro ya ha sido procesado');
      return;
    }
    retiro.aprobado = true;
    retiro.rechazado = false;
    this.toastr.info(`Retiro ${retiro.id} marcado como aprobado`);
  }

  onReject(retiro: any) {
    if (retiro.aprobado || retiro.rechazado) {
      this.toastr.warning('Este retiro ya ha sido procesado');
      return;
    }
    retiro.aprobado = false;
    retiro.rechazado = true;
    this.toastr.warning(`Retiro ${retiro.id} marcado como rechazado`);
  }

  async saveChanges() {
    const candidatos = this.withdrawals.filter(w => (w.aprobado || w.rechazado));
    if (candidatos.length === 0) {
      this.toastr.info('No hay cambios pendientes por guardar');
      return;
    }

    this.isSaving = true;

    try {
      // PATCH según decisión (el backend valida conflictos/stock y responde 409/400)
      const opPromises = candidatos.map(async (w) => {
        try {
          if (w.aprobado) {
            await firstValueFrom(this.reportService.approveReport(+w.id));
          } else {
            await firstValueFrom(this.reportService.rejectReport(+w.id));
          }
          return { id: w.id, ok: true };
        } catch (err: any) {
          const status = err?.status;
          return { id: w.id, ok: false, status };
        }
      });

      const results = await Promise.all(opPromises);

      const ok = results.filter(r => r.ok).length;
      const conflicts = results.filter(r => !r.ok && (r.status === 409 || r.status === 400));
      const others = results.filter(r => !r.ok && !(r.status === 409 || r.status === 400));

      if (ok > 0) this.toastr.success(`Se procesaron ${ok} reporte(s).`);
      conflicts.forEach(c => this.toastr.warning(`Reporte ${c.id}: ya no está pendiente o sin stock.`));
      others.forEach(o => this.toastr.error(`Reporte ${o.id}: error ${o.status || 'desconocido'}`));

      if (ok > 0) {
        this.loadReports();
      }

      if (ok > 0 && conflicts.length === 0 && others.length === 0) {
        this.router.navigate(['/removals']);
      }
    } finally {
      this.isSaving = false;
    }
  }

  rejectRequest(reportId: number) {
    this.reportService.rejectReport(reportId).subscribe({
      next: () => {
        this.toastr.success(`Reporte ${reportId} rechazado`);
        this.loadReports();
      },
      error: (err) => {
        this.toastr.error(`Error al rechazar el reporte ${reportId}`);
        console.error(err);
      }
    });
  }

  onDetails(retiro: any) {
    this.selectedRetiro = retiro.raw;
    this.showModal = true;
    this.fetchSelectedUser();
  }

  private preloadUserFromRetiro(): Partial<User> | null {
    const rawUser = this.selectedRetiro?.user;
    if (!rawUser) return null;

    if ((rawUser.firstname && rawUser.lastname) || (rawUser.nombre && rawUser.apellido)) {
      return {
        firstname: rawUser.firstname || rawUser.nombre,
        lastname: rawUser.lastname || rawUser.apellido,
        area: rawUser.area,
        jobTitle: rawUser.jobTitle,
        username: rawUser.username
      };
    }
    return null;
  }

  private fetchSelectedUser() {
    this.loadingUser = true;
    this.selectedUser = null;

    const pre = this.preloadUserFromRetiro();
    if (pre) {
      this.selectedUser = pre;
      this.loadingUser = false;
      return;
    }

    const userId: number | null =
      this.selectedRetiro?.user?.id ??
      this.selectedRetiro?.userId ??
      null;

    if (!userId) {
      this.loadingUser = false;
      return;
    }

    this.userService.getById(userId).subscribe({
      next: (u) => {
        this.selectedUser = u || null;
        this.loadingUser = false;
      },
      error: () => {
        this.loadingUser = false;
      }
    });
  }

  // Getters auxiliares para el template
  get selectedUserFullName(): string {
    const u = this.selectedUser;
    if (u?.firstname && u?.lastname) return `${u.firstname} ${u.lastname}`;
    return '';
  }
  get selectedUserArea(): string {
    return this.selectedUser?.area || '';
  }
  get selectedRetiroUsernameFallback(): string {
    return this.selectedRetiro?.user?.username || '—';
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.selectedArea.trim()) count++;
    if (this.startDate) count++;
    if (this.endDate) count++;
    return count;
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  downloadTopConsumedByAreaExcel() {
    this.isExporting = true;

    this.inventoryReportService
      .downloadTopConsumedByAreaXlsxResponse({
        area: this.selectedArea.trim() || undefined,
        startDate: this.startDate || undefined,
        endDate: this.endDate || undefined,
      })
      .subscribe({
        next: (response) => {
          const blob = response.body;
          if (!blob) {
            this.toastr.error('No se pudo generar el reporte por area');
            this.isExporting = false;
            return;
          }

          const date = new Date();
          const dd = String(date.getDate()).padStart(2, '0');
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const yyyy = date.getFullYear();
          const backendFilename = this.extractFilename(response.headers.get('content-disposition'));
          const fallbackFilename = this.buildReportFilename();

          const href = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = href;
          a.download = backendFilename || fallbackFilename;
          a.click();
          URL.revokeObjectURL(href);

          this.toastr.success('Reporte Excel descargado correctamente');
          this.isExporting = false;
        },
        error: () => {
          this.toastr.error('No se pudo generar el reporte por area');
          this.isExporting = false;
        },
      });
  }

  private extractFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;

    const match = /filename\*?=(?:UTF-8''|\")?([^";]+)\"?/i.exec(contentDisposition);
    if (!match?.[1]) return null;

    try {
      return decodeURIComponent(match[1].replace(/\"/g, '').trim());
    } catch {
      return match[1].replace(/\"/g, '').trim();
    }
  }

  private buildReportFilename(): string {
    const areaPart = this.selectedArea.trim() || 'Todos';

    const safeArea = areaPart.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'Todos';
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const start = this.startDate ? this.startDate.replace(/[^0-9-]/g, '') : '';
    const end = this.endDate ? this.endDate.replace(/[^0-9-]/g, '') : '';

    let range = '';
    if (start && end) {
      range = `${start}_al_${end}`;
    } else if (start) {
      range = `desde_${start}`;
    } else if (end) {
      range = `hasta_${end}`;
    }

    return range
      ? `ReporteArea_${safeArea}_${range}_${yyyy}${mm}${dd}.xlsx`
      : `ReporteArea_${safeArea}_${yyyy}${mm}${dd}.xlsx`;
  }
}
