
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock?: number;
  colors?: string[];
  images?: string[];
}

export type CategoryType = 'all' | string;
