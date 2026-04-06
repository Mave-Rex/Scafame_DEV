import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../users/services/user.service'; // ⚡ Ajusta la ruta si difiere

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <aside
      class="relative bg-black text-white h-full flex flex-col justify-start py-4 px-3 shadow-lg transition-all duration-300"
      [class.w-20]="collapsed"
      [class.w-64]="!collapsed"
    >
      <div *ngIf="enableToggle" class="absolute top-3 left-10 -translate-x-1/2 z-10">
        <button
          type="button"
          class="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10"
          title="Expandir o contraer menú"
          aria-label="Expandir o contraer menú"
          (click)="toggleCollapse.emit()"
        >
          <iconify-icon icon="mdi:menu" class="text-2xl"></iconify-icon>
        </button>
      </div>

      <!-- Usuario -->
      <div class="flex flex-col text-left mt-12">
        <div class="flex justify-center mb-3 mt-1">
          <iconify-icon icon="mdi:account-circle" [class.text-5xl]="collapsed" [class.text-8xl]="!collapsed"></iconify-icon>
        </div>
        <ng-container *ngIf="!collapsed">
          <p class="font-bold text-2xl">Bienvenido,</p>
          <p class="text-xl mt-1">{{ nombre }}</p>

          <div class="mt-8 text-base leading-relaxed">
            <p><strong>Área:</strong> {{ area }}</p>
            <p><strong>Rol:</strong> {{ rol }}</p>
          </div>
        </ng-container>
      </div>

      <!-- Navegación -->
      <div
        class="flex flex-col items-center gap-3 w-full"
        [class.mt-5]="!collapsed"
        [class.mt-14]="collapsed"
      >

        <!-- Todos los roles -->
        <button
          class="w-full py-2 px-3 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          (click)="navigateTo('home')"
        >
          <iconify-icon icon="mdi:warehouse" class="text-lg"></iconify-icon>
          <span *ngIf="!collapsed">Inventario</span>
        </button>

        <!-- Solo admins -->
        <button
          *ngIf="rol === 'admin'"
          class="w-full py-2 px-3 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
          (click)="navigateTo('users')"
        >
          <iconify-icon icon="mdi:account-group" class="text-lg"></iconify-icon>
          <span *ngIf="!collapsed">Usuarios</span>
        </button>
      </div>

      <div class="mt-auto pt-4 text-[11px] text-white/70 text-center" *ngIf="!collapsed">SCAFAME</div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  nombre = '';
  rol = '';
  area = '';
  @Input() collapsed = false;
  @Input() enableToggle = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  ngOnInit() {
    this.authService.getPerfilUsuario().subscribe({
      next: (usuario) => {
        // fallback inicial
        this.nombre = usuario.username;
        this.rol = usuario.role;
        this.area = usuario.area;

        // ⚡ Intentar obtener nombres reales con userId
        const id = this.authService.getUserId();
        if (id) {
          this.userService.getById(id).subscribe({
            next: (u) => {
              const fullName = `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim();
              if (fullName) this.nombre = fullName;
            },
            error: () => {
              // si falla, dejamos el username
            }
          });
        }
      },
      error: (err) => {
        console.error('No se pudo obtener el perfil del usuario:', err);
        this.authService.logout();
      }
    });

    // Escuchar evento para cerrar el sidebar móvil si aplica
    window.addEventListener('closeSidebar', () => {
      const aside = document.querySelector('aside');
      aside?.classList.remove('!translate-x-0');
    });
  }

  navigateTo(path: string) {
    this.router.navigate(['/', path]);
  }
}
