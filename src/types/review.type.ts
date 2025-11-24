export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO date string
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewCreateResponse {
  reviewId: number;
  message: string;
  createdAt: string;
}

export interface ProductReviewListResponse {
  productId: number;
  productName: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

