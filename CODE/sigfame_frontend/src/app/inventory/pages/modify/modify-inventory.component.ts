import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-modify-inventory',
  standalone: true,
  imports: [ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ✅ solo aquí, no en imports
  template: `
    <main class="p-8 font-display min-h-[calc(90vh-120px)] flex items-center">
      <div class="max-w-[1200px] mx-auto w-full flex flex-col items-center justify-center relative">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-14">Modificar Inventario</h1>

        <!-- Contenedor de grupos -->
        <div class="flex flex-wrap gap-10 justify-center items-start">

          <!-- Grupo: Áreas -->
          <div class="bg-black text-white rounded-2xl p-6 w-72 flex flex-col items-center">
            <iconify-icon icon="mdi:account-group" class="text-white text-6xl mb-4"></iconify-icon>
            <h2 class="text-2xl font-bold mb-6">Áreas</h2>

            <app-button label="Agregar Área" variant="dark" class="mb-3 w-full" (click)="goTo('area/add')" />
            <app-button label="Editar Área" variant="dark" class="mb-3 w-full" (click)="goTo('area/edit')" />
            <app-button label="Eliminar Área" variant="dark" class="w-full" (click)="goTo('area/delete')" />
          </div>

          <!-- Grupo: Categorías -->
          <div class="bg-black text-white rounded-2xl p-6 w-72 flex flex-col items-center">
            <iconify-icon icon="mdi:shape" class="text-white text-6xl mb-4"></iconify-icon>
            <h2 class="text-2xl font-bold mb-6">Categorías</h2>

            <app-button label="Agregar Categoría" variant="dark" class="mb-3 w-full" (click)="goTo('category/add')" />
            <app-button label="Editar Categoría" variant="dark" class="mb-3 w-full" (click)="goTo('category/edit')" />
            <app-button label="Eliminar Categoría" variant="dark" class="w-full" (click)="goTo('category/delete')" />
          </div>

          <!-- Grupo: Productos -->
          <div class="bg-black text-white rounded-2xl p-6 w-72 flex flex-col items-center">
            <iconify-icon icon="mdi:package-variant" class="text-white text-6xl mb-4"></iconify-icon>
            <h2 class="text-2xl font-bold mb-6">Productos</h2>

            <app-button label="Agregar Producto" variant="dark" class="mb-3 w-full" (click)="goTo('product/add')" />
            <app-button label="Editar Producto" variant="dark" class="mb-3 w-full" (click)="goTo('product/edit')" />
            <app-button label="Eliminar Producto" variant="dark" class="w-full" (click)="goTo('product/delete')" />
          </div>

        </div>

        <!-- Botón Volver -->
        <div class="absolute -right-6 bottom-1">
          <app-button label="Volver" variant="light" (click)="goBack()" />
        </div>
      </div>
    </main>
  `
})
export class ModifyInventoryComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate(['/modify/' + path]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
