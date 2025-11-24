const ReviewEndPoint = {
  CREATE: "/api/reviews",
  GET_BY_PRODUCT: (productId: number | string) => `/api/reviews/product/${productId}`,
};

export default ReviewEndPoint;

