import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ProductService } from '@features/products/services/product.service';
import { CartItem, CartItemIn, CartItemUpdate, CartItemDetail } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
    private http = inject(HttpClient);
    private productService = inject(ProductService);
    private apiUrl = `${environment.apiUrl}/cart`;

    // Estado reactivo privado
    private _items = signal<CartItem[]>([]);
    public items = this._items.asReadonly();

    // Lista enriquecida con los datos del producto (título, precio, subtotal)
    public cartDetails = computed<CartItemDetail[]>(() => {
        const productsMap = new Map(this.productService.products().map((p) => [p.id, p]));

        return this._items().map((item) => {
            const product = productsMap.get(item.product_id);
            const price = product?.price ?? 0;
            return {
                ...item,
                product,
                subtotal: price * item.quantity
            };
        });
    });

    // Total de unidades en el carrito
    public totalItems = computed(() =>
        this._items().reduce((acc, item) => acc + item.quantity, 0)
    );

    // Total a pagar
    public totalPrice = computed(() =>
        this.cartDetails().reduce((acc, item) => acc + item.subtotal, 0)
    );

    // GET /cart/
    loadCart() {
        this.productService.loadProducts();
        this.http.get<CartItem[]>(this.apiUrl).subscribe({
            next: (data) => {
                console.log('Items recibidos del backend:', data); // 👈 Revisa la consola del navegador
                this._items.set(data);
            },
            error: (err) => console.error('Error al cargar carrito:', err)
        });
    }

    // POST /cart/ o PATCH si ya existe (con validación estricta de stock)
    addToCart(payload: CartItemIn) {
        const product = this.productService.products().find((p) => p.id === payload.product_id);
        const maxStock = product?.stock ?? Infinity;

        const existingItem = this._items().find((item) => item.product_id === payload.product_id);
        const currentQty = existingItem?.quantity ?? 0;
        const requestedQty = payload.quantity || 1;
        const targetQty = currentQty + requestedQty;

        // No permitir superar el stock disponible
        if (targetQty > maxStock) {
            console.warn(`[CartService] Stock insuficiente. Máximo: ${maxStock}, Solicitado: ${targetQty}`);
            return;
        }

        if (existingItem) {
            this.updateQuantity(existingItem.id, targetQty);
        } else {
            this.http.post<CartItem>(this.apiUrl, payload).subscribe({
                next: () => this.loadCart(),
                error: (err) => console.error('Error al agregar al carrito:', err)
            });
        }
    }


    // PATCH /cart/{item_id}
    updateQuantity(itemId: number, quantity: number) {
        const item = this._items().find((i) => i.id === itemId);
        if (!item) return;

        const product = this.productService.products().find((p) => p.id === item.product_id);
        const maxStock = product?.stock ?? Infinity;

        if (quantity > maxStock) {
            console.warn(`[CartService] Stock insuficiente para item ${itemId}. Máximo: ${maxStock}, Solicitado: ${quantity}`);
            return;
        }

        const payload: CartItemUpdate = { quantity };
        this.http.patch<CartItem>(`${this.apiUrl}/${itemId}`, payload).subscribe({
            next: () => this.loadCart(),
            error: (err) => console.error('Error al actualizar cantidad:', err)
        });
    }

    // DELETE /cart/{item_id}
    removeItem(itemId: number) {
        this.http.delete(`${this.apiUrl}/${itemId}`).subscribe({
            next: () => this.loadCart(),
            error: (err) => console.error('Error al eliminar item:', err)
        });
    }

    // DELETE /cart/
    clearCart() {
        this.http.delete(this.apiUrl).subscribe({
            next: () => this._items.set([]),
            error: (err) => console.error('Error al vaciar carrito:', err)
        });
    }
}
