// src/app/inventory/pages/modify/add-pages/add-unit-page.component.ts
import { Component } from '@angular/core';
import { IngresoFormularioComponent } from '../../../../shared/components/forms/ingreso-formulario.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-unit-page',
  standalone: true,
  imports: [IngresoFormularioComponent, ButtonComponent],
  template: `
    <main class="p-8 font-display min-h-[calc(90vh-120px)] flex items-center">
      <div class="max-w-[1200px] mx-auto w-full flex flex-col items-center justify-center relative">

        <h1 class="text-4xl font-bold text-black text-center mb-5">Agregar Unidad</h1>

        <app-ingreso-formulario [tipo]="'Unidad'"></app-ingreso-formulario>

        <div class="flex justify-center mt-10 lg:absolute lg:right-0 lg:bottom-1 lg:items-end lg:mt-0">
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>

      </div>
    </main>
  `
})
export class AddUnitPageComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/modify']); }
}
