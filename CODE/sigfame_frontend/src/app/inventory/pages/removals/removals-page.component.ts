import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionCardComponent } from '../../../shared/components/card/action-card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-removals-page',
  standalone: true,
  imports: [CommonModule, ActionCardComponent, ButtonComponent],
  template: `
    <main class="p-8 font-display min-h-[calc(100vh-120px)] flex items-center">
      <div class="max-w-[1100px] mx-auto w-full flex flex-col items-center justify-center">

        <!-- Título -->
        <h1 class="text-4xl font-bold text-black text-center mb-12">Retiros</h1>

        <!-- Tarjetas -->
        <div class="flex flex-wrap justify-center gap-10 mb-12">
          <app-action-card
            icon="mdi:package-variant-minus"
            label="Solicitar Retiro"
            (clicked)="goTo('request')"
          ></app-action-card>

          <app-action-card
            icon="mdi:clipboard-list-outline"
            label="Administrar Retiros"
            (clicked)="goTo('manage')"
          ></app-action-card>
        </div>

        <!-- Botón Volver -->
        <div class="w-full flex justify-end">
          <app-button label="Volver" variant="light" (click)="goBack()"></app-button>
        </div>

      </div>
    </main>
  `
})
export class RemovalsPageComponent {
  constructor(private router: Router) {}

  goTo(path: string) {
    this.router.navigate(['/removals', path]);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
