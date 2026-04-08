import { Component, OnInit, OnDestroy, inject, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../../users/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <aside
      class="relative bg-black text-white h-full flex flex-col justify-start py-4 px-3 shadow-lg transition-all duration-300 overflow-hidden"
      [class.w-20]="collapsed"
      [class.w-64]="!collapsed"
    >
      <!-- Usuario -->
      <div class="flex flex-col text-left mt-4 min-h-[272px]">
        <div class="flex justify-center items-center h-32 mb-3 mt-1">
          <iconify-icon
            icon="mdi:account-circle"
            class="text-7xl transition-all duration-300 ease-out will-change-transform"
            [style.transform]="collapsed ? 'scale(0.72)' : 'scale(1)'"
            [style.opacity]="collapsed ? '0.92' : '1'"
            [style.transitionDelay.ms]="collapsed ? 0 : 70"
          ></iconify-icon>
        </div>
        <div
          class="transition-opacity duration-150"
          [class.opacity-0]="collapsed"
          [class.opacity-100]="!collapsed"
          [class.pointer-events-none]="collapsed"
          [style.transitionDelay.ms]="collapsed ? 0 : 170"
        >
          <p class="font-bold text-2xl whitespace-nowrap">Bienvenido,</p>
          <p class="text-xl mt-1 whitespace-nowrap">{{ nombre }}</p>

          <div class="mt-8 text-base leading-relaxed">
            <p class="whitespace-nowrap"><strong>Área:</strong> {{ area }}</p>
            <p class="whitespace-nowrap"><strong>Rol:</strong> {{ rol }}</p>
          </div>
        </div>
      </div>

      <!-- Navegación -->
      <div
        class="flex flex-col gap-4 w-full mt-7"
      >
        <!-- Todos los roles -->
        <button
          class="w-full py-2 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all flex items-center"
          [class.justify-center]="collapsed"
          (click)="navigateTo('home')"
        >
          <span class="flex-shrink-0 flex justify-center" [class.w-[44px]]="!collapsed">
            <iconify-icon icon="mdi:warehouse" class="text-lg"></iconify-icon>
          </span>
          <span *ngIf="!collapsed" class="truncate pr-2 whitespace-nowrap">Inventario</span>
        </button>

        <!-- Solo admins -->
        <button
          *ngIf="rol === 'admin'"
          class="w-full py-2 bg-white text-black rounded-lg border border-white hover:bg-gray-300 transition-all flex items-center"
          [class.justify-center]="collapsed"
          (click)="navigateTo('users')"
        >
          <span class="flex-shrink-0 flex justify-center" [class.w-[44px]]="!collapsed">
            <iconify-icon icon="mdi:account-group" class="text-lg"></iconify-icon>
          </span>
          <span *ngIf="!collapsed" class="truncate pr-2 whitespace-nowrap">Usuarios</span>
        </button>
      </div>

      <div class="mt-auto pt-4 text-[11px] text-white/70 text-center" *ngIf="!collapsed">SCAFAME</div>
    </aside>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  nombre = '';
  rol = '';
  area = '';
  @Input() collapsed = false;

  ngOnInit() {
    this.authService.getPerfilUsuario().pipe(
      switchMap((usuario) => {
        this.nombre = usuario.username;
        this.rol = usuario.role;
        this.area = usuario.area;
        const id = this.authService.getUserId();
        return id ? this.userService.getById(id) : of(null);
      })
    ).subscribe({
      next: (u) => {
        if (u) {
          const fullName = `${u.firstname ?? ''} ${u.lastname ?? ''}`.trim();
          if (fullName) this.nombre = fullName;
        }
      },
      error: (err) => {
        console.error('No se pudo obtener el perfil del usuario:', err);
        this.authService.logout();
      }
    });
  }

  ngOnDestroy() {}

  navigateTo(path: string) {
    this.router.navigate(['/', path]);
  }
}
