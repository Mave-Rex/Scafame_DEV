import { Component } from '@angular/core';
import { EditarFormularioComponent } from '../../../../shared/components/forms/editar-formulario.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-area',
  standalone: true,
  imports: [EditarFormularioComponent, ButtonComponent],
  template: `
    <main class="p-8 font-display min-h-[calc(100vh-120px)] flex items-center">
      <div class="max-w-[1100px] mx-auto w-full flex flex-col items-center justify-center relative">

        <h1 class="text-4xl font-bold text-black text-center mb-5">Editar Área</h1>

        <app-editar-formulario [tipo]="'Área'"></app-editar-formulario>

        <div class="absolute right-0 bottom-1 flex flex-col items-end gap-4">
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>

      </div>
    </main>
  `
})
export class EditAreaPageComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/modify']);
  }
}
