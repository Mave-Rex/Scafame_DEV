import {Component,CUSTOM_ELEMENTS_SCHEMA, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { ToastrService } from 'ngx-toastr';

type Elemento = {
  id: number;
  nombre: string;
  descripcion: string;
};

@Component({
  selector: 'app-editar-formulario',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="bg-black text-white rounded-2xl p-8 w-[600px] mx-auto text-center font-display">

      <!-- Buscador -->
      <div class="flex items-center border border-black rounded-full px-4 py-2 w-full max-w-md mx-auto mb-8 bg-white">
        <iconify-icon icon="mdi:magnify" class="text-black text-xl mr-2"></iconify-icon>
        <input
          [(ngModel)]="searchQuery"
          (input)="resetSeleccion()"
          type="text"
          placeholder="Buscar..."
          class="w-full bg-transparent outline-none text-black"
        />
      </div>

      <!-- Resultado seleccionado -->
      <div
        *ngIf="selectedItem"
        class="bg-white text-black rounded-xl px-6 py-4 mb-6 w-full max-w-lg mx-auto"
      >
        <p class="font-bold text-lg mb-1">{{ selectedItem.nombre }}</p>
        <p class="text-sm">ID: {{ selectedItem.id }}</p>
        <p class="text-sm mt-2">{{ selectedItem.descripcion }}</p>
      </div>

      <app-button
        *ngIf="selectedItem"
        variant="dark"
        label="Editar Producto"
        (click)="abrirModal()"
      ></app-button>

      <!-- Lista de resultados -->
      <div
        *ngIf="searchQuery && !selectedItem"
        class="grid grid-cols-1 gap-3 overflow-y-auto max-h-[260px] p-2"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >
        <div
          *ngFor="let item of resultadosFiltrados()"
          (click)="seleccionar(item)"
          class="cursor-pointer bg-white text-black rounded-xl w-full px-4 py-2 text-left shadow hover:ring-2 hover:ring-blue-500 transition"
        >
          <p class="font-bold text-lg">{{ item.nombre }}</p>
          <p class="text-sm opacity-60">ID: {{ item.id }}</p>
        </div>
      </div>

      <!-- Modal -->
      <div
        *ngIf="modalAbierto"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        <div class="bg-white text-black rounded-2xl p-8 w-full max-w-md font-display text-left">
          <h3 class="text-xl font-bold mb-4">Editar Producto</h3>

          <label class="block mb-2">Nombre:</label>
          <input
            [(ngModel)]="editedItem.nombre"
            class="w-full border border-black rounded px-3 py-2 mb-4"
            type="text"
          />

          <label class="block mb-2">Descripción:</label>
          <textarea
            [(ngModel)]="editedItem.descripcion"
            class="w-full border border-black rounded px-3 py-2 mb-4"
            rows="3"
          ></textarea>

          <div class="flex justify-end gap-4 mt-4">
            <app-button
              variant="light"
              label="Cancelar"
              (click)="cerrarModal()"
            ></app-button>
            <app-button
              variant="light"
              label="Guardar"
              (click)="guardarCambios()"
            ></app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditarFormularioComponent {
  @Input() tipo: string = 'Elemento';
  searchQuery = '';
  selectedItem: Elemento | null = null;
  modalAbierto = false;

  editedItem: Elemento = { id: 0, nombre: '', descripcion: '' };

  datos: Elemento[] = [
    { id: 1, nombre: 'Detergente Clásico', descripcion: 'Para ropa blanca y de color.' },
    { id: 2, nombre: 'Detergente Ultra', descripcion: 'Máxima potencia en limpieza.' },
    { id: 4, nombre: 'Limpiador Multiusos', descripcion: 'Para todo tipo de superficies.' },
    { id: 5, nombre: 'Desinfectante', descripcion: 'Elimina el 99.9% de bacterias.' },
    { id: 1, nombre: 'Detergente Clásico', descripcion: 'Para ropa blanca y de color.' },
    { id: 2, nombre: 'Detergente Ultra', descripcion: 'Máxima potencia en limpieza.' },
    { id: 4, nombre: 'Limpiador Multiusos', descripcion: 'Para todo tipo de superficies.' },
    { id: 5, nombre: 'Desinfectante', descripcion: 'Elimina el 99.9% de bacterias.' }
  ];

  constructor(private toastr: ToastrService) {}

  resultadosFiltrados() {
    return this.datos.filter(item =>
      item.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  seleccionar(item: Elemento) {
    this.selectedItem = { ...item };
    this.searchQuery = '';
  }

  resetSeleccion() {
    this.selectedItem = null;
  }

  abrirModal() {
    if (!this.selectedItem) return;
    this.editedItem = { ...this.selectedItem };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardarCambios() {
    const index = this.datos.findIndex(i => i.id === this.editedItem.id);
    if (index !== -1) {
      this.datos[index] = { ...this.editedItem };
      this.selectedItem = { ...this.editedItem };
      this.toastr.success(`${this.tipo} actualizado correctamente`);
    }
    this.cerrarModal();
  }
}
