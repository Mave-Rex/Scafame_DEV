import { Component } from '@angular/core';
import { EditarFormularioComponent } from '../../../../shared/components/forms/editar-formulario.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [EditarFormularioComponent, ButtonComponent],
  template: `
    <main class="pt-2 px-8 font-display min-h-[calc(100vh-120px)] flex items-start">
      <div class="max-w-[1100px] mx-auto w-full flex flex-col items-center justify-center relative">

        <h1 class="text-4xl font-bold text-black text-center mb-5">Editar Categoría</h1>

        <app-editar-formulario [tipo]="'Categoría'"></app-editar-formulario>

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
export class EditCategoryPageComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/modify']);
  }
}
