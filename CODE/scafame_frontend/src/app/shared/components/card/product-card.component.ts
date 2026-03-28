import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';

type MinimalProduct = {
  name?: string | null;
  image?: string | null;
  unit?: string | null; 
};

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ImageUrlPipe],
  template: `
    <div
      class="rounded-xl w-40 h-60 text-black flex flex-col justify-between items-center transition-all duration-200 p-3"
      [ngClass]="{
        'bg-green-100 ring-4 ring-green-400 scale-103 shadow-2xl': selected,
        'bg-white shadow-md': !selected
      }"
    >
      <!-- Imagen -->
      <div class="w-24 h-24 rounded-md overflow-hidden bg-gray-300 flex items-center justify-center">
        <img
          *ngIf="imageResolved; else noImgTpl"
          [src]="imageResolved | imageUrl"
          [alt]="nameResolved || 'Producto'"
          class="h-24 w-24 rounded-lg object-cover"
        />
        <ng-template #noImgTpl>
          <span class="text-xs font-bold text-black">Sin imagen</span>
        </ng-template>
      </div>

      <!-- Info -->
      <div class="text-xs text-center mt-2 leading-tight">
        <p class="font-bold text-[11px]">Producto</p>
        <p class="text-[11px] text-center break-words line-clamp-2">
          {{ nameResolved || '—' }}
        </p>


        <p class="font-bold mt-1 text-[11px]">Stock</p>

        <!-- Stock + Unidad -->
        <div
          class="flex items-center justify-center gap-1"
          [attr.aria-label]="'Stock: ' + (stock === 0 ? 'Agotado' : stock) + (showUnit && unitResolved ? ' ' + unitResolved : '')"
        >
          <span
            class="text-[11px]"
            [ngClass]="{ 'text-red-600 font-bold': stock === 0 }"
          >
            {{ stock === 0 ? 'Agotado' : stock }}
          </span>

          <!-- Pill de unidad -->
          <span
            *ngIf="showUnit && unitResolved"
            class="text-[10px] leading-none px-1.5 py-[1px] rounded-full border"
            [ngClass]="{
              'border-gray-400 text-gray-700': stock > 0,
              'border-gray-300 text-gray-400': stock === 0
            }"
          >
            {{ unitResolved }}
          </span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="w-full mt-2">
        <div *ngIf="!mostrarAccion" class="flex justify-center">
          <button
            class="bg-black text-white text-[10px] px-3 py-[4px] rounded-full font-bold"
            (click)="verDetalles.emit()"
          >
            Detalles
          </button>
        </div>

        <div *ngIf="mostrarAccion" class="flex justify-between items-center px-1">
          <button
            class="bg-black text-white text-[10px] px-3 py-[4px] rounded-full font-bold"
            (click)="verDetalles.emit()"
          >
            Detalles
          </button>

          <div class="flex gap-1">
            <!-- Botón Agregar -->
            <button
              class="text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold"
              [ngClass]="{
                'bg-black text-white': modoIngreso || stock > 0,
                'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60': !modoIngreso && stock === 0
              }"
              [disabled]="!modoIngreso && stock === 0"
              (click)="accion.emit()"
              aria-label="Agregar"
              title="Agregar"
            >
              +
            </button>

            <!-- Botón Remover -->
            <button
              class="bg-red-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full"
              (click)="remover.emit()"
              aria-label="Remover"
              title="Remover"
            >
              -
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  /** Opción 1: pasar el objeto producto completo */
  @Input() product?: MinimalProduct | null;

  /** Opción 2: props planos (fallback si no se pasa product) */
  @Input() nombre: string = 'Producto';
  @Input() imagen?: string | null;
  @Input() stock: number = 0;

  /** NUEVO: unidad (por ejemplo: 'kg', 'u', 'L'). Se puede pasar por `product.unit` o por esta prop. */
  @Input() unit?: string | null;

  /** Mostrar/ocultar la pill de unidad */
  @Input() showUnit: boolean = false;

  @Input() mostrarAccion: boolean = true;
  @Input() selected: boolean = false;

  /** Define si estamos en modo ingreso (true) o modo retiro (false, por defecto) */
  @Input() modoIngreso: boolean = false;

  @Output() verDetalles = new EventEmitter<void>();
  @Output() accion = new EventEmitter<void>();
  @Output() remover = new EventEmitter<void>();

  /** Resueltos para plantilla */
  get nameResolved(): string {
    return (this.product?.name ?? this.nombre ?? '').toString();
  }

  get imageResolved(): string | null {
    const v = this.product?.image ?? this.imagen ?? null;
    return (v === undefined || v === '') ? null : (v as string | null);
  }

  /** Unidad prioriza la que venga en `product.unit`, luego `@Input() unit` */
  get unitResolved(): string | null {
    const u = (this.product as any)?.unit ?? this.unit ?? null;
    return (u === undefined || u === '') ? null : String(u);
  }
}
