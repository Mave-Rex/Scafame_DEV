import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { ButtonComponent } from '../button/button.component';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../users/services/user.service'; // ⚡ Ajusta la ruta si difiere

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <aside class="bg-black text-white w-64 h-full flex flex-col justify-between p-6 shadow-lg">

      <!-- Usuario -->
      <div class="flex flex-col text-left">
        <div class="flex justify-center mb-6">
          <iconify-icon icon="mdi:account-circle" class="text-8xl"></iconify-icon>
        </div>
        <p class="font-bold text-2xl">Bienvenido,</p>
        <p class="text-xl mt-1">{{ nombre }}</p>

        <div class="mt-10 text-base leading-relaxed">
          <p><strong>Área:</strong> {{ area }}</p>
          <p><strong>Rol:</strong> {{ rol }}</p>
        </div>
      </div>

      <!-- Navegación -->
      <div class="flex flex-col gap-4 mt-10 w-full">

        <!-- Todos los roles -->
        <button
          class="w-full py-2 px-4 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all"
          (click)="navigateTo('home')"
        >
          Inventario
        </button>

        <!-- Solo admins -->
        <button
          *ngIf="rol === 'admin'"
          class="w-full py-2 px-4 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all"
          (click)="navigateTo('users')"
        >
          Usuarios
        </button>
      </div>

      <!-- Botón cerrar sesión -->
      <div class="mt-8">
        <app-button
          label="Cerrar Sesión"
          variant="dark"
          (click)="cerrarSesion()"
        ></app-button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  nombre = '';
  rol = '';
  area = '';

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

  cerrarSesion() {
    this.toastr.info('Sesión cerrada. ¡Hasta pronto!', 'SCAFAME');
    this.authService.logout();
  }

  navigateTo(path: string) {
    this.router.navigate(['/', path]);
  }
}
