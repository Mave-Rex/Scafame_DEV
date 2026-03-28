import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { ToastrService } from 'ngx-toastr';

import { CategoryService, Category } from '../../../services/category.service';
import { ProductService, Product } from '../../../services/product.service';
import { UnitService, Unit } from '../../../services/unit.service';

import { normalizeImage } from '../../../shared/utils/url.util';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';

type Elemento = {
  id: number;
  nombre: string;
  descripcion: string;
  // Solo Unidad:
  abreviacion?: string | null;
  // Solo Producto:
  categoriaId?: number | null;
  unidadId?: number | null;
  categoriaNombre?: string | null;
  unidadNombre?: string | null;
  unidadAbrev?: string | null;
  imagen?: string | null; // ← ruta normalizada (p.ej. /uploads/abc.jpg)
};

@Component({
  selector: 'app-editar-formulario',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, ButtonComponent, ImageUrlPipe],
  template: `
    <div class="bg-black text-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto text-center font-display">

      <!-- Buscador -->
      <div class="flex items-center border border-black rounded-full px-4 py-2 w-full max-w-lg mx-auto mb-4 sm:mb-6 bg-white">
        <iconify-icon icon="mdi:magnify" class="text-black text-xl mr-2"></iconify-icon>
        <input
          [(ngModel)]="searchQuery"
          (input)="resetSeleccion()"
          type="text"
          [placeholder]="'Buscar ' + placeholderPorTipo"
          class="w-full bg-transparent outline-none text-black"
        />
      </div>

      <!-- Lista de resultados -->
      <div
        *ngIf="searchQuery && !selectedItem"
        class="grid grid-cols-1 gap-3 overflow-y-auto max-h-[260px] p-2"
        style="scrollbar-width: thin; scrollbar-color: white black;"
      >
        <ng-container *ngIf="resultadosFiltrados()?.length; else noRes">
          <div
            *ngFor="let item of resultadosFiltrados()"
            (click)="seleccionar(item)"
            class="cursor-pointer bg-white text-black rounded-xl w-full px-4 py-3 text-left shadow hover:ring-2 hover:ring-blue-500 transition"
          >
            <p class="font-bold text-base sm:text-lg flex flex-wrap items-center gap-2">
              <span>{{ item.nombre }}</span>
              <span *ngIf="tipo==='Unidad' && (item.abreviacion || item.unidadAbrev)" class="opacity-70">
                ({{ item.abreviacion || item.unidadAbrev }})
              </span>
            </p>
            <p class="text-xs opacity-60">ID: {{ item.id }}</p>
            <p class="text-xs opacity-60" *ngIf="tipo==='Producto' && (item.categoriaNombre || item.unidadNombre)">
              <span *ngIf="item.categoriaNombre">Categoría: {{ item.categoriaNombre }}</span>
              <span *ngIf="item.categoriaNombre && item.unidadNombre"> · </span>
              <span *ngIf="item.unidadNombre">Unidad: {{ item.unidadNombre }} <ng-container *ngIf="item.unidadAbrev">({{ item.unidadAbrev }})</ng-container></span>
            </p>
          </div>
        </ng-container>
        <ng-template #noRes>
          <div class="bg-white/90 text-gray-800 rounded-xl p-4 text-center border">
            No se encontraron resultados.
          </div>
        </ng-template>
      </div>

      <!-- Previsualización (antes de editar) -->
      <div
        *ngIf="selectedItem"
        class="bg-white text-black rounded-2xl p-4 sm:p-5 mb-4 w-full max-w-2xl mx-auto text-left shadow"
      >
        <div class="flex items-start gap-4">
          <!-- Imagen del producto (solo si hay imagen) -->
          <div *ngIf="tipo === 'Producto'" class="shrink-0">
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-black/10 bg-black/5 flex items-center justify-center">
              <img
                *ngIf="selectedItemImagen; else noImg"
                [src]="selectedItemImagen | imageUrl"
                alt="Imagen de {{ selectedItem.nombre }}"
                class="w-full h-full object-cover"
                (error)="onImgError()"
              />
              <ng-template #noImg>
                <div class="text-[11px] text-black/60 px-2 text-center leading-tight">
                  Sin<br/>imagen
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Datos -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-lg mb-1 flex flex-wrap items-center gap-2">
              <span class="truncate">{{ selectedItem.nombre }}</span>
              <span *ngIf="tipo==='Unidad' && (selectedItem.abreviacion || selectedItem.unidadAbrev)" class="opacity-70">
                ({{ selectedItem.abreviacion || selectedItem.unidadAbrev }})
              </span>
            </p>
            <p class="text-xs opacity-70 mb-2">ID: {{ selectedItem.id }}</p>

            <div *ngIf="tipo==='Producto'" class="text-sm text-gray-800 space-y-0.5">
              <div *ngIf="selectedItem.categoriaNombre"><span class="font-semibold">Categoría:</span> {{ selectedItem.categoriaNombre }}</div>
              <div *ngIf="selectedItem.unidadNombre">
                <span class="font-semibold">Unidad:</span> {{ selectedItem.unidadNombre }}
                <ng-container *ngIf="selectedItem.unidadAbrev"> ({{ selectedItem.unidadAbrev }})</ng-container>
              </div>
            </div>

            <p class="text-sm mt-3 whitespace-pre-line" *ngIf="selectedItem.descripcion">{{ selectedItem.descripcion }}</p>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center justify-center gap-3" *ngIf="selectedItem">
        <app-button
          variant="dark"
          [label]="'Editar ' + tipo"
          (click)="abrirModal()"
        ></app-button>
        <app-button
          variant="light"
          label="Limpiar selección"
          (click)="resetSeleccion(true)"
        ></app-button>
      </div>

      <!-- Loader -->
      <div *ngIf="isLoading" class="mt-6 text-sm opacity-80">
        Cargando {{ tipo.toLowerCase() }}s…
      </div>

      <!-- Modal de edición -->
      <div
        *ngIf="modalAbierto"
        class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white text-black rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 font-display text-left shadow-lg relative">
          <h3 class="text-xl font-bold mb-4">Editar {{ tipo }}</h3>

          <!-- Nombre -->
          <label class="block mb-1 text-sm font-semibold">Nombre <span class="text-red-600">*</span></label>
          <input
            [(ngModel)]="editedItem.nombre"
            (ngModelChange)="onNombreChange($event)"
            [maxlength]="MAX_NAME"
            class="w-full border border-black rounded px-3 py-2 mb-1"
            type="text"
          />
          <div class="text-[11px] text-gray-500 mb-3">{{ (editedItem.nombre || '').length }} / {{ MAX_NAME }}</div>

          <!-- Abreviación: solo Unidad -->
          <ng-container *ngIf="tipo==='Unidad'">
            <label class="block mb-1 text-sm font-semibold">Abreviación</label>
            <input
              [(ngModel)]="editedItem.abreviacion"
              (ngModelChange)="onAbreviacionChange($event)"
              [maxlength]="MAX_ABBR"
              class="w-full border border-black rounded px-3 py-2 mb-1"
              type="text"
              placeholder="Ej: KG, UND..."
            />
            <div class="text-[11px] text-gray-500 mb-3">{{ (editedItem.abreviacion || '').length }} / {{ MAX_ABBR }}</div>
          </ng-container>

          <!-- Descripción -->
          <label class="block mb-1 text-sm font-semibold">
            Descripción <span *ngIf="tipo!=='Unidad'" class="text-red-600">*</span>
          </label>
          <textarea
            [(ngModel)]="editedItem.descripcion"
            (ngModelChange)="onDescripcionChange($event)"
            [maxlength]="MAX_DESC"
            class="w-full border border-black rounded px-3 py-2 mb-1"
            rows="3"
          ></textarea>
          <div class="text-[11px] text-gray-500 mb-3">{{ (editedItem.descripcion || '').length }} / {{ MAX_DESC }}</div>

          <!-- Producto: Categoría y Unidad (opcionales) -->
          <ng-container *ngIf="tipo==='Producto'">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block mb-1 text-sm font-semibold">Categoría</label>
                <select
                  [(ngModel)]="editedItem.categoriaId"
                  class="w-full border border-black rounded px-3 py-2"
                >
                  <option [ngValue]="null">— Sin cambio —</option>
                  <option *ngFor="let c of categorias" [ngValue]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block mb-1 text-sm font-semibold">Unidad</label>
                <select
                  [(ngModel)]="editedItem.unidadId"
                  class="w-full border border-black rounded px-3 py-2"
                >
                  <option [ngValue]="null">— Sin cambio —</option>
                  <option *ngFor="let u of unidades" [ngValue]="u.id">
                    {{ u.abbreviation || u.name || ('ID ' + u.id) }}
                  </option>
                </select>
              </div>
            </div>
            <p class="text-[11px] text-gray-600 mt-1">
              Estos campos se enviarán solo si cambian y tu backend los soporta.
            </p>

            <!-- Imagen del producto -->
            <div class="mt-4">
              <label class="block mb-2 text-sm font-semibold">Imagen del producto</label>

              <!-- Vista / Dropzone -->
              <div
                class="rounded-xl border border-dashed border-gray-400 bg-gray-50 p-3 flex gap-3 items-center"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event)"
              >
                <div class="w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <img
                    *ngIf="previewUrl || editedItemImagenActual; else noImgModal"
                    [src]="(previewUrl || editedItemImagenActual) | imageUrl"
                    class="w-full h-full object-cover"
                    alt="Previsualización"
                    (error)="onPreviewError()"
                  />
                  <ng-template #noImgModal>
                    <span class="text-[10px] text-gray-500 text-center px-2 leading-tight">Sin imagen</span>
                  </ng-template>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-600">
                    Arrastra y suelta una imagen aquí o
                    <label class="underline cursor-pointer"> selecciónala
                      <input #fileInput type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden" (change)="onFileChange($event)" />
                    </label>.
                  </p>
                  <p class="text-[11px] text-gray-500">Formatos: JPG/PNG/WEBP · Máx: 5&nbsp;MB</p>

                  <div class="flex gap-2 mt-2 flex-wrap">
                    <button type="button" class="px-3 py-1 text-sm rounded bg-gray-200" (click)="fileInput.click()">Cambiar</button>
                    <button
                      type="button"
                      class="px-3 py-1 text-sm rounded"
                      [class.bg-red-600]="!!editedRemoveImage"
                      [class.text-white]="!!editedRemoveImage"
                      [class.bg-gray-200]="!editedRemoveImage"
                      (click)="toggleRemoveImage()"
                    >
                      {{ editedRemoveImage ? 'Restaurar imagen' : 'Quitar imagen' }}
                    </button>
                    <button
                      *ngIf="previewUrl"
                      type="button"
                      class="px-3 py-1 text-sm rounded bg-gray-200"
                      (click)="clearSelectedFile()"
                    >
                      Quitar archivo
                    </button>
                  </div>

                  <div *ngIf="imgValidationMsg" class="text-[12px] text-red-600 mt-1">{{ imgValidationMsg }}</div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Validaciones -->
          <div class="text-[12px] text-red-600 mt-2 space-y-1">
            <div *ngIf="!nombreValido">El nombre es obligatorio.</div>
            <div *ngIf="descRequeridaYVacia">La descripción es obligatoria.</div>
            <div *ngIf="abbrMuyLarga">La abreviación no debe superar {{ MAX_ABBR }} caracteres.</div>
            <div *ngIf="duplicadoPorNombre">Ya existe un elemento con ese nombre.</div>
          </div>

          <div class="flex justify-end gap-3 mt-6 flex-wrap">
            <app-button
              variant="light"
              label="Cancelar"
              (click)="cerrarModal()"
            ></app-button>
            <app-button
              variant="light"
              [label]="isSaving ? 'Guardando…' : 'Guardar'"
              [disabled]="isSaving || !puedeGuardar"
              (click)="guardarCambios()"
            ></app-button>
          </div>

          <!-- Confirmación de cierre -->
          <div
            *ngIf="showConfirmClose"
            class="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl"
          >
            <div class="bg-white text-black rounded-xl p-4 w-full max-w-xs text-center shadow">
              <p class="mb-3">Tienes cambios sin guardar. ¿Cerrar de todos modos?</p>
              <div class="flex justify-center gap-3">
                <button class="px-3 py-1 rounded bg-gray-200" (click)="showConfirmClose=false">Seguir editando</button>
                <button class="px-3 py-1 rounded bg-red-600 text-white" (click)="forzarCerrar()">Descartar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EditarFormularioComponent implements OnInit {
  @Input() tipo: 'Categoría' | 'Producto' | 'Unidad' | string = 'Elemento';

  // UI / estados
  isLoading = false;
  isSaving = false;
  modalAbierto = false;
  showConfirmClose = false;

  // límites
  readonly MAX_NAME = 80;
  readonly MAX_DESC = 300;
  readonly MAX_ABBR = 16;
  readonly MAX_IMG_MB = 5;
  readonly ALLOWED_IMG = ['image/jpeg','image/png','image/webp','image/jpg'];

  // búsqueda y selección
  searchQuery = '';
  selectedItem: Elemento | null = null;
  editedItem: Elemento = { id: 0, nombre: '', descripcion: '', abreviacion: '' };
  originalItem: Elemento | null = null;

  // data
  datos: Elemento[] = [];
  categorias: Category[] = [];
  unidades: Unit[] = [];

  // ---- Imagen (solo Producto) ----
  imageFile: File | null = null;       // archivo nuevo elegido
  previewUrl: string | null = null;    // URL temporal para previsualización
  editedRemoveImage = false;           // marcar para quitar imagen
  imgValidationMsg: string | null = null;

  // validaciones derivadas
  get nombreValido() { return !!(this.editedItem?.nombre || '').trim(); }
  get descRequeridaYVacia() {
    const req = this.tipo === 'Categoría' || this.tipo === 'Producto';
    return req && !((this.editedItem?.descripcion || '').trim());
  }
  get abbrMuyLarga() { return (this.tipo === 'Unidad') && ((this.editedItem?.abreviacion || '').length > this.MAX_ABBR); }
  get duplicadoPorNombre() {
    const nombre = (this.editedItem?.nombre || '').trim().toLowerCase();
    return !!this.datos.find(d => d.id !== this.editedItem?.id && d.nombre.trim().toLowerCase() === nombre);
  }
  get hayCambios() {
    if (!this.originalItem || !this.editedItem) return false;
    const O = this.originalItem; const E = this.editedItem;

    const baseChanged =
      (O.nombre || '') !== (E.nombre || '') ||
      (O.descripcion || '') !== (E.descripcion || '');

    const unidadChanged = this.tipo === 'Unidad'
      ? (O.abreviacion || '') !== (E.abreviacion || '')
      : false;

    const productoExtraChanged = this.tipo === 'Producto'
      ? (O.categoriaId || null) !== (E.categoriaId || null) ||
        (O.unidadId || null) !== (E.unidadId || null)
      : false;

    // Cambios de imagen cuentan también
    const imagenChanged = this.tipo === 'Producto'
      ? !!this.imageFile || this.editedRemoveImage
      : false;

    return baseChanged || unidadChanged || productoExtraChanged || imagenChanged;
  }
  get puedeGuardar() {
    if (!this.nombreValido) return false;
    if (this.descRequeridaYVacia) return false;
    if (this.abbrMuyLarga) return false;
    if (this.duplicadoPorNombre) return false;
    if (!this.hayCambios) return false;
    if (this.imgValidationMsg) return false;
    return true;
  }
  get placeholderPorTipo() {
    if (this.tipo === 'Unidad') return 'por nombre o abreviación…';
    return 'por nombre…';
  }

  // Imagen seleccionada (normalizada) para previsualización en tarjeta
  get selectedItemImagen(): string | null {
    return this.selectedItem?.imagen ?? null;
  }

  // Imagen actual del editado (si no hay preview)
  get editedItemImagenActual(): string | null {
    return this.editedItem.imagen ?? null;
  }

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private unitService: UnitService,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading = true;

    if (this.tipo === 'Categoría') {
      this.categoryService.getAll().subscribe({
        next: (data: Category[]) => {
          this.datos = data.map(c => ({
            id: c.id,
            nombre: c.name,
            descripcion: c.description || ''
          }));
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; this.toastr.error('Error cargando categorías'); }
      });
      return;
    }

    if (this.tipo === 'Producto') {
      // Productos + cat/unidades (para selects)
      this.productService.getAll().subscribe({
        next: (data: Product[]) => {
          this.datos = data.map(p => ({
            id: p.id,
            nombre: p.name,
            descripcion: p.description || '',
            categoriaId: p.productCategory?.id ?? null,
            categoriaNombre: p.productCategory?.name ?? null,
            unidadId: p.unit?.id ?? null,
            unidadNombre: p.unit?.name ?? null,
            unidadAbrev: p.unit?.abbreviation ?? null,
            imagen: normalizeImage(p.imageUrl) // ← clave para que el pipe resuelva
          }));
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; this.toastr.error('Error cargando productos'); }
      });

      this.categoryService.getAll().subscribe({
        next: (cats) => this.categorias = cats || [],
        error: () => this.toastr.warning('No se pudieron cargar categorías')
      });
      this.unitService.getAll().subscribe({
        next: (uns) => this.unidades = uns || [],
        error: () => this.toastr.warning('No se pudieron cargar unidades')
      });
      return;
    }

    if (this.tipo === 'Unidad') {
      this.unitService.getAll().subscribe({
        next: (data: Unit[]) => {
          this.datos = data.map(u => ({
            id: u.id,
            nombre: u.name,
            descripcion: u.description || '',
            abreviacion: u.abbreviation ?? null
          }));
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; this.toastr.error('Error cargando unidades'); }
      });
      return;
    }

    // Valor no soportado
    this.isLoading = false;
    this.datos = [];
    this.toastr.info('Este formulario soporta Categoría, Producto o Unidad.', 'Aviso');
  }

  resultadosFiltrados() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.datos;
    return this.datos.filter(item =>
      item.nombre.toLowerCase().includes(q) ||
      (this.tipo === 'Unidad' && ((item.abreviacion || '').toLowerCase().includes(q)))
    );
  }

  seleccionar(item: Elemento) {
    this.selectedItem = { ...item };
    this.searchQuery = '';
  }

  resetSeleccion(yLimpiarBuscador: boolean = false) {
    this.selectedItem = null;
    if (yLimpiarBuscador) this.searchQuery = '';
  }

  abrirModal() {
    if (!this.selectedItem) return;
    this.editedItem = {
      ...this.selectedItem,
      categoriaId: this.tipo === 'Producto' ? (this.selectedItem.categoriaId ?? null) : this.selectedItem.categoriaId,
      unidadId: this.tipo === 'Producto' ? (this.selectedItem.unidadId ?? null) : this.selectedItem.unidadId,
    };
    this.originalItem = { ...this.editedItem };

    // Reset estado de imagen
    this.clearSelectedFile();
    this.editedRemoveImage = false;
    this.imgValidationMsg = null;

    this.modalAbierto = true;
  }

  solicitarCerrarModal() {
    if (!this.hayCambios) {
      this.cerrarModal(true);
      return;
    }
    this.showConfirmClose = true;
  }

  forzarCerrar() {
    this.showConfirmClose = false;
    this.cerrarModal(true);
  }

  cerrarModal(force: boolean = false) {
    if (this.hayCambios && !force) {
      this.solicitarCerrarModal();
      return;
    }
    this.modalAbierto = false;
    this.showConfirmClose = false;

    // limpiar preview para liberar ObjectURL
    this.revokePreview();
    this.clearSelectedFile();
    this.imgValidationMsg = null;
    this.editedRemoveImage = false;
  }

  onNombreChange(v: string) {
    this.editedItem.nombre = (v || '').trimStart();
  }

  onDescripcionChange(v: string) {
    this.editedItem.descripcion = v || '';
  }

  onAbreviacionChange(v: string) {
    this.editedItem.abreviacion = (v || '').toUpperCase().trim();
  }

  private buildProductPayload() {
    const payload: any = {
      name: (this.editedItem.nombre || '').trim(),
      description: (this.editedItem.descripcion || '').trim(),
    };
    if (this.editedItem.categoriaId !== this.originalItem?.categoriaId && this.editedItem.categoriaId != null) {
      payload.productCategoryId = this.editedItem.categoriaId;
    }
    if (this.editedItem.unidadId !== this.originalItem?.unidadId && this.editedItem.unidadId != null) {
      payload.unitId = this.editedItem.unidadId;
    }
    return payload;
  }

  guardarCambios() {
    if (!this.puedeGuardar) return;
    this.isSaving = true;

    if (this.tipo === 'Categoría') {
      const payload = {
        name: (this.editedItem.nombre || '').trim(),
        description: (this.editedItem.descripcion || '').trim()
      };
      this.categoryService.update(this.editedItem.id, payload).subscribe({
        next: () => { this.toastr.success('Categoría actualizada correctamente'); this.postSave(); },
        error: () => { this.isSaving = false; this.toastr.error('Error al actualizar la categoría'); }
      });
      return;
    }

    if (this.tipo === 'Producto') {
      const payload = this.buildProductPayload();

      // 1) Actualiza datos base (si cambiaron)
      const baseCambios = (this.originalItem!.nombre !== this.editedItem.nombre)
        || (this.originalItem!.descripcion !== this.editedItem.descripcion)
        || (this.originalItem!.categoriaId !== this.editedItem.categoriaId)
        || (this.originalItem!.unidadId !== this.editedItem.unidadId);

      const continuarConImagen = () => {
        // 2) Subida o eliminación de imagen si corresponde
        if (this.imageFile) {
          const fd = new FormData();
          fd.append('image', this.imageFile);
          // intenta updateWithImage -> uploadImage -> fallback
          const anyService: any = this.productService as any;
          if (typeof anyService.updateWithImage === 'function') {
            anyService.updateWithImage(this.editedItem.id, fd).subscribe({
              next: () => { this.toastr.success('Imagen actualizada'); this.postSave(); },
              error: () => this.tryUploadFallback(fd)
            });
          } else {
            this.tryUploadFallback(fd);
          }
          return;
        }

        if (this.editedRemoveImage) {
          const anyService: any = this.productService as any;
          if (typeof anyService.removeImage === 'function') {
            anyService.removeImage(this.editedItem.id).subscribe({
              next: () => { this.toastr.success('Imagen eliminada'); this.postSave(); },
              error: () => this.tryRemoveFallback()
            });
          } else {
            this.tryRemoveFallback();
          }
          return;
        }

        // Si no hay cambios de imagen, termina
        this.postSave();
      };

      if (baseCambios) {
        this.productService.update(this.editedItem.id, payload).subscribe({
          next: () => {
            this.toastr.success('Producto actualizado correctamente');
            continuarConImagen();
          },
          error: () => { this.isSaving = false; this.toastr.error('Error al actualizar el producto'); }
        });
      } else {
        // Solo cambios de imagen
        continuarConImagen();
      }
      return;
    }

    if (this.tipo === 'Unidad') {
      const payload: Partial<Unit> = {
        name: (this.editedItem.nombre || '').trim(),
        description: (this.editedItem.descripcion || '').trim() || undefined,
        abbreviation: (this.editedItem.abreviacion || '').trim() || undefined
      };
      this.unitService.update(this.editedItem.id, payload).subscribe({
        next: () => { this.toastr.success('Unidad actualizada correctamente'); this.postSave(); },
        error: () => { this.isSaving = false; this.toastr.error('Error al actualizar la unidad'); }
      });
      return;
    }

    this.isSaving = false;
    this.toastr.info('Este formulario soporta Categoría, Producto o Unidad.', 'Aviso');
  }

  private tryUploadFallback(fd: FormData) {
    const anyService: any = this.productService as any;
    if (typeof anyService.uploadImage === 'function') {
      anyService.uploadImage(this.editedItem.id, fd).subscribe({
        next: () => { this.toastr.success('Imagen actualizada'); this.postSave(); },
        error: () => { this.isSaving = false; this.toastr.error('No se pudo actualizar la imagen'); }
      });
    } else {
      // último recurso: intentar update con multipart si el backend lo soporta
      const fd2 = new FormData();
      fd2.append('name', (this.editedItem.nombre || '').trim());
      fd2.append('description', (this.editedItem.descripcion || '').trim());
      if (this.editedItem.categoriaId != null) fd2.append('productCategoryId', String(this.editedItem.categoriaId));
      if (this.editedItem.unidadId != null) fd2.append('unitId', String(this.editedItem.unidadId));
      fd2.append('image', this.imageFile as Blob);
      if (typeof anyService.update === 'function') {
        anyService.update(this.editedItem.id, fd2).subscribe({
          next: () => { this.toastr.success('Imagen actualizada'); this.postSave(); },
          error: () => { this.isSaving = false; this.toastr.error('No se pudo actualizar la imagen'); }
        });
      } else {
        this.isSaving = false;
        this.toastr.error('No hay método disponible para subir imagen');
      }
    }
  }

  private tryRemoveFallback() {
    // Si no hay endpoint dedicado, intenta update con imageUrl null
    const anyService: any = this.productService as any;
    if (typeof anyService.update === 'function') {
      anyService.update(this.editedItem.id, { imageUrl: null }).subscribe({
        next: () => { this.toastr.success('Imagen eliminada'); this.postSave(); },
        error: () => { this.isSaving = false; this.toastr.error('No se pudo eliminar la imagen'); }
      });
    } else {
      this.isSaving = false;
      this.toastr.error('No hay método disponible para eliminar imagen');
    }
  }

  private postSave() {
    this.cargarDatos();
    this.selectedItem = { ...this.editedItem };

    // Actualiza la imagen visible según la acción realizada
    if (this.imageFile) {
      // si el backend renombra, recarga datos ya resuelve; como UX rápido muestra la preview
      this.selectedItem!.imagen = this.previewUrl || this.selectedItem!.imagen || null;
      this.editedItem.imagen = this.selectedItem!.imagen || null;
    } else if (this.editedRemoveImage) {
      this.selectedItem!.imagen = null;
      this.editedItem.imagen = null;
    }

    this.isSaving = false;
    this.cerrarModal(true);
  }

  onImgError() {
    if (this.selectedItem) this.selectedItem.imagen = null;
  }

  // ------- Imagen: handlers -------

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    this.applySelectedFile(file);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer || !e.dataTransfer.files?.length) return;
    const file = e.dataTransfer.files[0];
    this.applySelectedFile(file);
  }

  private applySelectedFile(file: File) {
    // Validaciones
    this.imgValidationMsg = null;
    if (!this.ALLOWED_IMG.includes(file.type)) {
      this.imgValidationMsg = 'Formato no permitido. Usa JPG, PNG o WEBP.';
      return;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > this.MAX_IMG_MB) {
      this.imgValidationMsg = `La imagen supera ${this.MAX_IMG_MB} MB.`;
      return;
    }

    // Set file y preview
    this.imageFile = file;
    this.editedRemoveImage = false; // si eliges nueva, ya no estás “quitando”
    this.revokePreview();
    this.previewUrl = URL.createObjectURL(file);
  }

  toggleRemoveImage() {
    this.editedRemoveImage = !this.editedRemoveImage;
    if (this.editedRemoveImage) {
      // si marcamos quitar, descartamos archivo/preview
      this.clearSelectedFile();
    }
  }

  clearSelectedFile() {
    this.imageFile = null;
    this.revokePreview();
    this.previewUrl = null;
    this.imgValidationMsg = null;
  }

  onPreviewError() {
    // Si la preview falla (raro), limpiar
    this.clearSelectedFile();
  }

  private revokePreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }
}
