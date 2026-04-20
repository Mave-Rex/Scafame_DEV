import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RetiroItem {
  id: string;
  fecha: string;
  area?: string;
  solicitante?: string;
  raw: any;
  aprobado?: boolean;
  rechazado?: boolean;
}

@Component({
  selector: 'app-retiro-table',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section
      class="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-white/10
             bg-gradient-to-br from-[#0b0b0b] via-[#111] to-[#171717] text-white"
    >
      <!-- Header -->
      <header class="px-5 py-4 border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <iconify-icon icon="mdi:package-variant-minus" class="w-5 h-5"></iconify-icon>
            </div>
            <div>
              <h2 class="text-2xl font-semibold leading-tight">Retiros pendientes</h2>
              <p class="text-sm text-white/60 -mt-0.5">
                Revisa y decide antes de guardar cambios.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="px-2 py-1 rounded-full bg-white/10">
              Total: <strong class="ml-1">{{ total }}</strong>
            </span>
            <span class="px-2 py-1 rounded-full bg-green-500/15 text-green-300">
              <iconify-icon icon="mdi:check-circle" class="inline w-3.5 h-3.5 mr-0.5"></iconify-icon>
              Aprobados: <strong class="ml-1">{{ totalAprobados }}</strong>
            </span>
            <span class="px-2 py-1 rounded-full bg-red-500/15 text-red-300">
              <iconify-icon icon="mdi:close-circle" class="inline w-3.5 h-3.5 mr-0.5"></iconify-icon>
              Rechazados: <strong class="ml-1">{{ totalRechazados }}</strong>
            </span>
          </div>
        </div>
      </header>

      <!-- Empty state -->
      <div *ngIf="total === 0" class="px-6 py-16 text-center">
        <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mb-4">
          <iconify-icon icon="mdi:archive" class="w-7 h-7"></iconify-icon>
        </div>
        <h3 class="text-lg font-medium mb-1">Sin retiros pendientes</h3>
        <p class="text-white/60 text-sm">Cuando existan solicitudes de salida, aparecerán aquí.</p>
      </div>

      <!-- List -->
      <div *ngIf="total > 0" class="p-3 sm:p-4 max-h-[420px] overflow-y-auto scroll-smooth custom-scroll">
        <div class="overflow-x-auto rounded-xl border border-white/10">
          <table class="w-full min-w-[920px] text-base">
            <thead class="bg-white/10 text-left">
              <tr>
                <th class="px-4 py-3 font-semibold text-[1.05rem]">ID</th>
                <th class="px-4 py-3 font-semibold text-[1.05rem]">Asunto</th>
                <th class="px-4 py-3 font-semibold text-[1.05rem]">Solicitante</th>
                <th class="px-4 py-3 font-semibold text-[1.05rem]">Area</th>
                <th class="px-4 py-3 font-semibold text-[1.05rem]">Fecha</th>
                <th class="px-4 py-3 font-semibold text-center text-[1.05rem]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let retiro of retiros; trackBy: trackById"
                class="border-t border-white/10"
                [ngClass]="{
                  'bg-green-500/10': retiro.aprobado,
                  'bg-red-500/10': retiro.rechazado
                }"
              >
                <td class="px-4 py-3 text-[1.05rem]">{{ retiro.id }}</td>
                <td class="px-4 py-3 text-[1.05rem]">{{ retiro.raw?.type === 'income' ? 'Ingreso' : 'Retiro' }}</td>
                <td class="px-4 py-3 text-[1.05rem]">{{ retiro.solicitante || 'No identificado' }}</td>
                <td class="px-4 py-3 text-[1.05rem]">{{ retiro.area || 'Sin area' }}</td>
                <td class="px-4 py-3 text-[1.05rem]">{{ retiro.fecha }}</td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      type="button"
                      class="px-3 py-1 rounded-full text-sm font-semibold bg-white/15 hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="disabled"
                      (click)="verDetalles.emit(retiro)"
                    >
                      Detalles
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-green-600/80 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="disabled || !!retiro.aprobado || !!retiro.rechazado"
                      (click)="aprobar.emit(retiro)"
                      title="Aprobar"
                      aria-label="Aprobar"
                    >
                      <svg viewBox="0 0 24 24" class="block h-6 w-6 fill-current" aria-hidden="true" focusable="false">
                        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-600/80 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="disabled || !!retiro.aprobado || !!retiro.rechazado"
                      (click)="rechazar.emit(retiro)"
                      title="Rechazar"
                      aria-label="Rechazar"
                    >
                      <svg viewBox="0 0 24 24" class="block h-6 w-6 fill-current" aria-hidden="true" focusable="false">
                        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .custom-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.35) transparent; }
    .custom-scroll::-webkit-scrollbar { height: 8px; width: 8px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.35); border-radius: 9999px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
  `]
})
export class RetiroTableComponent {
  @Input() retiros: RetiroItem[] = [];
  @Input() disabled = false;

  @Output() verDetalles = new EventEmitter<RetiroItem>();
  @Output() aprobar = new EventEmitter<RetiroItem>();
  @Output() rechazar = new EventEmitter<RetiroItem>();

  // ✅ Getters para evitar arrow functions en el template
  get total(): number {
    return this.retiros?.length ?? 0;
  }
  get totalAprobados(): number {
    return (this.retiros ?? []).filter(r => r.aprobado === true).length;
  }
  get totalRechazados(): number {
    return (this.retiros ?? []).filter(r => r.rechazado === true).length;
  }

  trackById(_: number, item: RetiroItem) { return item.id; }
}
