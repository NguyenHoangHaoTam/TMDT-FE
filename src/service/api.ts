const ApiEndPoint = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  PRODUCT_FEATURED: "/api/products/filter?filter=featured",
  PRODUCT_TAB: "/api/products/filter",
  PRODUCT_BY_CATEGORY_BY_ID: "/api/products/category",
  GET_CATEGORY: "/api/categories",
  DELETE_PRODUCT: "/api/products",
  PRODUCT: "/api/products",
  PRODUCT_ALL: "/api/products/all",
  PRODUCT_DETAIL: (idOrSlug: string) => `/api/products/detail/${idOrSlug}`,
  PRODUCT_BY_SLUG: (slug: string) => `/api/products/slug/${slug}`,
  USERS: "/api/users",
  GET_ORDER: "/api/orders/admin",
  EDIT_STATUS_ORDER: "/api/orders",
  CART: "/api/cart",
  CART_ADD: "/api/cart/add",
  CART_CLEAR: "/api/cart/clear",
  CART_REMOVE: (productId: number | string) => `/api/cart/item/${productId}`,
  ORDERS_CHECKOUT_VNPAY: "/api/orders/checkout-vnpay",
  ORDERS_VNPAY_RETURN: "/api/orders/vnpay-return",
  ORDER_DETAIL: (orderId: number | string) => `/api/orders/${orderId}`,
  ORDER_CANCEL: (orderId: number | string) => `/api/orders/${orderId}/cancel`,
  ORDER_CONFIRM_RECEIVED: (orderId: number | string) => `/api/orders/${orderId}/confirm-received`,
  ORDER_HISTORY_PERSONAL: "/api/orders/history/personal",
  ORDER_HISTORY_SHARED: "/api/orders/history/shared",
  // Coupon endpoints
  COUPON_INFO: (code: string) => `/api/coupons/${code}`,
  ADMIN_COUPONS: "/api/coupons/admin",
  COUPON_CREATE: "/api/coupons/create",
  COUPON_UPDATE: (id: number | string) => `/api/coupons/${id}`,
  COUPON_DELETE: (id: number | string) => `/api/coupons/${id}`,
  // Shared Cart endpoints
  SHARED_CART_CREATE: "/api/shared-carts/create",
  SHARED_CART_LIST: "/api/shared-carts/my-carts",
  SHARED_CART_DETAIL: (id: number | string) => `/api/shared-carts/${id}`,
  SHARED_CART_CLOSE: (id: number | string) => `/api/shared-carts/${id}/close`,
  SHARED_CART_CANCEL: (id: number | string) => `/api/shared-carts/${id}/cancel`,
  SHARED_CART_ADD_ITEM: "/api/shared-carts/add-item",
  SHARED_CART_UPDATE_QUANTITY: "/api/shared-carts/update-quantity",
  SHARED_CART_REMOVE_ITEM: "/api/shared-carts/remove-item",
  SHARED_CART_INVITE: "/api/shared-carts/invite",
  SHARED_CART_UPDATE_CONTRIBUTION: "/api/shared-carts/update-contribution",
  SHARED_CART_LEAVE: (id: number | string) => `/api/shared-carts/${id}/leave`,
  SHARED_CART_REMOVE_PARTICIPANT: (
    cartId: number | string,
    participantUserId: number | string
  ) => `/api/shared-carts/${cartId}/participants/${participantUserId}`,

  // dashboard

  REVENUE_CHART: "/api/dashboard/2-bieu-do-cot-revenue-chart",
  PIE_ORDER_CHART: "/api/dashboard/1-bieu-do-tron-Order-Summary",
  AREA_USER_CHART: "/api/dashboard/4-bieu-do-cot-users-chart",
  AREA_ORDER_CHART: "/api/dashboard/3-bieu-do-cot-orders-chart",
  TOP_PRODUCT: "/api/dashboard/6--bieu-do-cot-top-products",
  TOP_CATEGORY: "/api/dashboard/5-bieu-do-cot-top-categories",

  // group buy
  GROUP_BUY_ACTIVE: "/api/group-buy/campaigns/active",
  GROUP_BUY_COMMIT: "/api/group-buy/commit",
  GROUP_BUY_CREATE: "/api/group-buy/campaigns",
};

export default ApiEndPoint;
