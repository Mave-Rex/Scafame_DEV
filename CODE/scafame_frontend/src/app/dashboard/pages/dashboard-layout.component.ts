import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, FooterComponent, RouterOutlet],
  template: `
    <div class="w-full min-h-screen flex flex-col font-display relative bg-white overflow-x-hidden">


      <!-- BACKDROP sidebar móvil -->
      <div
        class="fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300"
        *ngIf="showSidebarMobile"
        (click)="showSidebarMobile = false">
      </div>

      <!-- SIDEBAR DESPLEGABLE MÓVIL -->
      <div
        class="fixed top-0 left-0 h-screen w-64 bg-black z-40 transform transition-transform duration-300 lg:hidden"
        [class.-translate-x-full]="!showSidebarMobile"
        (click)="$event.stopPropagation()">
        <app-sidebar [collapsed]="false"></app-sidebar>
      </div>

      <!-- SIDEBAR FIJO EN PANTALLAS GRANDES -->
      <div
        class="hidden lg:block fixed top-0 left-0 h-screen z-20 transition-all duration-300"
        [class.w-20]="sidebarCollapsed"
        [class.w-64]="!sidebarCollapsed"
      >
        <app-sidebar
          [collapsed]="sidebarCollapsed"
          [enableToggle]="true"
          (toggleCollapse)="toggleDesktopSidebar()"
        ></app-sidebar>
      </div>

      <!-- HEADER -->
      <header class="w-full z-10">
        <app-header
          (toggleSidebar)="showSidebarMobile = true"
        />
      </header>

      <!-- LOGO SUPERIOR DERECHO -->
      <div class="absolute top-16 right-7 z-20 hidden lg:block">
        <img src="/fame_logo.png" alt="FAME Logo" class="h-16" />
      </div>

      <!-- MAIN -->
      <main
        class="flex-1 bg-white p-6 transition-all duration-300"
        [style.marginLeft.px]="isSidebarHamburger ? 0 : (sidebarCollapsed ? 80 : 256)"
      >
        <div class="max-w-[1200px] mx-auto w-full">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <!-- FOOTER en flujo normal (no fijo) -->
      <div class="w-full transition-all duration-300">
        <div
          class="w-full"
          [style.marginLeft.px]="isSidebarHamburger ? 0 : (sidebarCollapsed ? 80 : 256)"
          [style.width]="isSidebarHamburger ? '100%' : (sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)')"
        >
          <div class="w-full">
            <app-footer></app-footer>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  showSidebarMobile = false;
  isSidebarHamburger = false;
  sidebarCollapsed = true;

  constructor() {
    this.updateSidebarMode();
    window.addEventListener('resize', this.updateSidebarMode.bind(this));
  }

  updateSidebarMode() {
    this.isSidebarHamburger = window.innerWidth < 1024;
  }

  toggleDesktopSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
