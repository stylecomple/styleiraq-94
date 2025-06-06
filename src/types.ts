
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categories: string[] | null;
  cover_image: string | null;
  images: string[] | null;
  colors: string[] | null;
  stock_quantity: number | null;
  discount_percentage: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export type CategoryType = 'all' | string;
