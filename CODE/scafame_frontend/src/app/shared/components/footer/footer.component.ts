import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-black text-white text-center text-sm py-2 px-4 w-full mt-auto lg:pl-20">
      <div class="w-full">
        <p class="mb-1 font-semibold">¿Necesitas Ayuda?</p>
        <p>
          Contáctanos: 
          <a href="mailto:soporte_ti@fame.ec" class="underline">soporte_ti&#64;fame.ec</a>
        </p>
        <p class="mt-1">©FAME S.A 2025 </p>
      </div>
    </footer>
  `
})
export class FooterComponent {}
