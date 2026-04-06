import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RetiroTableComponent, RetiroItem } from '../../../../shared/components/table/retiro-table.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReportService } from '../../../../services/report.service';
import { firstValueFrom } from 'rxjs';
import { UserService, User } from '../../../../users/services/user.service';

@Component({
  selector: 'app-manage-removals',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RetiroTableComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[980px] w-full mx-auto relative">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-black text-center mb-8">
          Administrar Retiros
        </h1>

        <app-retiro-table
          [retiros]="withdrawals"
          [disabled]="isSaving"
          (verDetalles)="onDetails($event)"
          (aprobar)="onApprove($event)"
          (rechazar)="onReject($event)"
        ></app-retiro-table>

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

  isSaving = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private reportService: ReportService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getAllByType('outcome', 'pending').subscribe({
      next: (reports) => {
        this.withdrawals = (reports ?? [])
          .map((r: any) => ({
            id: String(r.id),
            fecha: this.formatDate(r.createdAt),
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
      // 1) Revalidar que sigan PENDING
      const revalPromises = candidatos.map(async (w) => {
        try {
          const fresh = await firstValueFrom(this.reportService.getById(+w.id));
          return { w, fresh };
        } catch {
          return { w, fresh: null };
        }
      });

      const reval = await Promise.all(revalPromises);

      const todaviaPending = reval
        .filter(r => (r.fresh?.status ?? '').toLowerCase() === 'pending')
        .map(r => r.w);

      const descartados = reval
        .filter(r => !r.fresh || (r.fresh.status ?? '').toLowerCase() !== 'pending')
        .map(r => r.w);

      descartados.forEach(d => this.toastr.warning(`Reporte ${d.id} ya fue procesado; se omitió.`));

      if (todaviaPending.length === 0) {
        this.isSaving = false;
        return;
      }

      // 2) PATCH según decisión
      const opPromises = todaviaPending.map(async (w) => {
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
}
