import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled"
      [ngClass]="variant === 'light' ? 'bg-black text-white' : 'bg-white text-black'"
      class="px-4 py-2 rounded font-semibold w-full transition duration-200 ease-in-out
             hover:bg-gray-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ label }}
    </button>
  `
})
export class ButtonComponent {
  @Input() label = 'Click';
  @Input() variant: 'light' | 'dark' = 'dark';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
}
