// Schema devuelto por FastAPI (ReviewPublic)
export interface Review {
  id: number;
  rating: number; // 1 - 5 estrellas
  comment: string;
  user_id: number;
  product_id: number;
}

// Body enviado por el cliente (ReviewIn)
export interface ReviewIn {
  rating: number;
  comment: string;
}

// Schema interno de creación
export interface ReviewCreate extends ReviewIn {
  user_id: number;
  product_id: number;
}
