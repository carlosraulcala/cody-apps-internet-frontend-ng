export interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number;
}

export interface ProductCreate {
  title: string;
  description?: string | null;
  price: number;
  stock?: number;
  category_id: number;
}

export interface ProductUpdate {
  title?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  category_id?: number;
}
