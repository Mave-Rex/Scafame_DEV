import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoryService, Category } from '../../../services/category.service';
import { ProductService, Product } from '../../../services/product.service';
import { UnitService, Unit } from '../../../services/unit.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ingreso-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
  <div class="bg-black text-white p-4 sm:p-6 rounded-2xl w-full max-w-6xl">

    <!-- PRODUCTO -->
    <div *ngIf="tipo === 'Producto'" class="flex flex-col lg:flex-row gap-6">
      <!-- Formulario -->
      <div class="w-full lg:w-2/3 space-y-4">

        <!-- Nombre -->
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">
            Nombre:
          </label>
          <input
            type="text"
            class="px-4 py-2 rounded-lg text-black w-full outline-none"
            [(ngModel)]="nombre"
            name="nombre"
            #nombreCtrl="ngModel"
            [class.ring-2]="submitted && !nombre.trim()"
            [class.ring-red-400]="submitted && !nombre.trim()"
            required
          />
        </div>

        <!-- Descripción -->
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">
            Descripción:
          </label>
          <input
            type="text"
            class="px-4 py-2 rounded-lg text-black w-full outline-none"
            [(ngModel)]="descripcion"
            name="descripcion"
            #descCtrl="ngModel"
            [class.ring-2]="submitted && !descripcion.trim()"
            [class.ring-red-400]="submitted && !descripcion.trim()"
            required
          />
        </div>

        <!-- Categoría -->
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">
            Categoría:
          </label>
          <select
            [(ngModel)]="selectedCategoryId"
            name="categoria"
            #catCtrl="ngModel"
            class="text-black px-4 py-2 rounded-lg w-full outline-none"
            [class.ring-2]="submitted && !selectedCategoryId"
            [class.ring-red-400]="submitted && !selectedCategoryId"
            required
          >
            <option [ngValue]="null" disabled>Selecciona una categoría</option>
            <option *ngFor="let cat of categorias" [ngValue]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <!-- Unidad -->
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">
            Unidad:
          </label>
          <select
            [(ngModel)]="selectedUnitId"
            name="unidad"
            #uniCtrl="ngModel"
            class="text-black px-4 py-2 rounded-lg w-full outline-none"
            [class.ring-2]="submitted && !selectedUnitId"
            [class.ring-red-400]="submitted && !selectedUnitId"
            required
          >
            <option [ngValue]="null" disabled>Selecciona una unidad</option>
            <option *ngFor="let u of unidades" [ngValue]="u.id">
              {{ u.name }} <span *ngIf="u.abbreviation">({{u.abbreviation}})</span>
            </option>
          </select>
        </div>

        <!-- Stock mínimo -->
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">
            Stock mínimo:
          </label>
          <input
            type="number"
            min="0"
            class="px-4 py-2 rounded-lg text-black w-full outline-none"
            [(ngModel)]="stockMinimo"
            name="stock"
            #stockCtrl="ngModel"
            [class.ring-2]="submitted && isStockInvalid"
            [class.ring-red-400]="submitted && isStockInvalid"
            required
          />
        </div>
      </div>

      <!-- Imagen -->
      <div class="w-full lg:w-1/3 flex flex-col items-center justify-start gap-4">
        <input type="file" accept="image/*" class="hidden" #fileInput (change)="onFileSelected($event)" />
        <button type="button" (click)="fileInput.click()" class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full">
          Seleccionar Imagen
        </button>

        <div class="w-40 h-40 rounded-2xl overflow-hidden bg-gray-400 flex items-center justify-center"
             [class.ring-2]="submitted && !selectedFile"
             [class.ring-red-400]="submitted && !selectedFile">
          <ng-container *ngIf="previewUrl; else noImg">
            <img [src]="previewUrl" alt="Vista previa" class="object-cover w-full h-full" />
          </ng-container>
          <ng-template #noImg>
            <img src="assets/img/placeholder.png" alt="Sin imagen" class="object-cover w-full h-full" />
          </ng-template>
        </div>

        <span *ngIf="!previewUrl && selectedFile" class="text-xs text-black font-bold">
          {{ selectedFile.name }}
        </span>
      </div>
    </div>

    <!-- CATEGORÍA -->
    <div *ngIf="tipo === 'Categoría'" class="flex flex-col gap-6">
      <div class="w-full space-y-4">
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">Nombre:</label>
          <input type="text" class="px-4 py-2 rounded-lg text-black w-full outline-none"
                 [(ngModel)]="nombre" name="nombreCat"
                 [class.ring-2]="submitted && !nombre.trim()" [class.ring-red-400]="submitted && !nombre.trim()" required/>
        </div>
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">Descripción:</label>
          <input type="text" class="px-4 py-2 rounded-lg text-black w-full outline-none"
                 [(ngModel)]="descripcion" name="descCat"
                 [class.ring-2]="submitted && !descripcion.trim()" [class.ring-red-400]="submitted && !descripcion.trim()" required/>
        </div>
      </div>
    </div>

    <!-- UNIDAD -->
    <div *ngIf="tipo === 'Unidad'" class="flex flex-col gap-6">
      <div class="w-full space-y-4">
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">Nombre:</label>
          <input type="text" class="px-4 py-2 rounded-lg text-black w-full outline-none"
                 [(ngModel)]="nombre" name="nombreUni"
                 [class.ring-2]="submitted && !nombre.trim()" [class.ring-red-400]="submitted && !nombre.trim()" required/>
        </div>
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">Abreviación:</label>
          <input type="text" maxlength="16" class="px-4 py-2 rounded-lg text-black w-full outline-none"
                 [(ngModel)]="abreviacion" name="abrevUni"
                 [class.ring-2]="submitted && !abreviacion.trim()" [class.ring-red-400]="submitted && !abreviacion.trim()" required/>
        </div>
        <div class="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
          <label class="bg-white text-black px-4 py-2 rounded-lg font-bold w-full md:w-[150px] text-center md:text-left">Descripción:</label>
          <input type="text" class="px-4 py-2 rounded-lg text-black w-full outline-none"
                 [(ngModel)]="descripcion" name="descUni"
                 [class.ring-2]="submitted && !descripcion.trim()" [class.ring-red-400]="submitted && !descripcion.trim()" required/>
        </div>
      </div>
    </div>

    <!-- Botón Guardar (siempre habilitado) -->
    <div class="flex flex-col items-center mt-8">
      <button
        (click)="onGuardarClick()"
        class="bg-white text-black px-6 py-2 rounded-lg font-bold">
        {{ tituloFormulario }}
      </button>
    </div>
  </div>
  `
})
export class IngresoFormularioComponent implements OnInit {
  @Input() tipo: 'Producto' | 'Categoría' | 'Unidad' | string = 'Elemento';

  nombre = '';
  descripcion = '';
  abreviacion = '';
  stockMinimo: number | null = 0;

  selectedCategoryId: number | null = null;
  selectedUnitId: number | null = null;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  categorias: Category[] = [];
  productos: Product[] = [];
  unidades: Unit[] = [];

  submitted = false;

  /** Mantiene una referencia al <input type="file"> más reciente para poder vaciarlo. */
  private lastFileInputEl: HTMLInputElement | null = null;

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private productService: ProductService,
    private unitService: UnitService,
  ) {}

  get tituloFormulario(): string {
    return this.tipo === 'Producto'  ? 'Guardar producto'
         : this.tipo === 'Categoría' ? 'Guardar categoría'
         : this.tipo === 'Unidad'    ? 'Guardar unidad'
         : 'Guardar';
  }

  ngOnInit(): void {
    if (this.tipo === 'Producto') {
      this.categoryService.getAll().subscribe((data: Category[]) => (this.categorias = data));
      this.productService.getAll().subscribe((data: Product[]) => (this.productos = data));
      this.unitService.getAll().subscribe((data: Unit[]) => (this.unidades = data));
    }
    if (this.tipo === 'Categoría') this.categoryService.getAll().subscribe((d) => (this.categorias = d));
    if (this.tipo === 'Unidad') this.unitService.getAll().subscribe((d) => (this.unidades = d));
  }

  get isStockInvalid(): boolean {
    return this.stockMinimo === null
      || this.stockMinimo === undefined
      || Number.isNaN(this.stockMinimo as number)
      || (this.stockMinimo as number) < 0;
  }

  // Validación global (sin mostrar mensajes por campo)
  private isValid(): boolean {
    if (this.tipo === 'Producto') {
      return !!this.nombre.trim() &&
             !!this.descripcion.trim() &&
             !!this.selectedCategoryId &&
             !!this.selectedUnitId &&
             !this.isStockInvalid &&
             !!this.selectedFile;
    }
    if (this.tipo === 'Categoría') {
      return !!this.nombre.trim() && !!this.descripcion.trim();
    }
    if (this.tipo === 'Unidad') {
      return !!this.nombre.trim() && !!this.abreviacion.trim() && !!this.descripcion.trim();
    }
    return false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.lastFileInputEl = input; // guardamos referencia para poder vaciarlo luego

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSizeMB = 2;

      if (!validTypes.includes(file.type)) {
        this.toastr.error('La imagen debe ser JPG, PNG o WEBP');
        this.selectedFile = null;
        this.previewUrl = null;
        // Vaciar el value para que el mismo archivo pueda re-disparar el (change)
        input.value = '';
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        this.toastr.error(`La imagen no debe superar ${maxSizeMB} MB`);
        this.selectedFile = null;
        this.previewUrl = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        // IMPORTANTE: limpiar el value después de procesar para permitir volver a seleccionar
        // el mismo archivo o seleccionar nuevamente tras guardar.
        if (this.lastFileInputEl) this.lastFileInputEl.value = '';
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      // Si el usuario cancela el diálogo, aseguramos que el input quede limpio
      input.value = '';
    }
  }

  private focusFirstError() {
    const order = this.tipo === 'Producto'
      ? [
          { q: 'input[name="nombre"]', invalid: !this.nombre.trim() },
          { q: 'input[name="descripcion"]', invalid: !this.descripcion.trim() },
          { q: 'select[name="categoria"]', invalid: !this.selectedCategoryId },
          { q: 'select[name="unidad"]', invalid: !this.selectedUnitId },
          { q: 'input[name="stock"]', invalid: this.isStockInvalid },
        ]
      : this.tipo === 'Categoría'
      ? [
          { q: 'input[name="nombreCat"]', invalid: !this.nombre.trim() },
          { q: 'input[name="descCat"]', invalid: !this.descripcion.trim() },
        ]
      : [
          { q: 'input[name="nombreUni"]', invalid: !this.nombre.trim() },
          { q: 'input[name="abrevUni"]', invalid: !this.abreviacion.trim() },
          { q: 'input[name="descUni"]', invalid: !this.descripcion.trim() },
        ];

    const target = order.find(o => o.invalid);
    if (target) {
      const el = document.querySelector<HTMLElement>(target.q);
      el?.focus();
      setTimeout(() => el?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
    }
  }

  onGuardarClick() {
    this.submitted = true;
    if (!this.isValid()) {
      this.toastr.warning('Completa todos los campos requeridos', 'Faltan datos');
      this.focusFirstError();
      return;
    }
    this.guardar();
  }

  private resetCampos() {
    this.nombre = '';
    this.descripcion = '';
    this.abreviacion = '';
    this.stockMinimo = 0;
    this.selectedCategoryId = null;
    this.selectedUnitId = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.submitted = false;

    // Clave para permitir ingresar otro producto enseguida y re-seleccionar imagen
    if (this.lastFileInputEl) {
      this.lastFileInputEl.value = '';
      this.lastFileInputEl = null;
    }
  }

  private guardar() {
    const nombreVal = this.nombre.trim();
    const descripcionVal = this.descripcion.trim();
    const abrevVal = this.abreviacion.trim();

    if (this.tipo === 'Producto') {
      const dup = this.productos.find(p => p.name.trim().toLowerCase() === nombreVal.toLowerCase());
      if (dup) { this.toastr.error('Ya existe un producto con ese nombre'); return; }

      const formData = new FormData();
      formData.append('name', nombreVal);
      formData.append('description', descripcionVal);
      formData.append('productCategoryId', String(this.selectedCategoryId));
      formData.append('minimumStock', String(this.stockMinimo));
      formData.append('unitId', String(this.selectedUnitId));
      formData.append('image', this.selectedFile as File);

      this.productService.create(formData).subscribe({
        next: () => {
          this.toastr.success('Producto agregado correctamente');
          this.resetCampos();
          this.productService.getAll().subscribe((d) => (this.productos = d));
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Error al agregar producto')
      });
      return;
    }

    if (this.tipo === 'Categoría') {
      const dup = this.categorias.find(c => c.name.trim().toLowerCase() === nombreVal.toLowerCase());
      if (dup) { this.toastr.error('Ya existe una categoría con ese nombre'); return; }

      this.categoryService.create({ name: nombreVal, description: descripcionVal }).subscribe({
        next: () => {
          this.toastr.success('Categoría agregada correctamente');
          this.resetCampos();
          this.categoryService.getAll().subscribe((d) => (this.categorias = d));
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Error al agregar categoría')
      });
      return;
    }

    if (this.tipo === 'Unidad') {
      const dup = this.unidades.find(u => u.name.trim().toLowerCase() === nombreVal.toLowerCase());
      if (dup) { this.toastr.error('Ya existe una unidad con ese nombre'); return; }

      this.unitService.create({ name: nombreVal, abbreviation: abrevVal, description: descripcionVal }).subscribe({
        next: () => {
          this.toastr.success('Unidad agregada correctamente');
          this.resetCampos();
          this.unitService.getAll().subscribe((d) => (this.unidades = d));
        },
        error: (err) => this.toastr.error(err?.error?.message || 'Error al agregar unidad')
      });
      return;
    }
  }
}

