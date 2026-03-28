import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RetiroTableComponent } from '../../../../shared/components/table/retiro-table.component';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-removals',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RetiroTableComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[700px] w-full mx-auto relative flex flex-col justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-10">Administrar Retiros</h1>

        <!-- Tabla de retiros -->
        <app-retiro-table
          [retiros]="withdrawals"
          (verDetalles)="onDetails($event)"
          (aprobar)="onApprove($event)"
          (rechazar)="onReject($event)"
        ></app-retiro-table>

        <!-- Botones flotantes alineados a la derecha -->
        <div class="absolute left-full ml-7 bottom-1 flex flex-col items-start gap-4">
          <app-button label="Volver" variant="light" (click)="goBack()" />
          <app-button label="Guardar Cambios" variant="light" (click)="saveChanges()" />
        </div>

      </div>
    </main>
  `
})
export class ManageRemovalsComponent {
  withdrawals = [
    { id: '001', fecha: '12/07/2025' },
    { id: '002', fecha: '11/07/2025' },
    { id: '003', fecha: '10/07/2025' },
    { id: '004', fecha: '09/07/2025' },
    { id: '005', fecha: '08/07/2025' },
    { id: '006', fecha: '07/07/2025' },
    { id: '007', fecha: '06/07/2025' },
    { id: '008', fecha: '05/07/2025' },
    { id: '009', fecha: '04/07/2025' },
    { id: '010', fecha: '03/07/2025' }
  ];

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  goBack() {
    this.router.navigate(['/removals']);
  }

  saveChanges() {
    this.toastr.success('Cambios guardados exitosamente');
  }

  onApprove(retiro: any) {
    console.log('Aprobar', retiro);
  }

  onReject(retiro: any) {
    console.log('Rechazar', retiro);
  }

  onDetails(retiro: any) {
    console.log('Ver detalles', retiro);
  }
}
