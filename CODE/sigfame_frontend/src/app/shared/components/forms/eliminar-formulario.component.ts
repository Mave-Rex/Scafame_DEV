import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
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
  selector: 'app-eliminar-formulario',
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
        label="Eliminar Producto"
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
          class="cursor-pointer bg-white text-black rounded-xl w-full px-4 py-2 text-left shadow hover:ring-2 hover:ring-red-500 transition"
        >
          <p class="font-bold text-lg">{{ item.nombre }}</p>
          <p class="text-sm opacity-60">ID: {{ item.id }}</p>
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div
        *ngIf="modalAbierto"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      >
        <div class="bg-white text-black rounded-2xl p-8 w-full max-w-md font-display text-center">
          <h3 class="text-xl font-bold mb-4">¿Eliminar Producto?</h3>
          <p class="mb-6">Estás a punto de eliminar:</p>
          <p class="font-bold text-lg mb-2">{{ selectedItem?.nombre }}</p>
          <p class="text-sm opacity-60 mb-6">ID: {{ selectedItem?.id }}</p>

          <div class="flex justify-center gap-4">
            <app-button
              variant="light"
              label="Cancelar"
              (click)="cerrarModal()"
            ></app-button>
            <app-button
              variant="light"
              label="Confirmar"
              (click)="eliminarElemento()"
            ></app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EliminarFormularioComponent {
  @Input() tipo: string = 'elemento';
  searchQuery = '';
  selectedItem: Elemento | null = null;
  modalAbierto = false;

  datos: Elemento[] = [
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
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  eliminarElemento() {
    if (!this.selectedItem) return;
    this.datos = this.datos.filter(i => i.id !== this.selectedItem?.id);
    this.toastr.success(`${this.tipo} eliminado correctamente`);
    this.cerrarModal();
    this.selectedItem = null;
  }
}
