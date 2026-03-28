import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-white font-['Share_Tech_Mono']">
      
      <!-- Header barra negra -->
      <div class="h-10 bg-black w-full flex items-center justify-center text-white text-lg"></div>
      
      <!-- Contenido principal -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-16 px-4 pt-12">
        
        <!-- Sección de logo y formulario -->
        <div class="flex flex-col items-center gap-6">
          <img src="/fame_logo.png" alt="Logo FAME" class="h-28 md:h-32 mb-2" />
          
          <div class="bg-black text-white rounded-xl p-6 w-96 text-center relative">
            <h1 class="text-2xl font-bold mb-2 tracking-widest">SIGFAME - DEV</h1>
            <h2 class="text-base mb-4">Inicio de Sesión</h2>
            
            <form (ngSubmit)="onSubmit()" #form="ngForm">
              <div class="mb-3 relative text-left">
                <iconify-icon icon="mdi:account" class="text-[28px] absolute left-2 top-1.5 text-black w-5 h-5"></iconify-icon>
                <input
                  type="user"
                  name="user"
                  [(ngModel)]="user"
                  required
                  placeholder="Correo"
                  class="w-full pl-10 pr-3 py-2 rounded-md text-black"
                />
              </div>
              
              <div class="mb-4 relative text-left">
                <iconify-icon icon="mdi:lock" class="text-[28px] absolute left-2 top-1.5 text-black w-5 h-5"></iconify-icon>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  [(ngModel)]="password"
                  required
                  placeholder="Contraseña"
                  class="w-full pl-10 pr-10 py-2 rounded-md text-black"
                />
                <iconify-icon
                  [icon]="showPassword ? 'mdi:eye-off' : 'mdi:eye'"
                  class="absolute right-4 top-1.5 text-gray-500 text-[28px] w-5 h-5 cursor-pointer"
                  (click)="togglePasswordVisibility()"
                ></iconify-icon>
              </div>
              
              <button
                type="submit"
                class="bg-white text-black font-semibold py-2 px-4 rounded-md w-full hover:bg-gray-100 transition"
              >
                Ingresar
                <iconify-icon icon="mdi:login" class="text-[28px] mr-1 w-5 h-7 align-middle"></iconify-icon>
              </button>
            </form>
          </div>
        </div>

        <!-- Imagen institucional -->
        <img
          src="/rotulo.png"
          alt="Imagen Institucional"
          class="w-[300px] md:w-[450px] rounded-xl border-2 border-black"
        />
      </div>

      <!-- Footer -->
      <footer class="bg-black text-white text-center text-sm py-4 mt-8">
        <p class="mb-1 font-semibold">
          ¿Necesitas Ayuda?
        </p>
        <p>
          Contáctanos:
          <a href="mailto:soporte_ti@fame.ec" class="underline">soporte_ti&#64;fame.ec</a>
        </p>
        <p class="mt-1">
          ©FAME S.A 2024
        </p>
      </footer>
    </div>
  `,
})
export class LoginComponent {
  user = '';
  password = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.authService.login(this.user, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.access_token);
        this.toastr.success('Bienvenido a SIGFAME');
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toastr.error('Credenciales incorrectas o servidor no disponible');
      },
    });
  }
}
