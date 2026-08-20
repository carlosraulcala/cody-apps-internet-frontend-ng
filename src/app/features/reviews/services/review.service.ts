import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Review, ReviewIn } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  // Endpoint base: si tu router en FastAPI está montado bajo /products o directo
  private productsUrl = `${environment.apiUrl}/products`;

  // Estado reactivo privado
  private _reviews = signal<Review[]>([]);
  public reviews = this._reviews.asReadonly();

  // Promedio de calificación (Computed Signal)
  public averageRating = computed(() => {
    const list = this._reviews();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / list.length).toFixed(1));
  });

  // GET /{product_id}/reviews
  loadReviews(productId?: number) {
    if (!productId) {
      this._reviews.set([]);
      return;
    }
    const url = `${this.productsUrl}/${productId}/reviews`;
    console.log('[ReviewService] GET reseñas desde:', url);
    this.http.get<Review[]>(url).subscribe({
      next: (data) => {
        console.log('[ReviewService] Reseñas recibidas:', data);
        this._reviews.set(data);
      },
      error: (err) => console.error('[ReviewService] Error al cargar reseñas:', err)
    });
  }

  // POST /{product_id}/reviews
  createReview(productId: number, payload: ReviewIn) {
    const url = `${this.productsUrl}/${productId}/reviews`;
    console.log('[ReviewService] POST reseña en:', url, payload);
    this.http.post<Review>(url, payload).subscribe({
      next: (res) => {
        console.log('[ReviewService] Reseña creada con éxito:', res);
        this.loadReviews(productId);
      },
      error: (err) => console.error('[ReviewService] Error al crear reseña:', err)
    });
  }

  // DELETE /{product_id}/reviews/{review_id}
  deleteReview(reviewId: number, productId?: number) {
    if (!productId) return;
    const url = `${this.productsUrl}/${productId}/reviews/${reviewId}`;
    console.log('[ReviewService] DELETE reseña en:', url);
    this.http.delete(url).subscribe({
      next: () => {
        console.log('[ReviewService] Reseña eliminada con éxito:', reviewId);
        this.loadReviews(productId);
      },
      error: (err) => console.error('[ReviewService] Error al eliminar reseña:', err)
    });
  }
}
