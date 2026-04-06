import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCardComponent } from '../../../shared/components/card/action-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-removals-page',
  standalone: true,
  imports: [CommonModule, ActionCardComponent, ButtonComponent],
  template: `
    <main class="p-8 font-display min-h-[calc(100vh-120px)] flex items-center">
      <div class="max-w-[1100px] mx-auto w-full flex flex-col items-center justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-12">Retiros</h1>

        <!-- Tarjetas -->
        <div class="flex flex-wrap justify-center gap-10 mb-12">
          <app-action-card
            icon="mdi:package-variant-minus"
            label="Solicitar Retiro"
            (clicked)="goTo('request')"
          ></app-action-card>

          <app-action-card
            icon="mdi:clipboard-list-outline"
            label="Administrar Retiros"
            (clicked)="checkWithdrawals()"
          ></app-action-card>
        </div>

        <!-- Botón Volver -->
        <div class="w-full flex justify-end">
          <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
        </div>
      </div>

      <!-- Modal sin retiros -->
      <div *ngIf="showNoWithdrawalsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-xl max-w-md w-full relative shadow-lg">
          <h2 class="text-xl font-bold mb-4">Sin Retiros</h2>
          <p class="mb-4">Actualmente no existen retiros pendientes por administrar.</p>
          <div class="flex justify-end">
            <app-button label="Cerrar" variant="light" (click)="showNoWithdrawalsModal = false" />
          </div>
        </div>
      </div>
    </main>
  `,
  providers: [ReportService]
})
export class RemovalsPageComponent {
  showNoWithdrawalsModal = false;

  constructor(
    private router: Router,
    private reportService: ReportService
  ) {}

  goTo(path: string) {
    this.router.navigate(['/removals', path]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  checkWithdrawals() {
    this.reportService.getAllByType('outcome', 'pending').subscribe({
      next: (reports) => {
        if ((reports?.length ?? 0) > 0) {
          this.goTo('manage');
        } else {
          this.showNoWithdrawalsModal = true;
        }
      },
      error: () => {
        this.showNoWithdrawalsModal = true;
      }
    });
  }
}

