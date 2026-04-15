import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  private readonly imageVersionKey = 'scafame_img_v';

  transform(value?: string | null): string {
    if (!value) return 'assets/img/placeholder.png';
    if (/^(https?:|blob:|data:)/i.test(value)) return value;

    const raw = String(value);
    const [rawPath, rawQuery] = raw.split('?');
    const base = environment.API_BASE?.replace(/\/+$/, '') ?? '';
    let path = rawPath.replace(/^\/+/, '');

    // Compatibilidad con rutas heredadas que incluyen /api/uploads/...
    if (/^api\/uploads\//i.test(path)) {
      path = path.replace(/^api\//i, '');
    }

    // Compatibilidad con registros históricos que solo guardaron filename
    if (!path.includes('/') && /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(path)) {
      path = `uploads/${path}`;
    }

    let resolved = `${base}/${path}`;

    if (/^uploads\//i.test(path)) {
      const version = this.getImageVersion();
      if (version) {
        resolved += (resolved.includes('?') ? '&' : '?') + `v=${encodeURIComponent(version)}`;
      }
    }

    if (rawQuery) {
      resolved += (resolved.includes('?') ? '&' : '?') + rawQuery;
    }

    return resolved;
  }

  private getImageVersion(): string | null {
    try {
      return localStorage.getItem(this.imageVersionKey);
    } catch {
      return null;
    }
  }
}
