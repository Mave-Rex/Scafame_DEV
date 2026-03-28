import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectedProductTableComponent } from '../../../../shared/components/table/selected-product-table.component';
import { ToastrService } from 'ngx-toastr';
import { WithdrawalService, SelectedProduct } from '../../../../services/withdrawal.service';
import { AuthService } from '../../../../auth/auth.service';
import { ReportService } from '../../../../services/report.service';

@Component({
  selector: 'app-review-request',
  standalone: true,
  imports: [CommonModule, ButtonComponent, SelectedProductTableComponent],
  template: `
    <main class="min-h-[calc(100vh-120px)] p-8 font-display">
      <div class="max-w-[1100px] w-full mx-auto relative flex flex-col justify-center">
        <h1 class="text-4xl font-bold text-black text-center mb-10">Solicitar Retiro</h1>

        <app-selected-product-table
          [productos]="selected"
          (incrementar)="increase($event)"
          (decrementar)="decrease($event)"
        ></app-selected-product-table>

        <div
          class="flex flex-col gap-4 items-center mt-6
                lg:absolute lg:-right-8 lg:bottom-1 lg:items-end lg:mt-0"
        >
          <app-button label="Volver a Inventario" variant="light" (click)="goBack()" />
          <app-button label="Generar Solicitud" variant="light" (click)="openModal()" />
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white text-black p-6 rounded-lg max-w-md w-full relative">
          <h2 class="text-xl font-bold mb-4">Confirmar Solicitud</h2>

          <div class="text-sm max-h-64 overflow-y-auto">
            <ul>
              <li *ngFor="let p of selected">
                • {{ p.nombre }} × {{ p.cantidad }}
              </li>
            </ul>
          </div>

          <div class="flex justify-end mt-6 gap-4">
            <button class="text-sm text-gray-600 hover:underline" (click)="cancel()">Cancelar</button>
            <button class="bg-black text-white px-4 py-2 rounded text-sm" (click)="submitRequest()">Confirmar</button>
          </div>
        </div>
      </div>
    </main>
  `
})
export class ReviewRequestComponent implements OnInit {
  selected: SelectedProduct[] = [];
  showModal = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private withdrawalService: WithdrawalService,
    private authService: AuthService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.selected = this.withdrawalService.getSelected();
  }

  openModal() {
    this.showModal = true;
  }

  cancel() {
    this.showModal = false;
  }

  submitRequest() {
    this.authService.getPerfilUsuario().subscribe({
      next: (user) => {
        const payload = {
          userId: user.id,
          products: this.selected.map(p => ({
            productId: p.id,
            quantity: p.cantidad
          }))
        };

        this.reportService.createOutcomeReport(payload).subscribe({
          next: () => {
            this.toastr.success('Solicitud generada correctamente');
            this.withdrawalService.clear();
            this.router.navigate(['/home']);
          },
          error: () => {
            this.toastr.error('Error al generar la solicitud');
          }
        });
      },
      error: () => {
        this.toastr.error('No se pudo obtener el usuario');
      }
    });
  }

  goBack() {
    this.router.navigate(['/removals/request']);
  }

  increase(product: SelectedProduct) {
    this.withdrawalService.increase(product.nombre);
  }

  decrease(product: SelectedProduct) {
    this.withdrawalService.decrease(product.nombre);
  }
}
