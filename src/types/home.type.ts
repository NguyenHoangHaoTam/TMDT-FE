export type TProductImage = {
  id: number;
  url: string;
  altText: string;
};

export type TProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  discountRate: number;
  images: TProductImage[];
  ranking: number;
  isFeatured: boolean;
  content?: string;
};

export interface ProductPageResponse {
  content: TProductDetail[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}