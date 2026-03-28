import { Component } from '@angular/core';
import { EliminarFormularioComponent } from '../../../../shared/components/forms/eliminar-formulario.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-category',
  standalone: true,
  imports: [EliminarFormularioComponent, ButtonComponent],
  template: `
    <main class="p-8 font-display min-h-[calc(100vh-120px)] flex items-center">
      <div class="max-w-[1100px] mx-auto w-full flex flex-col items-center justify-center relative">

        <h1 class="text-4xl font-bold text-black text-center mb-5">Eliminar Categoría</h1>

        <app-eliminar-formulario [tipo]="'Categoría'"></app-eliminar-formulario>

        <div class="absolute right-0 bottom-1 flex flex-col items-end gap-4">
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>

      </div>
    </main>
  `
})
export class DeleteCategoryPageComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/modify']);
  }
}
