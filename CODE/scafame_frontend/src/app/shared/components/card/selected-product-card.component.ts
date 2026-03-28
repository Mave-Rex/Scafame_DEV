import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selected-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white text-black p-4 rounded-lg flex items-center justify-between shadow-md">
      <div class="text-xs">
        <p class="font-bold text-[11px] mb-1">Producto</p>
        <p class="text-[13px] leading-tight whitespace-normal break-words max-w-full">
          {{ nombre }}
        </p>

      </div>

      <div class="flex items-center gap-2">
        <!-- Botón - -->
        <button
          class="bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
          (mousedown)="startHold('decrementar')"
          (mouseup)="stopHold()"
          (mouseleave)="stopHold()"
          (click)="decrementar.emit()"
        >−</button>

        <!-- Input editable sin flechas -->
        <input
          type="number"
          class="no-spinner w-12 text-center border border-gray-300 rounded text-sm"
          [value]="cantidad"
          min="0"
          (input)="onCantidadChange($event)"
        />

        <!-- Botón + -->
        <button
          class="bg-black text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
          (mousedown)="startHold('incrementar')"
          (mouseup)="stopHold()"
          (mouseleave)="stopHold()"
          (click)="incrementar.emit()"
        >+</button>
      </div>
    </div>
  `,
  styles: [`
    /* Quitar flechas del input number */
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class SelectedProductCardComponent {
  @Input() nombre: string = '';
  @Input() cantidad: number = 1;

  @Output() incrementar = new EventEmitter<void>();
  @Output() decrementar = new EventEmitter<void>();
  @Output() cantidadCambiada = new EventEmitter<number>();

  private holdInterval: any;

  startHold(tipo: 'incrementar' | 'decrementar') {
    this.holdInterval = setInterval(() => {
      tipo === 'incrementar' ? this.incrementar.emit() : this.decrementar.emit();
    }, 120);
  }

  stopHold() {
    clearInterval(this.holdInterval);
  }

  onCantidadChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(value) && value >= 0) {
      this.cantidadCambiada.emit(value);
    }
  }
}
