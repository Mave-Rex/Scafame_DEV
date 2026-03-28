import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


import { UserService, User } from '../services/user.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: [`
    /* ===== Scrollbar oscuro y discreto para el contenedor scrolleable ===== */
    /* Firefox */
    .scroll-area {
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.25) transparent;
    }
    /* WebKit */
    .scroll-area::-webkit-scrollbar { width: 8px; }
    .scroll-area::-webkit-scrollbar-track { background: transparent; }
    .scroll-area::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,0.25);
      border-radius: 9999px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .scroll-area::-webkit-scrollbar-thumb:hover {
      background-color: rgba(255,255,255,0.35);
    }
  `],
  template: `
<main class="min-h-[calc(100vh-120px)] p-4 sm:p-6 lg:p-8 font-display">
  <!-- Card negro centrado con altura limitada en md–xl y "nudge" hacia arriba -->
  <div
    class="mx-auto w-full bg-black text-white rounded-2xl shadow-lg
           sm:max-w-lg md:max-w-xl lg:max-w-2xl
           md:max-h-[calc(100vh-240px)] xl:max-h-[calc(100vh-240px)]
           overflow-visible md:overflow-hidden
           flex flex-col
           md:-mt-4 lg:-mt-6 xl:mt-0"
  >
    <!-- Título -->
    <h1 class="text-2xl sm:text-3xl font-bold px-4 sm:px-6 pt-4 sm:pt-6 pb-3 text-center">
      Editar Usuario
    </h1>

    <!-- CONTENIDO: scroll interno en md–xl. min-h-0 es CLAVE en layouts flex -->
    <div class="px-4 sm:px-6 pb-4 flex-1 min-h-0 md:overflow-y-auto xl:overflow-y-auto space-y-4 scroll-area">
      <!-- Buscador -->
      <div class="space-y-2">
        <input
          [(ngModel)]="searchTerm"
          name="searchTerm"
          type="text"
          placeholder="Buscar por nombre o correo"
          class="px-3 py-2 rounded text-black w-full shadow
                 focus:outline-none focus:ring-2 focus:ring-white/60"
          (ngModelChange)="onSearchChange($event)"
          aria-label="Buscar usuarios por nombre o correo"
        />

        <div *ngIf="loadingSearch" class="text-sm text-white/70 px-1" role="status" aria-live="polite">
          Buscando…
        </div>
        <div *ngIf="!loadingSearch && noResults" class="text-sm text-white/70 px-1">
          Sin coincidencias.
        </div>

        <div *ngIf="coincidencias.length > 0" class="bg-white rounded p-2 text-black shadow">
          <ul class="divide-y divide-black/10">
            <li
              *ngFor="let u of coincidencias"
              (click)="seleccionarUsuario(u)"
              class="py-2 px-2 cursor-pointer hover:bg-black/5 flex items-center justify-between"
            >
              <span class="text-sm">
                {{ u.firstname }} {{ u.lastname }} —
                <span class="text-black/70">{{ u.email }}</span>
              </span>
              <span class="text-xs bg-black text-white px-2 py-0.5 rounded">{{ u.role }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Formulario -->
      <form *ngIf="usuario" (ngSubmit)="guardarCambios()" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" name="firstname" [(ngModel)]="usuario.firstname" required
                 placeholder="Nombres"
                 class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" />
          <input type="text" name="lastname" [(ngModel)]="usuario.lastname" required
                 placeholder="Apellidos"
                 class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" />
        </div>

        <input type="text" name="username" [(ngModel)]="usuario.username" required
               placeholder="Nombre de usuario"
               class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" />

        <input type="email" name="email" [(ngModel)]="usuario.email" required
               placeholder="Correo electrónico"
               class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" />

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" name="area" [(ngModel)]="usuario.area" required
                 placeholder="Área"
                 class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" />
          
          <input type="text" name="jobTitle" [(ngModel)]="usuario.jobTitle" required
           placeholder="Cargo / Puesto"
           class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60" /> 
        </div>

        <div>
          <select name="role" [(ngModel)]="usuario.role" required
                  class="w-full rounded-md text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/60">
            <option value="admin">Administrador</option>
            <option value="manager">Bodeguero</option>
            <option value="user">Usuario</option>
          </select>
        </div>

        <!-- Cambio de contraseña (mejorado) -->
        <details class="rounded-md border border-white/10 overflow-hidden" [attr.aria-expanded]="true">
          <summary class="cursor-pointer select-none px-3 py-2 text-sm font-medium bg-white/10">
            Cambiar contraseña
          </summary>

          <div class="bg-white/10 p-3 space-y-3">
            <!-- Contraseña actual -->
            <div class="relative">
              <input
                [type]="showCurr ? 'text' : 'password'"
                [(ngModel)]="currentPassword"
                name="currentPassword"
                placeholder="Contraseña actual"
                class="w-full rounded-md text-black px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-white/60" />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2"
                (click)="showCurr = !showCurr"
                aria-label="Mostrar/Ocultar contraseña">
                <iconify-icon
                  [icon]="showCurr ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                  class="text-black"
                  width="22" height="22">
                </iconify-icon>
              </button>
            </div>

            <!-- Nueva contraseña -->
            <div class="relative">
              <input
                [type]="showNew ? 'text' : 'password'"
                [(ngModel)]="newPassword"
                name="newPassword"
                placeholder="Nueva contraseña"
                class="w-full rounded-md text-black px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-white/60" />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2"
                (click)="showNew = !showNew"
                aria-label="Mostrar/Ocultar contraseña">
                <iconify-icon
                  [icon]="showNew ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                  class="text-black"
                  width="22" height="22">
                </iconify-icon>
              </button>
            </div>

            <!-- Confirmación -->
            <div class="relative">
              <input
                [type]="showConf ? 'text' : 'password'"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                placeholder="Confirmar nueva contraseña"
                class="w-full rounded-md text-black px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-white/60" />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2"
                (click)="showConf = !showConf"
                aria-label="Mostrar/Ocultar contraseña">
                <iconify-icon
                  [icon]="showConf ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                  class="text-black"
                  width="22" height="22">
                </iconify-icon>
              </button>
            </div>

            <!-- Mensaje de error (solo cuando falle) -->
            <div class="text-xs text-red-300" *ngIf="passwordError">{{ passwordError }}</div>

            <div class="flex justify-end">
              <app-button
                label="Guardar contraseña"
                variant="dark"
                [disabled]="!canSubmitPassword() || _changingPw"
                [class.opacity-50]="!canSubmitPassword() || _changingPw"
                [class.cursor-not-allowed]="!canSubmitPassword() || _changingPw"
                [attr.aria-disabled]="!canSubmitPassword() || _changingPw"
                (click)="canSubmitPassword() && guardarPassword()" />
            </div>
          </div>
        </details>
      </form>
    </div>

    <!-- Footer de acciones -->
    <div class="px-4 sm:px-6 py-3 border-t border-white/10 bg-black/95">
      <div class="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <app-button label="Cancelar" variant="dark" (click)="goBack()" />
        <app-button
          label="Guardar Cambios"
          variant="dark"
          [disabled]="!canSubmitProfile()"
          [class.opacity-50]="!canSubmitProfile()"
          [class.cursor-not-allowed]="!canSubmitProfile()"
          [attr.aria-disabled]="!canSubmitProfile()"
          (click)="canSubmitProfile() && guardarCambios()" />
      </div>
    </div>
  </div>
</main>
  `
})
export class EditUserComponent {
  // ===== Estado general =====
  searchTerm = '';
  coincidencias: User[] = [];
  usuario: User | null = null;
  originalUser: User | null = null;        // snapshot para dirty-check
  allUsers: User[] = [];

  // Estados de búsqueda
  loadingSearch = false;
  noResults = false;
  private searchTimer: any = null;

  // ===== Cambio de contraseña =====
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  showCurr = false;
  showNew = false;
  showConf = false;

  // Flags de intento (para decidir si mostramos errores)
  private pwTried = false;
  private profileTried = false;

  // Evitar dobles envíos
  _changingPw = false;
  _savingProfile = false;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // ===== Utils =====
  private norm(v: any): string { return (v ?? '').toString().trim(); }
  private isOnlyDots(v: any): boolean { return /^[.]+$/.test((v ?? '').toString().trim()); }

  private roleToAccessLevel(role: 'admin'|'manager'|'user'): 'high'|'medium'|'low' {
    if (role === 'admin') return 'high';
    if (role === 'manager') return 'medium';
    return 'low';
  }

  // ===== Búsqueda con debounce =====
  onSearchChange(term: string) {
    this.searchTerm = term;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.buscarUsuarios(), 300);
  }

  buscarUsuarios() {
    const term = this.norm(this.searchTerm).toLowerCase();
    this.noResults = false;
    if (!term) { this.coincidencias = []; return; }

    const filtra = () => {
      this.filtrarCoincidencias(term);
      this.noResults = this.coincidencias.length === 0;
      this.loadingSearch = false;
    };

    this.loadingSearch = true;
    if (this.allUsers.length === 0) {
      this.userService.getAll().subscribe({
        next: (res) => { this.allUsers = res; filtra(); },
        error: () => { this.loadingSearch = false; this.toastr.error('Error al cargar usuarios'); }
      });
    } else {
      filtra();
    }
  }

  filtrarCoincidencias(term: string) {
    this.coincidencias = this.allUsers.filter((u) =>
      (`${u.firstname} ${u.lastname}`.toLowerCase().includes(term) ||
       u.email.toLowerCase().includes(term))
    );
  }

  seleccionarUsuario(user: User) {
    this.usuario = { ...user };
    this.originalUser = { ...user }; // referencia para detectar cambios
    this.searchTerm = `${user.firstname} ${user.lastname}`;
    this.coincidencias = [];
    // Reset sección contraseña
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.pwTried = false;
  }

  // ===== Dirty-check de perfil =====
  private shallowEqualProfile(a: User, b: User): boolean {
    const keys: (keyof User)[] = ['firstname','lastname','username','email','area','jobTitle','role'];
    return keys.every(k => this.norm(a[k]) === this.norm(b[k]));
  }

  isProfileDirty(): boolean {
    return !!(this.usuario && this.originalUser && !this.shallowEqualProfile(this.usuario, this.originalUser));
  }

  // ===== Validaciones de perfil (Guardar Cambios) =====
  private validateProfile(): string | null {
    if (!this.usuario) return 'No hay usuario seleccionado.';

    const required = [
      { key: 'firstname', label: 'Nombres' },
      { key: 'lastname',  label: 'Apellidos' },
      { key: 'username',  label: 'Nombre de usuario' },
      { key: 'email',     label: 'Correo electrónico' },
      { key: 'area',      label: 'Área' },
      { key: 'jobTitle',  label: 'Cargo / Puesto' },
      { key: 'role',      label: 'Rol' },
    ];

    for (const f of required) {
      const val = this.norm((this.usuario as any)[f.key]);
      if (!val || this.isOnlyDots(val)) {
        return `Completa el campo: ${f.label}.`;
      }
    }

    // Email básico (ajusta si backend exige más)
    const email = this.norm(this.usuario.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Correo electrónico inválido.';
    }

    // Rol válido
    const role = this.norm(this.usuario.role);
    if (!['admin', 'manager', 'user'].includes(role)) {
      return 'Rol inválido.';
    }

    return null; // OK
  }

  canSubmitProfile(): boolean {
    if (!this.usuario || !this.originalUser) return false;
    const err = this.validateProfile();
    return !err && this.isProfileDirty() && !this._savingProfile;
  }

  // ===== Guardar cambios generales =====
  guardarCambios() {
    if (!this.usuario) return;

    const issue = this.validateProfile();
    this.profileTried = true;
    if (issue) {
      this.toastr.warning(issue, 'Datos incompletos');
      return;
    }
    if (!this.isProfileDirty()) {
      this.toastr.info('No hay cambios para guardar');
      return;
    }
    if (this._savingProfile) return;
    this._savingProfile = true;

    const datosActualizados: Partial<User> = {};
    const u = this.usuario;

    if (this.norm(u.firstname)) datosActualizados.firstname = this.norm(u.firstname);
    if (this.norm(u.lastname))  datosActualizados.lastname  = this.norm(u.lastname);
    if (this.norm(u.username))  datosActualizados.username  = this.norm(u.username);
    if (this.norm(u.email))     datosActualizados.email     = this.norm(u.email);
    if (this.norm(u.area))      datosActualizados.area      = this.norm(u.area);
    if (this.norm(u.jobTitle))  datosActualizados.jobTitle  = this.norm(u.jobTitle);

    if (this.norm(u.role)) {
      const role = this.norm(u.role) as 'admin'|'user'|'manager';
      datosActualizados.role = role;
      (datosActualizados as any).accessLevel = this.roleToAccessLevel(role);
    }

    this.userService.update(this.usuario.id, datosActualizados).subscribe({
      next: () => {
        this.toastr.success('Usuario actualizado');
        // Mantén el comportamiento previo de navegación si lo deseas:
        this.router.navigate(['/users/list']);
        // Si prefieres quedarte en la página y actualizar el snapshot:
        // this.originalUser = { ...(this.usuario as User) };
      },
      error: (err) => {
        const msg = err?.error?.message || 'Error al actualizar';
        this.toastr.error(msg);
      }
    }).add(() => {
      this._savingProfile = false;
    });
  }

  // ===== Validación de contraseña =====
  private firstPasswordIssue(curr: string, next: string, conf: string): string | null {
    const c = this.norm(curr);
    const n = this.norm(next);
    const f = this.norm(conf);

    // Considerar "." como inválido (equivalente a vacío)
    const invalid = (s: string) => !s || this.isOnlyDots(s);

    if (invalid(c) || invalid(n) || invalid(f)) {
      return 'Completa todos los campos de contraseña.';
    }
    if (/\s/.test(next)) {
      return 'La nueva contraseña no debe contener espacios.';
    }
    if (n.length < 8) {
      return 'La nueva contraseña debe tener al menos 8 caracteres.';
    }
    // Reglas mínimas (sin checklist visible):
    if (!/[a-z]/.test(next)) return 'La nueva contraseña requiere al menos una letra minúscula.';
    if (!/[A-Z]/.test(next)) return 'La nueva contraseña requiere al menos una letra mayúscula.';
    if (!/\d/.test(next))    return 'La nueva contraseña requiere al menos un dígito.';
    if (!/[^A-Za-z0-9\s]/.test(next)) return 'La nueva contraseña requiere al menos un símbolo.';

    if (n === c) {
      return 'La nueva contraseña no puede ser igual a la actual.';
    }
    if (next !== conf) {
      return 'La confirmación no coincide.';
    }
    return null; // OK
  }

  canSubmitPassword(): boolean {
    const issue = this.firstPasswordIssue(this.currentPassword, this.newPassword, this.confirmPassword);
    return issue === null;
  }

  // ===== Guardar nueva contraseña =====
  guardarPassword() {
    if (!this.usuario) return;

    this.pwTried = true;
    const issue = this.firstPasswordIssue(this.currentPassword, this.newPassword, this.confirmPassword);
    this.passwordError = issue || '';

    if (issue) {
      this.toastr.warning(this.passwordError, 'Revisa tu contraseña');
      return;
    }

    if (this._changingPw) return;
    this._changingPw = true;

    this.userService.changePassword(this.usuario.id, {
      currentPassword: this.norm(this.currentPassword),
      newPassword: this.norm(this.newPassword)
    }).subscribe({
      next: () => {
        this.toastr.success('Contraseña actualizada');
        // Limpiar campos
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordError = '';
        this.pwTried = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo cambiar la contraseña';
        this.passwordError = msg;
        this.toastr.error(msg);
      }
    }).add(() => {
      this._changingPw = false;
    });
  }

  // ===== Navegación =====
  goBack() {
    if (this.isProfileDirty() || this.currentPassword || this.newPassword || this.confirmPassword) {
      const salir = confirm('Tienes cambios sin guardar. ¿Deseas salir de todos modos?');
      if (!salir) return;
    }
    this.router.navigate(['/users']);
  }

  // (Opcional) proteger recargas/cierres de pestaña cuando hay cambios
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: BeforeUnloadEvent) {
    if (this.isProfileDirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}
