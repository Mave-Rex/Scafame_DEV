import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="h-12 bg-black w-full flex items-center justify-between px-4 relative gap-3">
      <!-- Ícono hamburguesa en móvil -->
      <iconify-icon
        icon="mdi:menu"
        class="text-white text-2xl lg:hidden"
        (click)="toggleSidebar.emit()"
      ></iconify-icon>

      <!-- Usuario + logout en desktop -->
      <div class="hidden lg:flex items-center gap-3 ml-auto text-white">
        <span class="text-sm opacity-90">{{ nombre || 'Usuario' }}</span>
        <button
          type="button"
          class="text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10"
          (click)="cerrarSesion()"
        >
          Cerrar Sesión
        </button>
      </div>

      <!-- Logo en móvil, oculto en pantallas grandes -->
      <img
        src="/Logo-BN.png"
        alt="FAME Logo"
        class="h-8 absolute right-4 block lg:hidden"
      />
    </div>
  `
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  @Output() toggleSidebar = new EventEmitter<void>();
  nombre = '';

  ngOnInit(): void {
    this.authService.getPerfilUsuario().subscribe({
      next: (u) => {
        this.nombre = u?.username || '';
      },
      error: () => {
        this.nombre = '';
      },
    });
  }

  cerrarSesion(): void {
    this.toastr.info('Sesión cerrada. ¡Hasta pronto!', 'SCAFAME');
    this.authService.logout();
  }
}
