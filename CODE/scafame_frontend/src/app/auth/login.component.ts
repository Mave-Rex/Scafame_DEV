import { Component, OnInit, OnDestroy } from '@angular/core';
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

      <!-- Header -->
      <div class="h-10 bg-black w-full flex items-center justify-center text-white text-lg"></div>

      <!-- Contenido principal -->
      <div class="flex flex-col lg:flex-row items-center justify-center gap-10 px-6 py-8 flex-wrap">

        <!-- Logo + Formulario -->
        <div class="flex flex-col items-center gap-6 w-full max-w-md order-1 lg:order-none">
          <img src="/fame_logo.png" alt="Logo FAME" class="h-24 md:h-28 mb-2" />
          
          <div class="bg-black text-white rounded-xl p-6 w-full shadow-md">
            <h1 class="text-2xl font-bold mb-2 tracking-widest text-center">SCAFAME - DEV</h1>
            <h2 class="text-base mb-4 text-center">Inicio de Sesión</h2>
            
            <form (ngSubmit)="onSubmit()" #form="ngForm">
              <!-- Usuario -->
              <div class="mb-3 relative text-left">
                <iconify-icon icon="mdi:account" class="text-[24px] absolute left-2 top-2 text-black w-5 h-5"></iconify-icon>
                <input
                  type="text"
                  name="user"
                  [(ngModel)]="user"
                  required
                  placeholder="Usuario"
                  class="w-full pl-10 pr-3 py-2 rounded-md text-black"
                />
              </div>

              <!-- Contraseña -->
              <div class="mb-4 relative text-left">
                <iconify-icon icon="mdi:lock" class="text-[24px] absolute left-2 top-2 text-black w-5 h-5"></iconify-icon>
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
                  class="absolute right-3 top-2 text-gray-500 text-[24px] w-5 h-5 cursor-pointer"
                  (click)="togglePasswordVisibility()"
                ></iconify-icon>
              </div>

              <!-- Botón -->
              <button
                type="submit"
                class="bg-white text-black font-semibold py-2 px-4 rounded-md w-full hover:bg-gray-100 transition flex justify-center items-center gap-2"
              >
                <iconify-icon icon="mdi:login" class="text-[24px] w-5 h-5"></iconify-icon>
                Ingresar
              </button>
            </form>
          </div>
        </div>

        <!-- Carrusel de Imágenes -->
        <div class="relative w-full max-w-[280px] md:max-w-[400px] rounded-xl border-2 border-black overflow-hidden order-2 lg:order-none">
          <img
            [src]="currentImage"
            class="w-full h-auto object-cover transition-opacity duration-500"
            alt="Imagen Carrusel"
          />
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-black text-white text-center text-sm py-4 px-4">
        <p class="mb-1 font-semibold">¿Necesitas Ayuda?</p>
        <p>
          Contáctanos: 
          <a href="mailto:soporte_ti@fame.ec" class="underline">soporte_ti&#64;fame.ec</a>
        </p>
        <p class="mt-1">©FAME S.A 2025</p>
        <span class="text-gray-600">Versión 1.2.0</span>
      </footer>
    </div>
  `,
})
export class LoginComponent implements OnInit, OnDestroy {
  user = '';
  password = '';
  showPassword = false;

  imageList = [
    '/carrusel1.png',
    '/carrusel2.png',
    '/carrusel3.png',
    '/carrusel4.png'
  ];
  currentImage = this.imageList[0];
  private imageIndex = 0;
  private intervalId: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.imageIndex = (this.imageIndex + 1) % this.imageList.length;
      this.currentImage = this.imageList[this.imageIndex];
    }, 3500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.authService.login(this.user, this.password).subscribe({
      next: (res) => {
        this.authService.saveToken(res.access_token);
        this.toastr.success('Bienvenido a SCAFAME');
        this.router.navigate(['/home']);
      },
      error: () => {
        this.toastr.error('Credenciales incorrectas o servidor no disponible');
      },
    });
  }
}
