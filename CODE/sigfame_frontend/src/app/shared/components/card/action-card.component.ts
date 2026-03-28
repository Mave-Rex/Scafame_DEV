import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-action-card',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      class="bg-black text-white rounded-xl p-4 w-52 h-40 flex flex-col items-center justify-center text-center 
             hover:scale-105 hover:bg-white hover:text-black hover:border hover:border-black 
             transition cursor-pointer"
      (click)="clicked.emit()"
    >
      <iconify-icon [icon]="icon" class="text-5xl mb-3 transition-colors text-current"></iconify-icon>
      <span class="text-base font-bold leading-tight">{{ label }}</span>
    </div>
  `
})
export class ActionCardComponent {
  @Input() label = 'Acción';
  @Input() icon = 'mdi:cube';
  @Output() clicked = new EventEmitter<void>();
}
