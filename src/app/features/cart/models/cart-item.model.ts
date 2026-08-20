import { Product } from '@features/products/models/product.model';

// Schema devuelto por FastAPI (CartItemPublic)
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
}

// Body para POST /cart/ (CartItemIn)
export interface CartItemIn {
  product_id: number;
  quantity: number;
}

// Body para PATCH /cart/{item_id} (CartItemUpdate)
export interface CartItemUpdate {
  quantity: number;
}

// Item enriquecido para la vista del Frontend
export interface CartItemDetail extends CartItem {
  product?: Product;
  subtotal: number;
}
