export interface Product {
  id: string;
  name: string;
  price: number;
  priceRange?: {
    min: number;
    max: number;
  };
  category: ProductCategory;
  subcategory: string;
  images: string[];
  description: string;
  colors: string[];
  composition: string;
  fabricPattern?: string; // Only for fabric category
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

export type ProductCategory = 'men' | 'kids' | 'fabric';

export interface FilterOptions {
  category: ProductCategory | 'all';
  subcategory: string | 'all';
  priceRange: [number, number] | null;
  colors: string[];
  fabricPatterns: string[]; // For fabric filtering
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
}