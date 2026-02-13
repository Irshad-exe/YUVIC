export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  discount?: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total_items: number;
  delivery_fee: number;
  total: number;
  free_delivery_threshold: number;
}