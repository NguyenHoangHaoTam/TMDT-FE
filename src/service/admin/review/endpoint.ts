class ReviewManageKeys {
  static readonly GET_ALL_REVIEWS = "GET_ALL_REVIEWS";
  static readonly DELETE_REVIEW = "DELETE_REVIEW";
}

const ReviewEndPoint = {
  GET_ALL: "/api/reviews/admin",
  ADMIN_ACTION: "/api/reviews/admin/action",
};

export { ReviewManageKeys };
export default ReviewEndPoint;

