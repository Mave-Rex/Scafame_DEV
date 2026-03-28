import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <div class="w-screen h-screen overflow-hidden flex flex-col font-display">

      <!-- SIDEBAR -->
      <div class="absolute top-0 left-0 h-screen z-20">
        <app-sidebar></app-sidebar>
      </div>

      <!-- HEADER -->
      <header class="w-full z-10">
        <app-header></app-header>
      </header>

      <!-- LOGO FIJO SUPERIOR DERECHO -->
      <div class="absolute top-12 right-7 z-20">
        <img src="/fame_logo.png" alt="FAME Logo" class="h-16" />
      </div>

      <!-- MAIN -->
      <main class="flex-1 bg-white ml-64 p-6 overflow-hidden">
        <div class="max-w-[1200px] mx-auto w-full h-full">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- FOOTER -->
      <footer class="w-full bg-black text-white text-center py-3 z-10">
        <div class="ml-64">
          <app-footer></app-footer>
        </div>
      </footer>

    </div>
  `
})
export class DashboardLayoutComponent {}

