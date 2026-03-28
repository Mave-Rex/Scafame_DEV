import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-detail-history',
  standalone: true,
  imports: [CommonModule, NgFor, ButtonComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[900px] w-full mx-auto relative flex flex-col justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-6">
          Detalles del Registro #{{ registro?.id }}
        </h1>

        <!-- Contenedor -->
        <div class="bg-black text-white rounded-2xl p-6 space-y-6 shadow-lg">

          <!-- Información del registro -->
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-bold uppercase tracking-wide">
              {{ registro?.type === 'income' ? 'Ingreso' : 'Retiro' }}
            </h2>

            <!-- Indicador de estado -->
            <div class="flex justify-center items-center gap-2">
              <span
                class="w-3 h-3 rounded-full inline-block"
                [ngClass]="{
                  'bg-green-500': statusLower === 'approved',
                  'bg-red-500': statusLower === 'rejected'
                }"
              ></span>
              <span class="text-sm font-semibold">
                {{ statusLower === 'approved' ? 'Aprobado' : 'Rechazado' }}
              </span>
            </div>

            <p class="text-sm">
              <strong>Fecha:</strong> {{ registro?.createdAt | date: 'dd/MM/yyyy' }}
            </p>
            <p class="text-sm">
              <strong>Usuario:</strong>
              {{ getDisplayUserName() }}
              <span class="italic text-gray-300">
                (Área: {{ getDisplayUserArea() }})
              </span>
            </p>
          </div>

          <hr class="border-white opacity-30" />

          <!-- Productos involucrados -->
          <div>
            <h3 class="text-center font-bold text-lg mb-4">Productos involucrados</h3>

            <div
              class="flex flex-col gap-4 overflow-y-auto max-h-[200px] p-2"
              style="scrollbar-width: thin; scrollbar-color: white black;"
            >
              <div
                class="bg-white text-black rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 font-semibold"
                *ngFor="let p of productos"
              >
                <span>{{ p.product?.name }}</span>
                <span>Cantidad: {{ p.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón flotante -->
        <div
          class="flex justify-center mt-6
                lg:absolute lg:-right-5 lg:translate-x-20 lg:bottom-1 lg:mt-0"
        >
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>
      </div>
    </main>
  `
})
export class DetailHistoryComponent implements OnInit {
  registro: any = null;
  productos: any[] = [];
  statusLower = '';

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportService.getById(Number(id)).subscribe({
        next: (res) => {
          this.registro = res;
          this.statusLower = res.status?.toLowerCase() || '';
          this.productos = res.ProductReports || [];
        },
        error: () => {
          this.router.navigate(['/history']);
        }
      });
    }
  }

  getDisplayUserName(): string {
  const r = this.registro;
  if (!r) return '—';

  const type = r.type?.toLowerCase?.();
  // Para retiros, usamos al solicitante; para ingresos, al responsable
  const u = type === 'outcome'
    ? (r.requestedBy || r.user || {})
    : (r.user || {});

  const first = u.firstname ?? '';
  const last  = u.lastname ?? '';
  const full  = `${first} ${last}`.trim();

  return full || u.username || '—';
}

getDisplayUserArea(): string {
  const r = this.registro;
  if (!r) return 'Sin área';

  const type = r.type?.toLowerCase?.();
  const requested = r.requestedBy || {};
  const user = r.user || {};

  // OUTCOME → priorizar área del solicitante
  if (type === 'outcome') {
    const a =
      requested?.area?.name ??
      requested?.area?.nombre ??
      requested?.area ??
      user?.area?.name ??
      user?.area?.nombre ??
      user?.area;
    return a ? String(a) : 'Sin área';
  }

  // INCOME → área del responsable (user)
  const a =
    user?.area?.name ??
    user?.area?.nombre ??
    user?.area;
  return a ? String(a) : 'Sin área';
}

  goBack() {
    history.back();
  }
}
