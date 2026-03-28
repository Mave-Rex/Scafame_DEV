import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EliminarFormularioComponent } from '../../../../shared/components/forms/eliminar-formulario.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  standalone: true,
  selector: 'app-delete-unit-page', 
  imports: [EliminarFormularioComponent, ButtonComponent],
  template: `
    <main class="px-6 sm:px-8 pt-2 pb-8 font-display min-h-[calc(90vh-120px)] flex items-start">
      <div class="max-w-[1200px] mx-auto w-full flex flex-col items-center justify-center relative">

        <h1 class="text-4xl font-bold text-black text-center mb-5">Eliminar Unidad</h1>

        <!-- Usa el componente compartido -->
        <app-eliminar-formulario [tipo]="'Unidad'"></app-eliminar-formulario>

        <div
          class="flex justify-center mt-10
                 lg:absolute lg:right-0 lg:bottom-1 lg:items-end lg:mt-0"
        >
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>

      </div>
    </main>
  `
})
export class DeleteUnitPageComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/modify']); }
}
