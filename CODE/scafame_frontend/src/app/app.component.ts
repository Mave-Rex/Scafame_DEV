import { RouterOutlet } from '@angular/router';
import { AfterViewInit, Component, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private logoEl?: HTMLElement;
  private removeResize?: () => void;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    // contenedor
    const wrap = this.renderer.createElement('div');
    this.renderer.setStyle(wrap, 'position', 'fixed');
    this.renderer.setStyle(wrap, 'top', '48px');
    this.renderer.setStyle(wrap, 'right', '28px');
    this.renderer.setStyle(wrap, 'z-index', '2147483647'); // súper arriba
    this.renderer.setStyle(wrap, 'pointer-events', 'none'); // no bloquea clicks

    // imagen
    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', 'public/fame_logo.png');
    this.renderer.setAttribute(img, 'alt', 'FAME Logo');
    this.renderer.setStyle(img, 'height', '64px');
    this.renderer.setStyle(img, 'display', 'block');

    this.renderer.appendChild(wrap, img);
    this.renderer.appendChild(document.body, wrap);

    this.logoEl = wrap;

    // (opcional) ocultar en pantallas pequeñas, sin CSS
    const applyResponsive = () => {
      if (!this.logoEl) return;
      const show = window.innerWidth >= 1024; // lg
      this.renderer.setStyle(this.logoEl, 'display', show ? 'block' : 'none');
    };

    applyResponsive();
    const onResize = () => applyResponsive();
    window.addEventListener('resize', onResize);
    this.removeResize = () => window.removeEventListener('resize', onResize);
  }

  ngOnDestroy(): void {
    this.removeResize?.();
    if (this.logoEl) {
      this.renderer.removeChild(document.body, this.logoEl);
      this.logoEl = undefined;
    }
  }
}
