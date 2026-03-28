import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ingreso-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-black text-white p-6 rounded-2xl w-full max-w-6xl">
      <h2 class="text-center text-xl mb-6 font-bold tracking-widest">Nuevo -----</h2>

      <div class="grid grid-cols-3 gap-4 items-start">
        <!-- Etiquetas y campos -->
        <div class="col-span-2 space-y-3">
          <div class="grid grid-cols-[auto_1fr] gap-4 items-center" *ngFor="let label of labels; let i = index">
            <label class="bg-white text-black px-4 py-2 rounded-lg font-bold">Campo {{ i + 1 }}:</label>
            <input type="text" class="px-4 py-2 rounded-lg text-black w-full" [(ngModel)]="campos[i]" />
          </div>
        </div>

        <!-- Imagen y botones -->
        <div class="flex flex-col items-center gap-4">
          <button class="bg-white text-black px-4 py-2 rounded-lg font-bold">
            Seleccionar Imagen
          </button>
          <div class="w-40 h-40 bg-gray-400 rounded-2xl"></div>
          <button (click)="agregar()" class="bg-white text-black px-6 py-2 rounded-lg font-bold">
            Agregar ---
          </button>
        </div>
      </div>
    </div>
  `
})
export class IngresoFormularioComponent {
  @Input() tipo: string = 'Elemento';
  labels = Array(5).fill(null);
  campos: string[] = ['', '', '', '', ''];

  constructor(private toastr: ToastrService) {}

  agregar() {
    console.log('Agregar:', this.campos);
    this.toastr.success(`${this.tipo} agregado correctamente`);
  }
}
