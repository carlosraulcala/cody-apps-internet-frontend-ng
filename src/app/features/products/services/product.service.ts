import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  private _products = signal<Product[]>([]);
  public products = this._products.asReadonly();

  loadProducts() {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (data) => this._products.set(data),
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  createProduct(product: Omit<Product, 'id'>) {
    this.http.post<Product>(this.apiUrl, product).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Error al crear producto', err)
    });
  }

  updateProduct(id: number, product: Partial<Product>) {
    this.http.put<Product>(`${this.apiUrl}/${id}`, product).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Error al actualizar producto', err)
    });
  }

  deleteProduct(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Error al borrar producto', err)
    });
  }
}
