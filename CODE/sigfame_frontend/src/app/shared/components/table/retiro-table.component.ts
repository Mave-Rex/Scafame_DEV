import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetiroCardComponent } from '../card/retiro-card.component';

@Component({
  selector: 'app-retiro-table',
  standalone: true,
  imports: [CommonModule, RetiroCardComponent],
  template: `
    <div class="bg-black text-white rounded-2xl w-full max-w-6xl mx-auto p-4">
      <div
        class="flex flex-col gap-4 overflow-y-auto max-h-[360px] p-2"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >
        <app-retiro-card
          *ngFor="let retiro of retiros"
          [id]="retiro.id"
          [fecha]="retiro.fecha"
          (verDetalles)="verDetalles.emit(retiro)"
          (aprobar)="aprobar.emit(retiro)"
          (rechazar)="rechazar.emit(retiro)"
        ></app-retiro-card>
      </div>
    </div>
  `
})
export class RetiroTableComponent {
  @Input() retiros: { id: string; fecha: string }[] = [];

  @Output() verDetalles = new EventEmitter<any>();
  @Output() aprobar = new EventEmitter<any>();
  @Output() rechazar = new EventEmitter<any>();
}
