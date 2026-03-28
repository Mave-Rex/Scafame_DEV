import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  transform(value?: string | null): string {
    if (!value) return 'assets/img/placeholder.png';
    if (/^(https?:|blob:|data:)/i.test(value)) return value;
    const base = environment.API_BASE?.replace(/\/+$/, '') ?? '';
    const path = String(value).replace(/^\/+/, '');
    return `${base}/${path}`;
  }
}
