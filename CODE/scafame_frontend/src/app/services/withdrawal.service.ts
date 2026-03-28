import { Injectable } from '@angular/core';

export interface SelectedProduct {
  id: number;
  nombre: string;
  cantidad: number;
  stock: number;
  imagen?: string;
}

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private selected: SelectedProduct[] = [];

  getSelected(): SelectedProduct[] {
    return this.selected;
  }

  addProduct(product: { id: number; nombre: string; stock: number; imagen?: string }) {
    const found = this.selected.find(p => p.id === product.id);
    if (found) {
      if (found.cantidad < found.stock) {
        found.cantidad++;
      }
    } else {
      this.selected.push({
        id: product.id,
        nombre: product.nombre,
        cantidad: 1,
        stock: product.stock,
        imagen: product.imagen
      });
    }
  }

  increase(nombre: string) {
    const p = this.selected.find(p => p.nombre === nombre);
    if (p && p.cantidad < p.stock) {
      p.cantidad++;
    }
  }

  decrease(nombre: string) {
    const p = this.selected.find(p => p.nombre === nombre);
    if (p && p.cantidad > 1) {
      p.cantidad--;
    }
  }

  removeProduct(id: number) {
    this.selected = this.selected.filter(p => p.id !== id);
  }

  clear() {
    this.selected = [];
  }
}
