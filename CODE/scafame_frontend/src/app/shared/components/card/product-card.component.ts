import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div
      class="rounded-2xl text-black flex flex-col justify-between items-center transition-all duration-200 p-4 h-[22rem] w-full max-w-[18rem]"
      [ngClass]="{
        'bg-green-100 ring-4 ring-green-500 shadow-2xl scale-105': selected,
        'bg-white shadow-lg hover:shadow-xl hover:scale-102': !selected
      }"
    >
      <!-- Imagen -->
      <div class="w-28 h-28 rounded-lg overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
        <img
          *ngIf="imageResolved; else noImgTpl"
          [src]="imageResolved | imageUrl"
          [alt]="nameResolved || 'Producto'"
          class="h-28 w-28 rounded-lg object-cover"
        />
        <ng-template #noImgTpl>
          <span class="text-sm font-bold text-black">Sin imagen</span>
        </ng-template>
      </div>

      <!-- Info -->
      <div class="text-sm text-center mt-3 leading-tight flex-grow">
        <p class="font-bold text-xs text-gray-600 uppercase">{{ nameResolved || '—' }}</p>
        
        <p class="font-semibold mt-2 text-base">Stock</p>

        <!-- Stock + Unidad -->
        <div
          class="flex items-center justify-center gap-2 mt-1"
          [attr.aria-label]="'Stock: ' + (stock === 0 ? 'Agotado' : stock) + (showUnit && unitResolved ? ' ' + unitResolved : '')"
        >
          <span
            class="text-2xl font-bold"
            [ngClass]="{ 'text-red-600': stock === 0, 'text-green-600': stock > 0 }"
          >
            {{ stock === 0 ? '0' : stock }}
          </span>

          <!-- Pill de unidad -->
          <span
            *ngIf="showUnit && unitResolved"
            class="text-xs leading-none px-2 py-1 rounded-full border font-semibold"
            [ngClass]="{
              'border-green-400 bg-green-50 text-green-700': stock > 0,
              'border-gray-300 bg-gray-50 text-gray-400': stock === 0
            }"
          >
            {{ unitResolved }}
          </span>
        </div>

        <!-- Estado si está agotado -->
        <p *ngIf="stock === 0" class="text-xs text-red-600 font-semibold mt-2">AGOTADO</p>
      </div>

      <!-- Acciones -->
      <div class="w-full mt-4 flex flex-col gap-2">
        <div *ngIf="!mostrarAccion" class="flex justify-center">
          <button
            class="bg-black text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 w-full"
            (click)="$event.stopPropagation(); verDetalles.emit()"
          >
            Detalles
          </button>
        </div>

        <div *ngIf="mostrarAccion" class="flex flex-col gap-2">
          <div class="flex gap-2">
            <!-- Botón Agregar (más grande) -->
            <button
              class="text-lg w-10 h-10 flex items-center justify-center rounded-full font-bold flex-shrink-0 transition-all"
              [ngClass]="{
                'bg-green-500 text-white hover:bg-green-600 shadow-md': modoIngreso || stock > 0,
                'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50': !modoIngreso && stock === 0
              }"
              [disabled]="!modoIngreso && stock === 0"
              (click)="$event.stopPropagation(); accion.emit()"
              aria-label="Agregar producto"
              title="Agregar"
            >
              +
            </button>

            <!-- Botón Remover (más grande) -->
            <button
              class="bg-red-500 text-white text-lg w-10 h-10 flex items-center justify-center rounded-full font-bold flex-shrink-0 hover:bg-red-600 transition-all shadow-md"
              (click)="$event.stopPropagation(); remover.emit()"
              aria-label="Remover producto"
              title="Remover"
            >
              −
            </button>

            <button
              class="bg-black text-white text-sm px-3 py-1 rounded-lg font-semibold hover:bg-gray-800 flex-grow"
              (click)="$event.stopPropagation(); verDetalles.emit()"
            >
              Ver
            </button>
          </div>

          <!-- Información de cantidad si está seleccionado -->
          <div *ngIf="selected" class="bg-green-50 border border-green-300 rounded-lg p-2 text-center">
            <p class="text-xs text-green-700 font-semibold">
              <iconify-icon icon="mdi:check-circle" class="text-sm"></iconify-icon>
              Seleccionado
            </p>
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
