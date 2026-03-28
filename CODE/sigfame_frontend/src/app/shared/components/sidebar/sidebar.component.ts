import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { ButtonComponent } from '../button/button.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <aside class="w-64 ml-8 bg-black text-white h-full flex flex-col items-center justify-between p-6 shadow-lg">
      <div class="flex flex-col items-center text-center">
        <iconify-icon icon="mdi:account-circle" class="text-8xl mb-6"></iconify-icon>
        <p class="font-bold text-2xl">Bienvenido,</p>
        <p class="text-xl mt-1">{{ nombre }}</p>

        <div class="mt-10 text-base leading-relaxed">
          <p><strong>Área:</strong> {{ area }}</p>
          <p><strong>Rol:</strong> {{ rol }}</p>
        </div>
      </div>

      <div class="text-center mt-8">
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
  private router = inject(Router);
  private toastr = inject(ToastrService);

  nombre = '';
  rol = '';
  area = '';

  ngOnInit() {
    this.authService.getPerfilUsuario().subscribe({
      next: (usuario) => {
        this.nombre = usuario.username;
        this.rol = usuario.role;
        this.area = usuario.area;
      },
      error: (err) => {
        console.error('No se pudo obtener el perfil del usuario:', err);
        this.authService.logout();
      }
    });
  }

  cerrarSesion() {
    this.toastr.info('Sesión cerrada. ¡Hasta pronto!', 'SIGFAME');
    this.authService.logout();
  }
}