import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categories`;

  private _categories = signal<Category[]>([]);
  public categories = this._categories.asReadonly();

  loadCategories() {
    this.http.get<Category[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('Categories loaded:', data);
        this._categories.set(data);
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }
  
  createCategory(category: Omit<Category, 'id'>) {
    this.http.post<Category>(this.apiUrl, category).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('Error al crear', err)
    });
  }

  updateCategory(id: number, category: Partial<Category>) {
    this.http.put<Category>(`${this.apiUrl}/${id}`, category).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('Error al actualizar', err)
    });
  }

  deleteCategory(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadCategories(),
      error: (err) => console.error('Error al borrar', err)
    });
  }
}
