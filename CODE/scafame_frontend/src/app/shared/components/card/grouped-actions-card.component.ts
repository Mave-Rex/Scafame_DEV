import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-grouped-actions-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      class="bg-black text-white rounded-2xl w-64 p-6 flex flex-col items-center gap-4 shadow-lg"
    >
      <iconify-icon [icon]="icon" class="text-5xl"></iconify-icon>

      <h2 class="text-xl font-bold">{{ titulo }}</h2>

      <app-button
        *ngFor="let accion of acciones"
        [label]="accion.label"
        (click)="accionClick(accion.tipo)"
        class="w-full"
        variant="dark"
      ></app-button>
    </div>
  `
})
export class GroupedActionsCardComponent {
  @Input() titulo = 'Sección';
  @Input() icon = 'mdi:cube';
  @Input() acciones: { tipo: string; label: string }[] = [];

  @Output() accionSeleccionada = new EventEmitter<string>();

  accionClick(tipo: string) {
    this.accionSeleccionada.emit(tipo);
  }
}
