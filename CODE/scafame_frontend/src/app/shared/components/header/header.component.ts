import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="h-10 bg-black w-full flex items-center justify-between px-4 lg:justify-center relative">
      <!-- Ícono hamburguesa en móvil -->
      <iconify-icon
        icon="mdi:menu"
        class="text-white text-2xl lg:hidden"
        (click)="toggleSidebar.emit()"
      ></iconify-icon>

      <!-- Logo en móvil, oculto en pantallas grandes -->
      <img
        src="/Logo-BN.png"
        alt="FAME Logo"
        class="h-8 absolute right-4 block lg:hidden"
      />
    </div>
  `
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
}
